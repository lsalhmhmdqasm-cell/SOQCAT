<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['bank_transfer', 'e_wallet']); // تحويل بنكي أو محفظة إلكترونية
            $table->boolean('is_active')->default(true);

            // معلومات الحساب البنكي
            $table->string('bank_name')->nullable(); // بنك الكريمي، بنك اليمن الدولي، CAC، تضامن، إلخ
            $table->string('account_name')->nullable(); // اسم صاحب الحساب
            $table->string('account_number')->nullable(); // رقم الحساب
            $table->string('branch')->nullable(); // الفرع (اختياري)

            // معلومات المحفظة الإلكترونية
            $table->string('e_wallet_network')->nullable(); // الشبكة الموحدة، ثواني كاش، موبي كاش، إلخ
            $table->string('wallet_name')->nullable(); // اسم صاحب المحفظة
            $table->string('wallet_number')->nullable(); // رقم المحفظة/الهاتف

            $table->text('instructions')->nullable(); // تعليمات إضافية
            $table->timestamps();

            $table->index(['shop_id', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_methods');
    }
};
