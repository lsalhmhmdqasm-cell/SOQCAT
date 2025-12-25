<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('pricing_plans', 'web_enabled')) {
                $table->boolean('web_enabled')->nullable()->after('features');
            }
            if (! Schema::hasColumn('pricing_plans', 'mobile_enabled')) {
                $table->boolean('mobile_enabled')->nullable()->after('web_enabled');
            }
        });
    }

    public function down()
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            if (Schema::hasColumn('pricing_plans', 'web_enabled')) {
                $table->dropColumn('web_enabled');
            }
            if (Schema::hasColumn('pricing_plans', 'mobile_enabled')) {
                $table->dropColumn('mobile_enabled');
            }
        });
    }
};
