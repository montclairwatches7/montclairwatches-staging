<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS users (
                id            INT           AUTO_INCREMENT PRIMARY KEY,
                name          VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
                email         VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                password      VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                role          ENUM('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'user',
                phone         VARCHAR(20)   CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
                is_blocked    TINYINT(1)    DEFAULT 0,
                avatar        LONGTEXT      CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
                last_login    TIMESTAMP     NULL DEFAULT NULL,
                created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS users");
    }
};
