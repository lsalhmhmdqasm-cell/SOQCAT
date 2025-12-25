<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('shops', function (Blueprint $table) {
            if (! Schema::hasColumn('shops', 'enable_web')) {
                $table->boolean('enable_web')->default(true)->after('status');
            }
            if (! Schema::hasColumn('shops', 'enable_android')) {
                $table->boolean('enable_android')->default(true)->after('status');
            }
            if (! Schema::hasColumn('shops', 'enable_ios')) {
                $table->boolean('enable_ios')->default(true)->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('shops', function (Blueprint $table) {
            if (Schema::hasColumn('shops', 'enable_web')) {
                $table->dropColumn('enable_web');
            }
            if (Schema::hasColumn('shops', 'enable_android')) {
                $table->dropColumn('enable_android');
            }
            if (Schema::hasColumn('shops', 'enable_ios')) {
                $table->dropColumn('enable_ios');
            }
        });
    }
};
