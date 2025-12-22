<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\PricingPlan;
use Illuminate\Http\Request;

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
            $query->where(function ($q) use ($search) {
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
            'price' => 'required|numeric|min:0',
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
            'subscription_end' => now()->addDays(14), // 14 days trial
        ]);

        // Create subscription
        Subscription::create([
            'client_id' => $client->id,
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'billing_cycle' => $validated['subscription_type'] === 'lifetime' ? 'yearly' : $validated['subscription_type'],
            'status' => 'active',
            'next_billing_date' => now()->addMonth(),
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
            'months' => 'required|integer|min:1',
        ]);

        $client = Client::findOrFail($id);
        $newEnd = $client->subscription_end
            ? $client->subscription_end->addMonths($request->months)
            : now()->addMonths($request->months);

        $client->update(['subscription_end' => $newEnd]);

        return response()->json([
            'message' => 'Subscription extended',
            'new_end_date' => $newEnd,
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

    public function plans(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(PricingPlan::where('is_active', true)->orderBy('sort_order')->get());
    }

    public function assignPlan($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'plan_name' => 'required|string|exists:pricing_plans,name',
            'billing_cycle' => 'required|in:monthly,yearly,lifetime',
        ]);

        $client = Client::findOrFail($id);
        $plan = PricingPlan::where('name', $request->plan_name)->firstOrFail();
        $price = $request->billing_cycle === 'monthly'
            ? ($plan->monthly_price ?? 0)
            : ($plan->yearly_price ?? 0);
        if ($request->billing_cycle === 'lifetime') {
            $price = $plan->lifetime_price ?? 0;
        }

        $sub = Subscription::firstOrNew(['client_id' => $client->id]);
        $sub->plan_name = $plan->name;
        $sub->price = $price;
        $sub->billing_cycle = $request->billing_cycle === 'lifetime' ? 'yearly' : $request->billing_cycle;
        $sub->features = $plan->features;
        $sub->status = 'active';
        $sub->next_billing_date = $request->billing_cycle === 'monthly'
            ? now()->addMonth()
            : now()->addYear();
        $sub->save();

        $client->subscription_type = $request->billing_cycle;
        $client->status = 'active';
        $client->subscription_start = now();
        $client->subscription_end = $request->billing_cycle === 'monthly'
            ? now()->addMonth()
            : ($request->billing_cycle === 'yearly' ? now()->addYear() : null);
        $client->save();

        return response()->json([
            'client' => $client->fresh()->load('subscription'),
            'subscription' => $sub,
        ]);
    }

    public function features($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::with('subscription')->findOrFail($id);
        $features = $client->subscription?->features;

        if (! $features) {
            if ($client->subscription) {
                $plan = PricingPlan::where('name', $client->subscription->plan_name)->first();
                $features = $plan?->features;
            }
        }

        return response()->json([
            'client_id' => $client->id,
            'plan' => $client->subscription?->plan_name,
            'features' => $features ?? [],
        ]);
    }

    public function sla($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client = Client::with('subscription')->findOrFail($id);
        $features = $client->subscription?->features ?? [];
        $planName = $client->subscription?->plan_name;
        if (empty($features) && $planName) {
            $plan = PricingPlan::where('name', $planName)->first();
            $features = $plan?->features ?? [];
        }

        $slaP95 = $features['sla_p95_ms'] ?? 300;
        $supportLevel = $features['support'] ?? 'normal';
        $backup = $features['backup'] ?? ['frequency' => 'weekly', 'retention_days' => 30];

        return response()->json([
            'client_id' => $client->id,
            'plan' => $planName,
            'sla' => [
                'p95_ms' => $slaP95,
                'support' => $supportLevel,
                'backup' => $backup,
            ],
        ]);
    }
}
