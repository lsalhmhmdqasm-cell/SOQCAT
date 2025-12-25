<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            if ($user && $user->shop) {
                // Dynamic limit based on plan
                // Cache plan info to avoid DB query on every hit if possible, but for now direct query is safer
                // We can use a reasonable default if relation fails
                $limit = 1000;
                $planId = $user->shop->client?->subscription?->pricing_plan_id;
                if ($planId) {
                    $plan = \App\Models\PricingPlan::find($planId);
                    if ($plan && $plan->max_api_requests_per_day) {
                        $limit = $plan->max_api_requests_per_day;
                    }
                }

                return Limit::perDay($limit)->by($user->shop_id);
            }

            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/super_admin_routes.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
