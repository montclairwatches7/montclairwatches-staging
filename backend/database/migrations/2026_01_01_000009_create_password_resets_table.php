<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS password_resets (
              id          INT          AUTO_INCREMENT PRIMARY KEY,
              email       VARCHAR(255) NOT NULL,
              otp         VARCHAR(6)   NOT NULL,
              expires_at  TIMESTAMP    NOT NULL,
              created_at  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
              KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS password_resets");
    }
};
