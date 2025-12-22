<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pricing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Basic, Pro, Enterprise
            $table->text('description')->nullable();

            // أسعار الاشتراك
            $table->decimal('monthly_price', 10, 2)->nullable();
            $table->decimal('yearly_price', 10, 2)->nullable();

            // سعر الشراء لمرة واحدة
            $table->decimal('lifetime_price', 10, 2)->nullable();

            // الميزات
            $table->json('features'); // {"products": 100, "orders": "unlimited"}

            // الحدود
            $table->integer('max_products')->nullable();
            $table->integer('max_orders_per_month')->nullable();
            $table->integer('max_storage_mb')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pricing_plans');
    }
};
