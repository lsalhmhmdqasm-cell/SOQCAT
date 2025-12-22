<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $shopKey = $request->has('shop_id') ? (string) $request->shop_id : 'all';
        $catKey = $request->has('category') ? (string) $request->category : 'none';
        $key = 'products:list:shop:'.$shopKey.':cat:'.$catKey;

        $data = Cache::remember($key, 60, function () use ($query) {
            return $query->get();
        });

        return response()->json($data);
    }

    public function show($id)
    {
        return Product::with('shop')->findOrFail($id);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ensure Shop Admin only adds to their own shop
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
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::where('shop_id', $request->user()->shop_id)->findOrFail($id);
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
            'shop_id' => $request->user()->shop_id,
            'product_id' => $product->id,
            'changes' => array_keys($validated),
        ]);

        Cache::forget('products:list:shop:all:cat:none');
        Cache::forget('products:list:shop:'.$request->user()->shop_id.':cat:none');

        return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::where('shop_id', $request->user()->shop_id)->findOrFail($id);
        $this->authorize('delete', $product);
        $product->delete();

        Log::info('admin_product_deleted', [
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop_id,
            'product_id' => $product->id,
        ]);

        Cache::forget('products:list:shop:all:cat:none');
        Cache::forget('products:list:shop:'.$request->user()->shop_id.':cat:none');

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Get product recommendations
     */
    public function recommendations($id)
    {
        $product = Product::findOrFail($id);

        // Related products (same category)
        $related = Product::where('category', $product->category)
            ->where('id', '!=', $id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Popular products (most ordered)
        $popular = Product::where('is_active', true)
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
