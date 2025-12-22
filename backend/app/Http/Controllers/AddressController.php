<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;

class AddressController extends Controller
{
    /**
     * Get user's addresses
     */
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'details' => 'required|string',
            'is_default' => 'nullable|boolean'
        ]);

        $address = Address::create([
            'user_id' => $request->user()->id,
            'label' => $validated['label'],
            'details' => $validated['details'],
            'is_default' => $validated['is_default'] ?? false
        ]);

        // If marked as default, unset others
        if ($address->is_default) {
            $address->setAsDefault();
        }

        return response()->json($address, 201);
    }

    /**
     * Update an address
     */
    public function update(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'details' => 'sometimes|string',
            'is_default' => 'sometimes|boolean'
        ]);

        $address->update($validated);

        // If marked as default, unset others
        if (isset($validated['is_default']) && $validated['is_default']) {
            $address->setAsDefault();
        }

        return response()->json($address);
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }
}
