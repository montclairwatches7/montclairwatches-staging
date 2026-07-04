<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS addresses (
              id          INT          AUTO_INCREMENT PRIMARY KEY,
              user_id     INT          NOT NULL,
              full_name   VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              street      VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
              city        VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
              zip         VARCHAR(20)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
              is_default  TINYINT(1)   DEFAULT 0,
              phone       VARCHAR(20)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              KEY user_id (user_id),
              CONSTRAINT fk_addresses_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS addresses");
    }
};
