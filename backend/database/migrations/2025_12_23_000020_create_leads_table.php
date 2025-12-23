<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name');
            $table->string('phone', 20);
            $table->enum('plan_type', ['basic', 'premium', 'enterprise']);
            $table->string('status')->default('new');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['plan_type', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leads');
    }
};
