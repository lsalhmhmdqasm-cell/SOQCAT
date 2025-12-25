<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('pricing_plans', 'web_enabled')) {
                $table->boolean('web_enabled')->nullable()->after('features');
            }
            if (! Schema::hasColumn('pricing_plans', 'android_enabled')) {
                $table->boolean('android_enabled')->nullable()->after('web_enabled');
            }
            if (! Schema::hasColumn('pricing_plans', 'ios_enabled')) {
                $table->boolean('ios_enabled')->nullable()->after('android_enabled');
            }
        });

        if (Schema::hasColumn('pricing_plans', 'mobile_enabled')) {
            DB::table('pricing_plans')->whereNull('android_enabled')->update(['android_enabled' => DB::raw('mobile_enabled')]);
            DB::table('pricing_plans')->whereNull('ios_enabled')->update(['ios_enabled' => DB::raw('mobile_enabled')]);
        }

        Schema::table('pricing_plans', function (Blueprint $table) {
            if (Schema::hasColumn('pricing_plans', 'mobile_enabled')) {
                $table->dropColumn('mobile_enabled');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('pricing_plans', 'mobile_enabled')) {
                $table->boolean('mobile_enabled')->nullable()->after('web_enabled');
            }
        });

        if (Schema::hasColumn('pricing_plans', 'android_enabled') && Schema::hasColumn('pricing_plans', 'ios_enabled')) {
            DB::table('pricing_plans')->update(['mobile_enabled' => DB::raw('(android_enabled OR ios_enabled)')]);
        }

        Schema::table('pricing_plans', function (Blueprint $table) {
            if (Schema::hasColumn('pricing_plans', 'ios_enabled')) {
                $table->dropColumn('ios_enabled');
            }
            if (Schema::hasColumn('pricing_plans', 'android_enabled')) {
                $table->dropColumn('android_enabled');
            }
        });
    }
};
