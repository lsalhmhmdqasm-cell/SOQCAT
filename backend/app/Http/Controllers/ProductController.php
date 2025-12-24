<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // 1. Try to get shop from Middleware (Secure Domain/Host Resolution)
        $shop = $request->shop;

        // 2. Fallback: Check explicit params (Only for testing/super-admin, can be removed for strict security)
        if (! $shop) {
             $shopId = $request->input('shop_id') ?? $request->header('X-Shop-Id');
             if (is_numeric($shopId)) {
                 $shop = \App\Models\Shop::find($shopId);
             }
        }

        if (! $shop) {
            return response()->json(['message' => 'Shop context required'], 422);
        }
        
        $shopId = $shop->id;

        $query = Product::where('is_active', true)->where('shop_id', $shopId);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $catKey = $request->has('category') ? (string) $request->category : 'none';
        $key = 'products:list:shop:'.$shopId.':cat:'.$catKey;

        $data = Cache::remember($key, 60, function () use ($query) {
            return $query->get();
        });

        return response()->json($data);
    }

    public function show($id)
    {
        $shopId = request()->header('X-Shop-Id');
        if (! is_numeric($shopId)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }

        return Product::with('shop')->where('shop_id', (int) $shopId)->findOrFail($id);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        // Ensure user belongs to a shop
        $shopId = $request->user()->shop_id;
        if (! $shopId) {
            return response()->json(['message' => 'No shop assigned'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|max:999999',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
        ]);

        $product = Product::create([
            'shop_id' => $shopId,
            ...$validated,
        ]);

        Log::info('admin_product_created', [
            'user_id' => $request->user()->id,
            'shop_id' => $shopId,
            'product_id' => $product->id,
        ]);

        Cache::forget('products:list:shop:all:cat:none');
        Cache::forget('products:list:shop:'.$shopId.':cat:none');

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $shopId = $request->user()->shop_id;
        $product = Product::where('shop_id', $shopId)->findOrFail($id);
        
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0|max:999999',
            'description' => 'sometimes|nullable|string|max:1000',
            'image' => 'sometimes|nullable|string|max:500',
            'category' => 'sometimes|nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $product->update($validated);

        Log::info('admin_product_updated', [
            'user_id' => $request->user()->id,
            'shop_id' => $shopId,
            'product_id' => $product->id,
            'changes' => array_keys($validated),
        ]);

        Cache::forget('products:list:shop:'.$shopId.':cat:none');

        return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
        $shopId = $request->user()->shop_id;
        $product = Product::where('shop_id', $shopId)->findOrFail($id);
        
        $this->authorize('delete', $product);
        
        $product->delete();

        Log::info('admin_product_deleted', [
            'user_id' => $request->user()->id,
            'shop_id' => $shopId,
            'product_id' => $product->id,
        ]);

        Cache::forget('products:list:shop:'.$shopId.':cat:none');

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Get product recommendations
     */
    public function recommendations($id)
    {
        $shopId = request()->header('X-Shop-Id');
        if (! is_numeric($shopId)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }
        $shopId = (int) $shopId;

        $product = Product::where('shop_id', $shopId)->findOrFail($id);

        // Related products (same category)
        $related = Product::where('category', $product->category)
            ->where('shop_id', $shopId)
            ->where('id', '!=', $id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Popular products (most ordered)
        $popular = Product::where('is_active', true)
            ->where('shop_id', $shopId)
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->limit(4)
            ->get();

        return response()->json([
            'related' => $related,
            'popular' => $popular,
        ]);
    }
}
