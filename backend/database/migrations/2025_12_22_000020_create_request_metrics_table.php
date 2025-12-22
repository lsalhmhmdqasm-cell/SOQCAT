<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('request_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->nullable()->constrained('shops')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('method', 10);
            $table->string('path');
            $table->string('route_name')->nullable();
            $table->unsignedSmallInteger('status_code')->default(200);
            $table->unsignedInteger('duration_ms')->default(0);
            $table->boolean('is_error')->default(false);
            $table->string('exception_class')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'created_at']);
            $table->index(['status_code', 'created_at']);
            $table->index('route_name');
        });
    }

    public function down()
    {
        Schema::dropIfExists('request_metrics');
    }
};

