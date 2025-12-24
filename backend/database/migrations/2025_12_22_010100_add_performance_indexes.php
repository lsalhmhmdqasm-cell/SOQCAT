<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categories')) {
            if (! Schema::hasColumn('categories', 'shop_id')) {
                Schema::table('categories', function (Blueprint $table) {
                    $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
                });
            }

            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->unique(['shop_id', 'name']);
                });
            } catch (\Throwable $e) {
            }

            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->index(['shop_id', 'is_active', 'order'], 'categories_shop_active_order_idx');
                });
            } catch (\Throwable $e) {
            }
        }

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
        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'shop_id')) {
            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->dropIndex('categories_shop_active_order_idx');
                });
            } catch (\Throwable $e) {
            }
            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->dropUnique(['shop_id', 'name']);
                });
            } catch (\Throwable $e) {
            }
            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->dropConstrainedForeignId('shop_id');
                });
            } catch (\Throwable $e) {
            }
        }

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
