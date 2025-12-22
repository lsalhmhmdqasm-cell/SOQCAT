<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['shop_id', 'is_active'], 'products_shop_active_idx');
            $table->index(['category', 'is_active'], 'products_category_active_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['shop_id', 'status'], 'orders_shop_status_idx');
            $table->index(['shop_id', 'created_at'], 'orders_shop_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_shop_active_idx');
            $table->dropIndex('products_category_active_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_shop_status_idx');
            $table->dropIndex('orders_shop_created_idx');
        });
    }
};
