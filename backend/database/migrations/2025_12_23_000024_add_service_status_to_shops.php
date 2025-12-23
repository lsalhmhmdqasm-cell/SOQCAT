<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('shops', function (Blueprint $table) {
            if (!Schema::hasColumn('shops', 'web_status')) {
                $table->enum('web_status', ['pending', 'active', 'disabled'])->default('disabled')->after('enable_web');
            }
            if (!Schema::hasColumn('shops', 'android_status')) {
                $table->enum('android_status', ['pending', 'active', 'disabled'])->default('disabled')->after('enable_android');
            }
            if (!Schema::hasColumn('shops', 'ios_status')) {
                $table->enum('ios_status', ['pending', 'active', 'disabled'])->default('disabled')->after('enable_ios');
            }
            if (!Schema::hasColumn('shops', 'web_provisioned_at')) {
                $table->dateTime('web_provisioned_at')->nullable()->after('web_status');
            }
            if (!Schema::hasColumn('shops', 'android_provisioned_at')) {
                $table->dateTime('android_provisioned_at')->nullable()->after('android_status');
            }
            if (!Schema::hasColumn('shops', 'ios_provisioned_at')) {
                $table->dateTime('ios_provisioned_at')->nullable()->after('ios_status');
            }
        });

        DB::table('shops')->where('enable_web', true)->update(['web_status' => 'pending']);
        DB::table('shops')->where('enable_web', false)->update(['web_status' => 'disabled']);
        DB::table('shops')->where('enable_android', true)->update(['android_status' => 'pending']);
        DB::table('shops')->where('enable_android', false)->update(['android_status' => 'disabled']);
        DB::table('shops')->where('enable_ios', true)->update(['ios_status' => 'pending']);
        DB::table('shops')->where('enable_ios', false)->update(['ios_status' => 'disabled']);
    }

    public function down()
    {
        Schema::table('shops', function (Blueprint $table) {
            if (Schema::hasColumn('shops', 'web_provisioned_at')) {
                $table->dropColumn('web_provisioned_at');
            }
            if (Schema::hasColumn('shops', 'android_provisioned_at')) {
                $table->dropColumn('android_provisioned_at');
            }
            if (Schema::hasColumn('shops', 'ios_provisioned_at')) {
                $table->dropColumn('ios_provisioned_at');
            }
            if (Schema::hasColumn('shops', 'web_status')) {
                $table->dropColumn('web_status');
            }
            if (Schema::hasColumn('shops', 'android_status')) {
                $table->dropColumn('android_status');
            }
            if (Schema::hasColumn('shops', 'ios_status')) {
                $table->dropColumn('ios_status');
            }
        });
    }
};
