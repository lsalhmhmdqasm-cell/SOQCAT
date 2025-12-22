<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Subscription;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Client::with('subscription');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('shop_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'required|string|max:20',
            'domain' => 'required|string|unique:clients,domain',
            'subscription_type' => 'required|in:monthly,yearly,lifetime',
            'plan_name' => 'required|string',
            'price' => 'required|numeric|min:0'
        ]);

        $client = Client::create([
            'shop_name' => $validated['shop_name'],
            'owner_name' => $validated['owner_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'domain' => $validated['domain'],
            'subscription_type' => $validated['subscription_type'],
            'status' => 'trial',
            'subscription_start' => now(),
            'subscription_end' => now()->addDays(14) // 14 days trial
        ]);

        // Create subscription
        Subscription::create([
            'client_id' => $client->id,
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'billing_cycle' => $validated['subscription_type'] === 'lifetime' ? 'yearly' : $validated['subscription_type'],
            'status' => 'active',
            'next_billing_date' => now()->addMonth()
        ]);

        return response()->json($client->load('subscription'), 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::findOrFail($id);
        $client->update($request->all());

        return response()->json($client);
    }

    public function suspend($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::findOrFail($id);
        $client->update(['status' => 'suspended']);

        return response()->json(['message' => 'Client suspended']);
    }

    public function activate($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::findOrFail($id);
        $client->update(['status' => 'active']);

        return response()->json(['message' => 'Client activated']);
    }

    public function extend($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'months' => 'required|integer|min:1'
        ]);

        $client = Client::findOrFail($id);
        $newEnd = $client->subscription_end 
            ? $client->subscription_end->addMonths($request->months)
            : now()->addMonths($request->months);

        $client->update(['subscription_end' => $newEnd]);

        return response()->json([
            'message' => 'Subscription extended',
            'new_end_date' => $newEnd
        ]);
    }

    public function destroy($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::findOrFail($id);
        $client->delete();

        return response()->json(['message' => 'Client deleted']);
    }
}
