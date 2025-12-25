<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopServiceEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $platform = strtolower((string) $request->header('X-Client-Platform', 'web'));
        if (! in_array($platform, ['web', 'android', 'ios'], true)) {
            $platform = 'web';
        }

        $shopId = optional($request->user())->shop_id;
        if (! $shopId) {
            $routeParams = $request->route()?->parameters() ?? [];
            foreach (['shop_id', 'shopId', 'shop'] as $key) {
                if (isset($routeParams[$key]) && is_numeric($routeParams[$key])) {
                    $shopId = (int) $routeParams[$key];
                    break;
                }
            }
        }
        if (! $shopId) {
            $inputShopId = $request->input('shop_id');
            if (is_numeric($inputShopId)) {
                $shopId = (int) $inputShopId;
            }
        }
        if (! $shopId) {
            $headerShopId = $request->header('X-Shop-Id');
            if (is_numeric($headerShopId)) {
                $shopId = (int) $headerShopId;
            }
        }

        if ($shopId) {
            $shop = Shop::find($shopId);
            if ($shop) {
                $enabled = true;
                $active = true;
                if ($platform === 'web') {
                    $enabled = (bool) ($shop->enable_web ?? true);
                    $active = ($shop->web_status ?? 'active') === 'active';
                } elseif ($platform === 'android') {
                    $enabled = (bool) ($shop->enable_android ?? true);
                    $active = ($shop->android_status ?? 'active') === 'active';
                } elseif ($platform === 'ios') {
                    $enabled = (bool) ($shop->enable_ios ?? true);
                    $active = ($shop->ios_status ?? 'active') === 'active';
                }

                // Check Global Shop Status (from Client Subscription)
                if ($shop->status !== 'active') {
                    return response()->json(['message' => 'Your shop is currently '.$shop->status], 403);
                }

                if (! $enabled || ! $active) {
                    return response()->json(['message' => 'This service is not enabled for your shop'], 403);
                }
            }
        }

        return $next($request);
    }
}
