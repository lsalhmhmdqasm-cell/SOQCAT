<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for shop admin
     */
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shopId = $request->user()->shop_id;

        // Orders stats
        $ordersToday = Order::where('shop_id', $shopId)
            ->whereDate('created_at', today())
            ->count();

        $totalOrders = Order::where('shop_id', $shopId)->count();

        $pendingOrders = Order::where('shop_id', $shopId)
            ->where('status', 'pending')
            ->count();

        $completedOrders = Order::where('shop_id', $shopId)
            ->where('status', 'delivered')
            ->count();

        // Revenue stats
        $revenueToday = Order::where('shop_id', $shopId)
            ->whereDate('created_at', today())
            ->sum('total');

        $totalRevenue = Order::where('shop_id', $shopId)
            ->sum('total');

        // Products stats
        $totalProducts = Product::where('shop_id', $shopId)->count();
        $activeProducts = Product::where('shop_id', $shopId)
            ->where('is_active', true)
            ->count();

        // Customers stats
        $totalCustomers = Order::where('shop_id', $shopId)
            ->distinct('user_id')
            ->count('user_id');

        // Recent orders
        $recentOrders = Order::where('shop_id', $shopId)
            ->with('user')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'orders' => [
                'today' => $ordersToday,
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'completed' => $completedOrders
            ],
            'revenue' => [
                'today' => $revenueToday,
                'total' => $totalRevenue
            ],
            'products' => [
                'total' => $totalProducts,
                'active' => $activeProducts
            ],
            'customers' => [
                'total' => $totalCustomers
            ],
            'recent_orders' => $recentOrders
        ]);
    }
}
