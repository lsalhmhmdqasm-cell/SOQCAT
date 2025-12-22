<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('system_updates', function (Blueprint $table) {
            $table->id();
            $table->string('version', 20); // v1.0.0
            $table->string('title');
            $table->text('description');
            $table->text('changelog')->nullable();
            $table->date('release_date');
            $table->boolean('is_critical')->default(false);
            $table->json('applied_to')->nullable(); // [1, 2, 3] client_ids
            $table->timestamps();
            
            $table->index('version');
            $table->index('release_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('system_updates');
    }
};
