<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentMethod;

class PaymentMethodController extends Controller
{
    // Get payment methods for a shop (public)
    public function index($shopId)
    {
        $methods = PaymentMethod::where('shop_id', $shopId)
                                ->where('is_active', true)
                                ->get();
        
        return response()->json($methods);
    }

    // Get all payment methods for shop admin
    public function shopMethods(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $methods = PaymentMethod::where('shop_id', $request->user()->shop_id)->get();
        return response()->json($methods);
    }

    // Create payment method
    public function store(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:bank_transfer,e_wallet',
            'bank_name' => 'required_if:type,bank_transfer',
            'account_name' => 'required_if:type,bank_transfer',
            'account_number' => 'required_if:type,bank_transfer',
            'branch' => 'nullable|string',
            'e_wallet_network' => 'required_if:type,e_wallet',
            'wallet_name' => 'required_if:type,e_wallet',
            'wallet_number' => 'required_if:type,e_wallet',
            'instructions' => 'nullable|string'
        ]);

        $method = PaymentMethod::create([
            'shop_id' => $request->user()->shop_id,
            ...$validated
        ]);

        return response()->json($method, 201);
    }

    // Update payment method
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $method = PaymentMethod::where('shop_id', $request->user()->shop_id)
                               ->findOrFail($id);

        $method->update($request->all());
        return response()->json($method);
    }

    // Toggle active status
    public function toggleActive(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $method = PaymentMethod::where('shop_id', $request->user()->shop_id)
                               ->findOrFail($id);

        $method->update(['is_active' => !$method->is_active]);
        return response()->json($method);
    }

    // Delete payment method
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $method = PaymentMethod::where('shop_id', $request->user()->shop_id)
                               ->findOrFail($id);

        $method->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
