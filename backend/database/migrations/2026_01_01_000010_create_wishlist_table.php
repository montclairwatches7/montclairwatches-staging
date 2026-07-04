<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS wishlist (
              id          INT AUTO_INCREMENT PRIMARY KEY,
              user_id     INT NOT NULL,
              product_id  INT NOT NULL,
              created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY user_id (user_id, product_id),
              KEY product_id (product_id),
              CONSTRAINT fk_wishlist_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
              CONSTRAINT fk_wishlist_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS wishlist");
    }
};
