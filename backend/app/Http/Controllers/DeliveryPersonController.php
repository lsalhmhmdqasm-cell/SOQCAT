<?php

namespace App\Http\Controllers;

use App\Models\DeliveryPerson;
use Illuminate\Http\Request;

class DeliveryPersonController extends Controller
{
    /**
     * Get all delivery persons for a shop
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliveryPersons = DeliveryPerson::where('shop_id', $request->user()->shop_id)
            ->get();

        return response()->json($deliveryPersons);
    }

    /**
     * Store a new delivery person
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'status' => 'nullable|in:available,busy,offline',
        ]);

        $deliveryPerson = DeliveryPerson::create([
            'shop_id' => $request->user()->shop_id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'status' => $validated['status'] ?? 'available',
        ]);

        return response()->json($deliveryPerson, 201);
    }

    /**
     * Update delivery person status
     */
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliveryPerson = DeliveryPerson::where('shop_id', $request->user()->shop_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:available,busy,offline',
        ]);

        $deliveryPerson->update($validated);

        return response()->json($deliveryPerson);
    }

    /**
     * Delete a delivery person
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliveryPerson = DeliveryPerson::where('shop_id', $request->user()->shop_id)
            ->findOrFail($id);

        $deliveryPerson->delete();

        return response()->json(['message' => 'Delivery person deleted successfully']);
    }
}
