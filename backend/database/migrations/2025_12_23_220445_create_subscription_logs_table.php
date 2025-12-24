<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('action'); // 'status_change', 'extended', 'plan_change', 'renewed'
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();
            $table->text('details')->nullable(); // JSON for extra details
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete(); // NULL = System
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index('client_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_logs');
    }
};
