<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StockController extends Controller
{
    // Update stock for a product
    public function updateStock(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'shelf_life_days' => 'nullable|integer|min:1|max:30',
        ]);

        $product = Product::where('shop_id', $request->user()->shop_id)
            ->findOrFail($id);

        // If expiry_date not provided but shelf_life_days is, calculate it
        if (! isset($validated['expiry_date']) && isset($validated['shelf_life_days'])) {
            $validated['expiry_date'] = Carbon::now()->addDays($validated['shelf_life_days'])->toDateString();
        }

        $product->update([
            'stock_quantity' => $validated['stock_quantity'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'shelf_life_days' => $validated['shelf_life_days'] ?? null,
            'stock_updated_at' => now(),
            'stock_status' => $this->calculateStockStatus($validated['stock_quantity'], $validated['expiry_date'] ?? null),
        ]);

        return response()->json($product);
    }

    // Get products expiring soon
    public function getExpiringSoon(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 2); // Default 2 days

        $products = Product::where('shop_id', $request->user()->shop_id)
            ->where('product_type', 'perishable')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays($days))
            ->where('expiry_date', '>=', Carbon::now())
            ->orderBy('expiry_date')
            ->get();

        return response()->json($products);
    }

    // Get expired products
    public function getExpired(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $products = Product::where('shop_id', $request->user()->shop_id)
            ->where('product_type', 'perishable')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::now())
            ->get();

        return response()->json($products);
    }

    // Mark expired products
    public function markExpired(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $count = Product::where('shop_id', $request->user()->shop_id)
            ->where('product_type', 'perishable')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::now())
            ->update([
                'stock_status' => 'expired',
                'is_active' => false,
            ]);

        return response()->json([
            'message' => 'Expired products marked',
            'count' => $count,
        ]);
    }

    // Calculate stock status
    private function calculateStockStatus($quantity, $expiryDate)
    {
        // Check if expired
        if ($expiryDate && Carbon::parse($expiryDate)->isPast()) {
            return 'expired';
        }

        // Check stock levels
        if ($quantity == 0) {
            return 'out_of_stock';
        } elseif ($quantity <= 10) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
