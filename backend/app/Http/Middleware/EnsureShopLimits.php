<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopLimits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $shop = $request->user()?->shop;

        if (! $shop) {
            return $next($request);
        }

        // Safety Nets: Locked Shop
        if ($shop->is_locked) {
             return response()->json([
                'code' => 'SHOP_LOCKED',
                'message' => 'Your shop is temporarily locked due to suspicious activity. Please contact support.',
            ], 403);
        }

        $subscription = $shop->subscription;
        if (! $subscription) {
             // Should be handled by EnsureShopServiceEnabled but good double check
             return $next($request);
        }
        
        // Quota: Max Products (only on create)
        if ($request->isMethod('post') && $request->routeIs('products.store')) {
             $plan = $subscription->pricingPlan; // Ensure this relation exists or use plan_name lookup
             // Actually subscription has pricing_plan_id now
             $plan = \App\Models\PricingPlan::find($subscription->pricing_plan_id);

             if ($plan && $plan->max_products !== null) {
                 if ($shop->products()->count() >= $plan->max_products) {
                     return response()->json([
                         'code' => 'QUOTA_EXCEEDED',
                         'message' => 'You have reached the maximum number of products for your plan.',
                         'meta' => ['limit' => $plan->max_products]
                     ], 429);
                 }
             }
        }

        // Quota: Max Orders (only on create)
        // Usually customer creates order, but we check shop's limit
        if ($request->isMethod('post') && $request->routeIs('orders.store')) {
             $plan = \App\Models\PricingPlan::find($subscription->pricing_plan_id);

             if ($plan && $plan->max_orders_per_month !== null) {
                 $currentMonthOrders = $shop->orders()
                     ->whereMonth('created_at', now()->month)
                     ->whereYear('created_at', now()->year)
                     ->count();
                 
                 if ($currentMonthOrders >= $plan->max_orders_per_month) {
                     return response()->json([
                         'code' => 'QUOTA_EXCEEDED',
                         'message' => 'This shop has reached its monthly order limit.',
                         'meta' => ['limit' => $plan->max_orders_per_month]
                     ], 429);
                 }
             }
        }

        return $next($request);
    }
}
