<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('wishlist')) {
            return;
        }

        if (! Schema::hasColumn('wishlist', 'shop_id')) {
            Schema::table('wishlist', function (Blueprint $table) {
                $table->foreignId('shop_id')->nullable()->constrained('shops')->cascadeOnDelete()->after('product_id');
                $table->index(['user_id', 'shop_id'], 'wishlist_user_shop_idx');
            });
        }

        DB::table('wishlist')
            ->select(['id', 'product_id'])
            ->whereNull('shop_id')
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                $productIds = collect($rows)->pluck('product_id')->unique()->values()->all();
                $shopMap = DB::table('products')->whereIn('id', $productIds)->pluck('shop_id', 'id');

                foreach ($rows as $row) {
                    $shopId = $shopMap[$row->product_id] ?? null;
                    if (! is_numeric($shopId)) {
                        DB::table('wishlist')->where('id', $row->id)->delete();

                        continue;
                    }

                    DB::table('wishlist')->where('id', $row->id)->update(['shop_id' => (int) $shopId]);
                }
            });

        if (DB::getDriverName() === 'mysql') {
            try {
                DB::statement('ALTER TABLE wishlist MODIFY shop_id BIGINT UNSIGNED NOT NULL');
            } catch (\Throwable) {
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('wishlist') || ! Schema::hasColumn('wishlist', 'shop_id')) {
            return;
        }

        Schema::table('wishlist', function (Blueprint $table) {
            $table->dropIndex('wishlist_user_shop_idx');
            $table->dropConstrainedForeignId('shop_id');
        });
    }
};
