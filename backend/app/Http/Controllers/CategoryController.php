<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Get all active categories
     */
    public function index()
    {
        $categories = Category::active()->ordered()->get();
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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string',
            'order' => 'nullable|integer'
        ]);

        $category = Category::create($validated);

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

        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
