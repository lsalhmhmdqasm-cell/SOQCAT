<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $host = preg_replace('/:\d+$/', '', $host);
        
        $shop = null;

        // 1. Priority: Find Shop by Domain (Production Standard)
        $shop = Shop::whereHas('client', function($q) use ($host) {
            $q->where('domain', $host);
        })->first();
             
        // 2. Fallback: Parse Subdomain (e.g. shop-1.qatshop.com)
        if (!$shop) {
            $parts = explode('.', $host);
            if (count($parts) > 0) {
                $subdomain = $parts[0];
                if (str_starts_with($subdomain, 'shop-')) {
                    $id = str_replace('shop-', '', $subdomain);
                    if (is_numeric($id)) {
                        $shop = Shop::find($id);
                    }
                }
            }
        }

        // 3. Last Resort: Check X-Shop-Id Header (Mobile Apps & Temporary Render URLs)
        // We allow this in Production now to support mobile apps and direct ID binding.
        if (!$shop && $request->hasHeader('X-Shop-Id')) {
            $shopId = $request->header('X-Shop-Id');
            if (is_numeric($shopId)) {
                $shop = Shop::find($shopId);
            }
        }

        if (!$shop) {
            $shopId = $request->query('shop_id');
            if (is_numeric($shopId)) {
                $shop = Shop::find((int) $shopId);
            }
        }

        // 4. Bind to Request
        if ($shop) {
            if ($shop->status !== 'active') {
                return response()->json(['message' => 'This shop is currently unavailable.'], 503);
            }

            $request->merge(['shop' => $shop]);
            $request->attributes->add(['shop' => $shop]);
            app()->instance('current_shop', $shop);
        }

        return $next($request);
    }
}
