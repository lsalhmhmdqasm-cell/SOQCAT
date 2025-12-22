<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    // Verify coupon validity
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $user = $request->user();
        $coupon = Coupon::where('shop_id', $user->shop_id)
            ->where('code', $request->code)
            ->first();

        if (! $coupon) {
            return response()->json(['message' => 'الكوبون غير صالح', 'valid' => false], 404);
        }

        if (! $coupon->isValidForUser($user->id, $request->amount)) {
            return response()->json(['message' => 'الشروط غير مستوفاة لهذا الكوبون', 'valid' => false], 422);
        }

        $discount = 0;
        if ($coupon->type === 'percentage') {
            $discount = ($coupon->value / 100) * $request->amount;
            if ($coupon->max_discount_amount && $discount > $coupon->max_discount_amount) {
                $discount = $coupon->max_discount_amount;
            }
        } else {
            $discount = $coupon->value;
        }

        return response()->json([
            'valid' => true,
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount_amount' => round($discount, 2),
        ]);
    }

    // Shop Admin: CRUD for coupons
    public function index(Request $request)
    {
        if (! $request->user()->isShopAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Coupon::where('shop_id', $request->user()->shop_id)->latest()->get();
    }

    public function store(Request $request)
    {
        if (! $request->user()->isShopAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric',
            'min_purchase' => 'nullable|numeric',
            'max_uses' => 'nullable|integer',
            'valid_until' => 'nullable|date',
        ]);

        $coupon = Coupon::create([
            'shop_id' => $request->user()->shop_id,
            ...$validated,
        ]);

        return response()->json($coupon, 201);
    }

    public function destroy(Request $request, $id)
    {
        if (! $request->user()->isShopAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $coupon = Coupon::where('shop_id', $request->user()->shop_id)->findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
