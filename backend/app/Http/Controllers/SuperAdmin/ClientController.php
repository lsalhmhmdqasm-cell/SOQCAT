<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Jobs\ProvisionAndroidApp;
use App\Jobs\ProvisionIOSApp;
use App\Jobs\ProvisionWebShop;
use App\Models\Client;
use App\Models\PricingPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'pricing_plan_id' => 'required|integer|exists:pricing_plans,id',
        ]);

        $plan = PricingPlan::findOrFail((int) $validated['pricing_plan_id']);

        return DB::transaction(function () use ($validated, $plan) {
            $client = Client::create([
                'shop_name' => $validated['shop_name'],
                'owner_name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'domain' => $validated['domain'],
                'subscription_type' => $validated['subscription_type'],
                'status' => 'trial',
                'subscription_start' => now(),
                'subscription_end' => now()->addDays(14),
            ]);

            $shop = \App\Models\Shop::create([
                'name' => $validated['shop_name'],
                'description' => 'محل مرتبط بالعميل من لوحة المدير العام',
                'status' => 'active',
                'delivery_fee' => 1000,
                'enable_web' => (bool) ($plan->web_enabled ?? false),
                'enable_android' => (bool) ($plan->android_enabled ?? false),
                'enable_ios' => (bool) ($plan->ios_enabled ?? false),
            ]);

            $client->shop_id = $shop->id;
            $client->save();

            if ($shop->enable_web && $shop->web_status === 'pending') {
                ProvisionWebShop::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_android && $shop->android_status === 'pending') {
                ProvisionAndroidApp::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_ios && $shop->ios_status === 'pending') {
                ProvisionIOSApp::dispatch($shop->id)->afterCommit();
            }

            $price = $validated['subscription_type'] === 'monthly'
                ? ($plan->monthly_price ?? 0)
                : ($validated['subscription_type'] === 'yearly' ? ($plan->yearly_price ?? 0) : ($plan->lifetime_price ?? 0));

            Subscription::create([
                'client_id' => $client->id,
                'pricing_plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $price,
                'billing_cycle' => $validated['subscription_type'] === 'lifetime' ? 'yearly' : $validated['subscription_type'],
                'status' => 'active',
                'next_billing_date' => now()->addMonth(),
            ]);

            return response()->json($client->load('subscription'), 201);
        });
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
 
    public function storePlan(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'features' => 'required|array',
            'web_enabled' => 'required|boolean',
            'android_enabled' => 'required|boolean',
            'ios_enabled' => 'required|boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $plan = PricingPlan::create(array_merge($validated, [
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]));
        return response()->json($plan, 201);
    }
 
    public function updatePlan(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $plan = PricingPlan::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'web_enabled' => 'sometimes|boolean',
            'android_enabled' => 'sometimes|boolean',
            'ios_enabled' => 'sometimes|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);
        $plan->update($validated);
        return response()->json($plan);
    }
 
    public function deletePlan(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $plan = PricingPlan::findOrFail($id);
        $plan->delete();
        return response()->json(['message' => 'Deleted']);
    }
 
    public function togglePlan(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $plan = PricingPlan::findOrFail($id);
        $plan->is_active = ! $plan->is_active;
        $plan->save();
        return response()->json($plan);
    }

    public function assignPlan($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'pricing_plan_id' => 'required|integer|exists:pricing_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly,lifetime',
        ]);

        $client = Client::findOrFail($id);
        $plan = PricingPlan::findOrFail((int) $request->pricing_plan_id);

        return DB::transaction(function () use ($client, $plan, $request) {
            $price = $request->billing_cycle === 'monthly'
                ? ($plan->monthly_price ?? 0)
                : ($plan->yearly_price ?? 0);
            if ($request->billing_cycle === 'lifetime') {
                $price = $plan->lifetime_price ?? 0;
            }

            $sub = Subscription::firstOrNew(['client_id' => $client->id]);
            $sub->pricing_plan_id = $plan->id;
            $sub->plan_name = $plan->name;
            $sub->price = $price;
            $sub->billing_cycle = $request->billing_cycle === 'lifetime' ? 'yearly' : $request->billing_cycle;
            $sub->features = $plan->features;
            $sub->status = 'active';
            $sub->next_billing_date = $request->billing_cycle === 'monthly'
                ? now()->addMonth()
                : now()->addYear();
            $sub->save();

            $shopId = $client->shop_id;
            if ($shopId) {
                $shop = \App\Models\Shop::find($shopId);
                if ($shop) {
                    $updates = [];
                    if (!is_null($plan->web_enabled)) {
                        $updates['enable_web'] = (bool) $plan->web_enabled;
                    }
                    if (!is_null($plan->android_enabled)) {
                        $updates['enable_android'] = (bool) $plan->android_enabled;
                    }
                    if (!is_null($plan->ios_enabled)) {
                        $updates['enable_ios'] = (bool) $plan->ios_enabled;
                    }
                    if (!empty($updates)) {
                        $shop->fill($updates);
                        $shop->save();
                    }
                }
            }

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
        });
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
