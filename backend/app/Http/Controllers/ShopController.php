<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Shop;

class ShopController extends Controller
{
    public function index()
    {
        return Shop::all();
    }

    public function store(Request $request)
    {
        // Only Super Admin should do this
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|string', // URL or path
        ]);

        $shop = Shop::create($validated);

        return response()->json($shop, 201);
    }

    public function show($id)
    {
        return Shop::with('products')->findOrFail($id);
    }
}
