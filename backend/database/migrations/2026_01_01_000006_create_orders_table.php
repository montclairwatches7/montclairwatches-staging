<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS orders (
              id                INT             AUTO_INCREMENT PRIMARY KEY,
              user_id           INT             NOT NULL,
              total_amount      DECIMAL(10,2)   NOT NULL,
              status            ENUM(
                                  'payment_pending',
                                  'processing',
                                  'shipped',
                                  'out_for_delivery',
                                  'delivered',
                                  'cancelled',
                                  'refunded'
                                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'payment_pending',
              shipping_address  TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              payment_id        VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              tracking_number   VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              cancel_reason     TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              KEY user_id (user_id),
              KEY idx_orders_user (user_id),
              KEY idx_orders_status (status),
              CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");

        DB::statement("
            CREATE TABLE IF NOT EXISTS order_items (
              id          INT           AUTO_INCREMENT PRIMARY KEY,
              order_id    INT           NOT NULL,
              product_id  INT           NOT NULL,
              quantity    INT           NOT NULL,
              price       DECIMAL(10,2) NOT NULL,
              KEY order_id (order_id),
              KEY product_id (product_id),
              CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
              CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS order_items");
        DB::statement("DROP TABLE IF EXISTS orders");
    }
};
