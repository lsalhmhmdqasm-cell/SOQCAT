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
            if (! Schema::hasColumn('pricing_plans', 'monthly_price_web')) {
                $table->decimal('monthly_price_web', 10, 2)->nullable()->after('monthly_price');
            }
            if (! Schema::hasColumn('pricing_plans', 'monthly_price_android')) {
                $table->decimal('monthly_price_android', 10, 2)->nullable()->after('monthly_price_web');
            }
            if (! Schema::hasColumn('pricing_plans', 'monthly_price_ios')) {
                $table->decimal('monthly_price_ios', 10, 2)->nullable()->after('monthly_price_android');
            }

            if (! Schema::hasColumn('pricing_plans', 'yearly_price_web')) {
                $table->decimal('yearly_price_web', 10, 2)->nullable()->after('yearly_price');
            }
            if (! Schema::hasColumn('pricing_plans', 'yearly_price_android')) {
                $table->decimal('yearly_price_android', 10, 2)->nullable()->after('yearly_price_web');
            }
            if (! Schema::hasColumn('pricing_plans', 'yearly_price_ios')) {
                $table->decimal('yearly_price_ios', 10, 2)->nullable()->after('yearly_price_android');
            }

            if (! Schema::hasColumn('pricing_plans', 'lifetime_price_web')) {
                $table->decimal('lifetime_price_web', 10, 2)->nullable()->after('lifetime_price');
            }
            if (! Schema::hasColumn('pricing_plans', 'lifetime_price_android')) {
                $table->decimal('lifetime_price_android', 10, 2)->nullable()->after('lifetime_price_web');
            }
            if (! Schema::hasColumn('pricing_plans', 'lifetime_price_ios')) {
                $table->decimal('lifetime_price_ios', 10, 2)->nullable()->after('lifetime_price_android');
            }
        });

        if (Schema::hasTable('pricing_plans')) {
            DB::table('pricing_plans')
                ->whereNull('monthly_price_web')
                ->whereNotNull('monthly_price')
                ->update([
                    'monthly_price_web' => DB::raw('monthly_price'),
                    'monthly_price_android' => DB::raw('ROUND(monthly_price * 0.60, 2)'),
                    'monthly_price_ios' => DB::raw('ROUND(monthly_price * 0.60, 2)'),
                ]);

            DB::table('pricing_plans')
                ->whereNull('yearly_price_web')
                ->whereNotNull('yearly_price')
                ->update([
                    'yearly_price_web' => DB::raw('yearly_price'),
                    'yearly_price_android' => DB::raw('ROUND(yearly_price * 0.60, 2)'),
                    'yearly_price_ios' => DB::raw('ROUND(yearly_price * 0.60, 2)'),
                ]);

            DB::table('pricing_plans')
                ->whereNull('lifetime_price_web')
                ->whereNotNull('lifetime_price')
                ->update([
                    'lifetime_price_web' => DB::raw('lifetime_price'),
                    'lifetime_price_android' => DB::raw('ROUND(lifetime_price * 0.60, 2)'),
                    'lifetime_price_ios' => DB::raw('ROUND(lifetime_price * 0.60, 2)'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            $cols = [
                'monthly_price_web',
                'monthly_price_android',
                'monthly_price_ios',
                'yearly_price_web',
                'yearly_price_android',
                'yearly_price_ios',
                'lifetime_price_web',
                'lifetime_price_android',
                'lifetime_price_ios',
            ];

            foreach ($cols as $col) {
                if (Schema::hasColumn('pricing_plans', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

