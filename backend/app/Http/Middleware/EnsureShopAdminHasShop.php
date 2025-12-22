<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopAdminHasShop
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! $user->shop_id) {
            return response()->json(['message' => 'No shop assigned'], 400);
        }

        $response = $next($request);

        Log::info('admin_action', [
            'user_id' => $user->id,
            'shop_id' => $user->shop_id,
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
