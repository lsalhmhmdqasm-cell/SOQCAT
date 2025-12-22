<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Filter by Shop ID if provided, otherwise show all active
        $query = Product::where('is_active', true);

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json($query->get());
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
        if (!$shopId) return response()->json(['message' => 'No shop assigned'], 400);

        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $product = Product::create([
            'shop_id' => $shopId,
            ...$validated
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
         if ($request->user()->role !== 'shop_admin') return response()->json(['message' => 'Unauthorized'], 403);
         
         $product = Product::where('shop_id', $request->user()->shop_id)->findOrFail($id);
         
         $product->update($request->all());
         
         return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
         if ($request->user()->role !== 'shop_admin') return response()->json(['message' => 'Unauthorized'], 403);

         $product = Product::where('shop_id', $request->user()->shop_id)->findOrFail($id);
         $product->delete();
         
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
            'popular' => $popular
        ]);
    }
}
