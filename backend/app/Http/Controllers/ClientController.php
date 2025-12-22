<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Shop;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    // Super Admin: Get all clients
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Eager load associated shop and subscription
        return Client::with(['shop', 'subscription'])->latest()->get();
    }

    // Super Admin: Add new client
    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'required|string',
            'business_name' => 'required|string',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        // Create Client
        $client = Client::create($validated);
        
        // Also create a default Shop for this client
        $shop = Shop::create([
            'name' => $validated['business_name'],
            'status' => 'active'
        ]);
        
        $client->shop_id = $shop->id;
        $client->save();

        return response()->json($client, 201);
    }

    // Super Admin: Update client
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'business_name' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $client = Client::findOrFail($id);
        $client->delete();
        // Also delete shop? Maybe keep for records or soft delete.
        return response()->json(['message' => 'Client deleted']);
    }
}
