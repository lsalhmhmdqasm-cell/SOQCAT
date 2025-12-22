<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // جدول نقاط الولاء
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->integer('points')->default(0);
            $table->integer('total_earned')->default(0); // إجمالي النقاط المكتسبة
            $table->integer('total_spent')->default(0); // إجمالي النقاط المستخدمة
            $table->timestamps();
            
            $table->unique(['user_id', 'shop_id']);
        });

        // سجل نقاط الولاء
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['earned', 'spent', 'expired', 'bonus']);
            $table->integer('points');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // جدول الكوبونات
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('code')->unique(); // SAVE20, WELCOME10
            $table->enum('type', ['percentage', 'fixed']); // نسبة مئوية أو مبلغ ثابت
            $table->decimal('value', 10, 2); // 20% أو 1000 ر.ي
            $table->decimal('min_purchase', 10, 2)->nullable(); // الحد الأدنى للشراء
            $table->integer('max_uses')->nullable(); // عدد مرات الاستخدام الكلي
            $table->integer('max_uses_per_user')->default(1); // عدد مرات الاستخدام لكل مستخدم
            $table->integer('used_count')->default(0);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // استخدامات الكوبونات
        Schema::create('coupon_uses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();
        });

        // برنامج الإحالة
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade'); // المُحيل
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade'); // المُحال
            $table->string('referral_code', 20);
            $table->enum('status', ['pending', 'completed', 'rewarded'])->default('pending');
            $table->integer('referrer_reward')->default(0); // مكافأة المُحيل (نقاط)
            $table->integer('referred_reward')->default(0); // مكافأة المُحال (نقاط)
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['shop_id', 'referred_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('coupon_uses');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_points');
    }
};
