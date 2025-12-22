<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->string('plan_name', 100); // Basic, Pro, Enterprise
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly']);
            $table->json('features')->nullable(); // {"products": 100, "orders": "unlimited"}
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->date('next_billing_date')->nullable();
            $table->timestamps();
            
            $table->index('client_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('subscriptions');
    }
};
