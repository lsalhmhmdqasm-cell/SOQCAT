<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('subscriptions', 'pricing_plan_id')) {
                $table->foreignId('pricing_plan_id')->nullable()->after('client_id')->constrained('pricing_plans')->nullOnDelete();
                $table->index('pricing_plan_id');
            }
        });

        if (Schema::hasColumn('subscriptions', 'plan_name')) {
            $planMap = PricingPlan::query()->pluck('id', 'name')->all();
            foreach ($planMap as $name => $id) {
                DB::table('subscriptions')
                    ->whereNull('pricing_plan_id')
                    ->where('plan_name', $name)
                    ->update(['pricing_plan_id' => $id]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'pricing_plan_id')) {
                $table->dropConstrainedForeignId('pricing_plan_id');
            }
        });
    }
};
