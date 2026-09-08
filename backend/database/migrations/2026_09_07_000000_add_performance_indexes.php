<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders ADD INDEX idx_orders_payment_id (payment_id)");
        DB::statement("ALTER TABLE orders ADD INDEX idx_orders_created_at (created_at)");
        DB::statement("ALTER TABLE coupons ADD INDEX idx_coupons_status_expiry (status, expiry_date)");
        DB::statement("ALTER TABLE users ADD INDEX idx_users_role (role)");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders DROP INDEX idx_orders_payment_id");
        DB::statement("ALTER TABLE orders DROP INDEX idx_orders_created_at");
        DB::statement("ALTER TABLE coupons DROP INDEX idx_coupons_status_expiry");
        DB::statement("ALTER TABLE users DROP INDEX idx_users_role");
    }
};
