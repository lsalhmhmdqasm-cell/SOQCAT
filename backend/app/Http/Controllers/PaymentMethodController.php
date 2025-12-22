<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        $this->authorize('create', PaymentMethod::class);

        $validated = $request->validate([
            'type' => 'required|in:bank_transfer,e_wallet',
            'bank_name' => 'required_if:type,bank_transfer',
            'account_name' => 'required_if:type,bank_transfer',
            'account_number' => 'required_if:type,bank_transfer',
            'branch' => 'nullable|string',
            'e_wallet_network' => 'required_if:type,e_wallet',
            'wallet_name' => 'required_if:type,e_wallet',
            'wallet_number' => 'required_if:type,e_wallet',
            'instructions' => 'nullable|string',
        ]);

        $method = PaymentMethod::create([
            'shop_id' => $request->user()->shop_id,
            ...$validated,
        ]);

        Log::info('admin_payment_method_created', [
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop_id,
            'payment_method_id' => $method->id,
            'type' => $method->type,
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

        $this->authorize('update', $method);

        $validated = $request->validate([
            'type' => 'sometimes|in:bank_transfer,e_wallet',
            'bank_name' => 'sometimes|required_if:type,bank_transfer|nullable|string',
            'account_name' => 'sometimes|required_if:type,bank_transfer|nullable|string',
            'account_number' => 'sometimes|required_if:type,bank_transfer|nullable|string',
            'branch' => 'sometimes|nullable|string',
            'e_wallet_network' => 'sometimes|required_if:type,e_wallet|nullable|string',
            'wallet_name' => 'sometimes|required_if:type,e_wallet|nullable|string',
            'wallet_number' => 'sometimes|required_if:type,e_wallet|nullable|string',
            'instructions' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $method->update($validated);

        Log::info('admin_payment_method_updated', [
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop_id,
            'payment_method_id' => $method->id,
            'changes' => array_keys($validated),
        ]);

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

        $this->authorize('update', $method);

        $method->update(['is_active' => ! $method->is_active]);

        Log::info('admin_payment_method_toggled', [
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop_id,
            'payment_method_id' => $method->id,
            'is_active' => $method->is_active,
        ]);

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

        $this->authorize('delete', $method);

        $method->delete();

        Log::info('admin_payment_method_deleted', [
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop_id,
            'payment_method_id' => $method->id,
        ]);

        return response()->json(['message' => 'Deleted']);
    }
}
