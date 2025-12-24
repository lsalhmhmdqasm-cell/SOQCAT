<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Get all active categories
     */
    public function index(Request $request)
    {
        // Resolve shop via IdentifyTenant middleware (preferred)
        $shop = $request->shop;
        if (! $shop) {
            // Fallbacks for legacy callers
            $shopId = $request->input('shop_id') ?? $request->header('X-Shop-Id') ?? $request->user()?->shop_id;
            if (! is_numeric($shopId)) {
                return response()->json(['message' => 'shop_id is required'], 422);
            }
            $shopId = (int) $shopId;
        } else {
            $shopId = (int) $shop->id;
        }

        $categories = Category::where('shop_id', $shopId)->active()->ordered()->get();

        return response()->json($categories);
    }

    /**
     * Store a new category
     */
    public function store(Request $request)
    {
        // Check if user is shop admin
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if (! is_numeric($request->user()->shop_id)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }
        $shopId = (int) $request->user()->shop_id;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where(fn ($q) => $q->where('shop_id', $shopId)),
            ],
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $category = Category::create([
            ...$validated,
            'shop_id' => $shopId,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Delete a category
     */
    public function destroy(Request $request, $id)
    {
        // Check if user is shop admin
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if (! is_numeric($request->user()->shop_id)) {
            return response()->json(['message' => 'shop_id is required'], 422);
        }
        $shopId = (int) $request->user()->shop_id;

        $category = Category::where('shop_id', $shopId)->where('id', $id)->firstOrFail();
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
