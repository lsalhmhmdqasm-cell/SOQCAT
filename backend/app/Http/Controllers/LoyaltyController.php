<?php

namespace App\Http\Controllers;

use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTransaction;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    // Client: Get my loyalty points and history
    public function index(Request $request)
    {
        $user = $request->user();
        $points = $user->loyaltyPoints()->where('shop_id', $user->shop_id)->first();
        $transactions = $user->loyaltyTransactions()
            ->where('shop_id', $user->shop_id)
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'balance' => $points ? $points->points : 0,
            'total_earned' => $points ? $points->total_earned : 0,
            'history' => $transactions,
        ]);
    }

    // internal helper to add points
    public static function addPoints($user, $points, $type, $description, $orderId = null)
    {
        $loyalty = LoyaltyPoint::firstOrCreate(
            ['user_id' => $user->id, 'shop_id' => $user->shop_id],
            ['points' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );

        $loyalty->increment('points', $points);
        $loyalty->increment('total_earned', $points);

        LoyaltyTransaction::create([
            'user_id' => $user->id,
            'shop_id' => $user->shop_id,
            'points' => $points,
            'type' => $type,
            'description' => $description,
            'order_id' => $orderId,
        ]);
    }
}
