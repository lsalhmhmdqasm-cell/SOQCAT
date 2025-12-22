<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // طريقة الدفع المختارة
            $table->enum('payment_method', ['bank_transfer', 'e_wallet', 'cash_on_delivery'])
                  ->default('cash_on_delivery')
                  ->after('total');
            
            // معلومات الدفع
            $table->string('payment_receipt')->nullable()->after('payment_method'); // صورة الإيصال
            $table->string('payment_reference')->nullable()->after('payment_receipt'); // رقم العملية/الحوالة
            $table->enum('payment_status', ['pending', 'verified', 'rejected'])
                  ->default('pending')
                  ->after('payment_reference');
            $table->text('payment_notes')->nullable()->after('payment_status'); // ملاحظات من صاحب المحل
            $table->timestamp('payment_verified_at')->nullable()->after('payment_notes');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_receipt',
                'payment_reference',
                'payment_status',
                'payment_notes',
                'payment_verified_at'
            ]);
        });
    }
};
