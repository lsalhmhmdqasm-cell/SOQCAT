<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name');
            $table->string('owner_name');
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->string('domain')->unique(); // shop1.qatshop.com
            $table->string('logo_url', 500)->nullable();
            $table->string('primary_color', 7)->default('#10b981');
            $table->string('secondary_color', 7)->default('#059669');
            $table->enum('status', ['active', 'suspended', 'trial', 'expired'])->default('trial');
            $table->enum('subscription_type', ['monthly', 'yearly', 'lifetime'])->default('monthly');
            $table->date('subscription_start')->nullable();
            $table->date('subscription_end')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('subscription_end');
        });
    }

    public function down()
    {
        Schema::dropIfExists('clients');
    }
};
