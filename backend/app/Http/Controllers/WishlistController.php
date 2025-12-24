<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    private function resolveShopId(Request $request): ?int
    {
        $shopId = optional($request->user())->shop_id;
        if (is_numeric($shopId)) {
            return (int) $shopId;
        }

        $shopId = $request->input('shop_id');
        if (is_numeric($shopId)) {
            return (int) $shopId;
        }

        $shopId = $request->header('X-Shop-Id');
        if (is_numeric($shopId)) {
            return (int) $shopId;
        }

        return null;
    }

    /**
     * Get user's wishlist
     */
    public function index(Request $request)
    {
        $shopId = $this->resolveShopId($request);
        if (! is_numeric($shopId)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }

        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('shop_id', (int) $shopId)
            ->whereHas('product', fn ($q) => $q->where('shop_id', (int) $shopId))
            ->with('product')
            ->get();

        return response()->json($wishlist);
    }

    /**
     * Toggle product in wishlist
     */
    public function toggle(Request $request, $productId)
    {
        $shopId = $this->resolveShopId($request);
        if (! is_numeric($shopId)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }
        $shopId = (int) $shopId;

        Product::where('shop_id', $shopId)->findOrFail($productId);

        $userId = $request->user()->id;

        $existing = Wishlist::where('user_id', $userId)
            ->where('shop_id', $shopId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            // Remove from wishlist
            $existing->delete();

            return response()->json([
                'message' => 'Removed from wishlist',
                'is_favorite' => false,
            ]);
        } else {
            // Add to wishlist
            Wishlist::create([
                'user_id' => $userId,
                'shop_id' => $shopId,
                'product_id' => $productId,
            ]);

            return response()->json([
                'message' => 'Added to wishlist',
                'is_favorite' => true,
            ]);
        }
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request, $productId)
    {
        $shopId = $this->resolveShopId($request);
        if (! is_numeric($shopId)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }

        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('shop_id', (int) $shopId)
            ->where('product_id', $productId)
            ->exists();

        return response()->json(['is_favorite' => $exists]);
    }
}
