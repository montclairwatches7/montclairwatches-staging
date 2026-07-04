<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS categories (
                id          INT           AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                slug        VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
                status      ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
                created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                image_url   VARCHAR(500)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
                UNIQUE KEY name (name),
                UNIQUE KEY slug (slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS categories");
    }
};
