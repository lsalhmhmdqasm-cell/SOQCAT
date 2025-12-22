<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivery_person_id')->nullable()->after('status')->constrained('delivery_persons')->nullOnDelete();
            $table->timestamp('estimated_delivery_time')->nullable()->after('delivery_person_id');
            $table->decimal('delivery_fee', 8, 2)->default(0)->after('estimated_delivery_time');
            $table->string('tracking_number')->unique()->nullable()->after('delivery_fee');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['delivery_person_id']);
            $table->dropColumn(['delivery_person_id', 'estimated_delivery_time', 'delivery_fee', 'tracking_number']);
        });
    }
};
