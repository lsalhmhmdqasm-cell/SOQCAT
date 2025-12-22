<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clients', function (Blueprint $table) {
            // إضافة نوع الترخيص
            $table->enum('license_type', ['subscription', 'lifetime'])->default('subscription')->after('subscription_type');
            
            // المبلغ المدفوع (للـ lifetime)
            $table->decimal('paid_amount', 10, 2)->nullable()->after('license_type');
            
            // تاريخ الدفع
            $table->date('payment_date')->nullable()->after('paid_amount');
        });
    }

    public function down()
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['license_type', 'paid_amount', 'payment_date']);
        });
    }
};
