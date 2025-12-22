<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // نوع المنتج
            $table->enum('product_type', ['regular', 'perishable'])->default('regular')->after('category');

            // الكمية المتوفرة
            $table->integer('stock_quantity')->default(0)->after('product_type');

            // تاريخ الصلاحية (للمنتجات القابلة للتلف)
            $table->date('expiry_date')->nullable()->after('stock_quantity');

            // عدد أيام الصلاحية (1، 2، 3 أيام)
            $table->integer('shelf_life_days')->nullable()->after('expiry_date');

            // تاريخ آخر تحديث للمخزون
            $table->timestamp('stock_updated_at')->nullable()->after('shelf_life_days');

            // حالة المنتج
            $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock', 'expired'])
                ->default('in_stock')
                ->after('stock_updated_at');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'product_type',
                'stock_quantity',
                'expiry_date',
                'shelf_life_days',
                'stock_updated_at',
                'stock_status',
            ]);
        });
    }
};
