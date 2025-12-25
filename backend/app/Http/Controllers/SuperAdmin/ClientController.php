<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\PricingPlanSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

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

    public function logs($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! Schema::hasTable('subscription_logs')) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'per_page' => 20,
                'current_page' => 1,
            ]);
        }

        $client = Client::findOrFail($id);
        $logs = $client->logs()->with('user')->paginate(20);

        return response()->json($logs);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email|unique:users,email',
            'phone' => 'required|string|max:20',
            'domain' => 'required|string|unique:clients,domain',
            'subscription_type' => 'required|in:monthly,yearly,lifetime',
            'pricing_plan_id' => 'required|integer|exists:pricing_plans,id',
            'admin_password' => 'nullable|string|min:8',
            'services' => 'nullable|array',
            'services.web' => 'sometimes|boolean',
            'services.android' => 'sometimes|boolean',
            'services.ios' => 'sometimes|boolean',
        ]);

        $plan = PricingPlan::findOrFail((int) $validated['pricing_plan_id']);
        if (! ((bool) ($plan->web_enabled ?? false) || (bool) ($plan->android_enabled ?? false) || (bool) ($plan->ios_enabled ?? false))) {
            return response()->json(['message' => 'At least one service must be enabled'], 422);
        }

        return DB::transaction(function () use ($validated, $plan, $request) {
            $isLifetime = $validated['subscription_type'] === 'lifetime';
            $requestedServices = $request->input('services');
            $services = [
                'web' => (bool) ($plan->web_enabled ?? false),
                'android' => (bool) ($plan->android_enabled ?? false),
                'ios' => (bool) ($plan->ios_enabled ?? false),
            ];
            if (is_array($requestedServices)) {
                foreach (['web', 'android', 'ios'] as $k) {
                    if (array_key_exists($k, $requestedServices)) {
                        $services[$k] = (bool) $requestedServices[$k];
                    }
                }
            }

            if (! ($services['web'] || $services['android'] || $services['ios'])) {
                return response()->json(['message' => 'يجب اختيار خدمة واحدة على الأقل'], 422);
            }

            foreach (['web', 'android', 'ios'] as $platform) {
                if (($services[$platform] ?? false) && ! $plan->allowsService($platform)) {
                    return response()->json(['message' => 'الخدمة غير متاحة في هذه الباقة'], 422);
                }
            }

            $cycle = $validated['subscription_type'];
            foreach (['web' => 'الويب', 'android' => 'Android', 'ios' => 'iOS'] as $platform => $label) {
                if (! ($services[$platform] ?? false)) {
                    continue;
                }
                $svcPrice = $plan->servicePrice($cycle, $platform);
                if ($svcPrice === null) {
                    return response()->json(['message' => 'سعر خدمة '.$label.' غير محدد لهذه الدورة'], 422);
                }
            }

            $price = $plan->calcTotalPrice($cycle, $services);

            $client = Client::create([
                'shop_name' => $validated['shop_name'],
                'owner_name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'domain' => $validated['domain'],
                'subscription_type' => $validated['subscription_type'],
                'license_type' => $isLifetime ? 'lifetime' : 'subscription',
                'paid_amount' => $isLifetime ? $price : null,
                'payment_date' => $isLifetime ? now()->toDateString() : null,
                'status' => $isLifetime ? 'active' : 'trial',
                'subscription_start' => now(),
                'subscription_end' => $isLifetime ? null : now()->addDays(14),
            ]);

            $shop = \App\Models\Shop::create([
                'name' => $validated['shop_name'],
                'description' => 'محل مرتبط بالعميل من لوحة المدير العام',
                'status' => 'active',
                'delivery_fee' => 1000,
                'enable_web' => (bool) ($services['web'] ?? false),
                'enable_android' => (bool) ($services['android'] ?? false),
                'enable_ios' => (bool) ($services['ios'] ?? false),
            ]);

            $client->shop_id = $shop->id;
            $client->save();

            // Auto-create Shop Admin user to manage this shop
            // Uses client email; password from request or generated
            $rawPassword = $request->input('admin_password') ?: Str::random(16);
            $adminUser = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'password' => Hash::make($rawPassword),
                'phone' => $validated['phone'],
                'role' => 'shop_admin',
                'shop_id' => $shop->id,
            ]);

            Subscription::create([
                'client_id' => $client->id,
                'pricing_plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $price,
                'billing_cycle' => $isLifetime ? 'yearly' : $validated['subscription_type'],
                'features' => array_merge($plan->features ?? [], [
                    'services' => $services,
                    'pricing' => [
                        'cycle' => $cycle,
                        'platform_prices' => [
                            'web' => $plan->servicePrice($cycle, 'web'),
                            'android' => $plan->servicePrice($cycle, 'android'),
                            'ios' => $plan->servicePrice($cycle, 'ios'),
                        ],
                    ],
                ]),
                'status' => 'active',
                'next_billing_date' => $isLifetime ? null : ($validated['subscription_type'] === 'monthly' ? now()->addMonth() : now()->addYear()),
            ]);

            return response()->json([
                'client' => $client->load('subscription'),
                'shop' => $shop,
                'admin_user' => [
                    'id' => $adminUser->id,
                    'email' => $adminUser->email,
                    'password' => $rawPassword, // return plain for initial sharing; recommend change after first login
                ],
            ], 201);
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
        if ($client->license_type === 'lifetime') {
            return response()->json(['message' => 'لا يمكن تمديد اشتراك مدى الحياة'], 422);
        }
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

        if (! Schema::hasTable('pricing_plans')) {
            return response()->json([]);
        }

        try {
            if (PricingPlan::count() === 0) {
                (new PricingPlanSeeder)->run();
            }
        } catch (\Throwable $e) {
        }

        $query = PricingPlan::query()->orderBy('sort_order');
        if (! $request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
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
            'monthly_price_web' => 'nullable|numeric|min:0',
            'monthly_price_android' => 'nullable|numeric|min:0',
            'monthly_price_ios' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'yearly_price_web' => 'nullable|numeric|min:0',
            'yearly_price_android' => 'nullable|numeric|min:0',
            'yearly_price_ios' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'lifetime_price_web' => 'nullable|numeric|min:0',
            'lifetime_price_android' => 'nullable|numeric|min:0',
            'lifetime_price_ios' => 'nullable|numeric|min:0',
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
            'monthly_price_web' => 'nullable|numeric|min:0',
            'monthly_price_android' => 'nullable|numeric|min:0',
            'monthly_price_ios' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'yearly_price_web' => 'nullable|numeric|min:0',
            'yearly_price_android' => 'nullable|numeric|min:0',
            'yearly_price_ios' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'lifetime_price_web' => 'nullable|numeric|min:0',
            'lifetime_price_android' => 'nullable|numeric|min:0',
            'lifetime_price_ios' => 'nullable|numeric|min:0',
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
            'services' => 'nullable|array',
            'services.web' => 'sometimes|boolean',
            'services.android' => 'sometimes|boolean',
            'services.ios' => 'sometimes|boolean',
        ]);

        $client = Client::findOrFail($id);
        $plan = PricingPlan::findOrFail((int) $request->pricing_plan_id);

        return DB::transaction(function () use ($client, $plan, $request) {
            $requestedServices = $request->input('services');
            $services = [
                'web' => (bool) ($plan->web_enabled ?? false),
                'android' => (bool) ($plan->android_enabled ?? false),
                'ios' => (bool) ($plan->ios_enabled ?? false),
            ];
            if (is_array($requestedServices)) {
                foreach (['web', 'android', 'ios'] as $k) {
                    if (array_key_exists($k, $requestedServices)) {
                        $services[$k] = (bool) $requestedServices[$k];
                    }
                }
            }

            if (! ($services['web'] || $services['android'] || $services['ios'])) {
                return response()->json(['message' => 'يجب اختيار خدمة واحدة على الأقل'], 422);
            }

            foreach (['web', 'android', 'ios'] as $platform) {
                if (($services[$platform] ?? false) && ! $plan->allowsService($platform)) {
                    return response()->json(['message' => 'الخدمة غير متاحة في هذه الباقة'], 422);
                }
            }

            $cycle = (string) $request->billing_cycle;
            foreach (['web' => 'الويب', 'android' => 'Android', 'ios' => 'iOS'] as $platform => $label) {
                if (! ($services[$platform] ?? false)) {
                    continue;
                }
                $svcPrice = $plan->servicePrice($cycle, $platform);
                if ($svcPrice === null) {
                    return response()->json(['message' => 'سعر خدمة '.$label.' غير محدد لهذه الدورة'], 422);
                }
            }

            $price = $plan->calcTotalPrice($cycle, $services);

            $sub = Subscription::firstOrNew(['client_id' => $client->id]);
            $sub->pricing_plan_id = $plan->id;
            $sub->plan_name = $plan->name;
            $sub->price = $price;
            $sub->billing_cycle = $request->billing_cycle === 'lifetime' ? 'yearly' : $request->billing_cycle;
            $sub->features = array_merge($plan->features ?? [], [
                'services' => $services,
                'pricing' => [
                    'cycle' => $cycle,
                    'platform_prices' => [
                        'web' => $plan->servicePrice($cycle, 'web'),
                        'android' => $plan->servicePrice($cycle, 'android'),
                        'ios' => $plan->servicePrice($cycle, 'ios'),
                    ],
                ],
            ]);
            $sub->status = 'active';
            $sub->next_billing_date = $request->billing_cycle === 'lifetime'
                ? null
                : ($request->billing_cycle === 'monthly' ? now()->addMonth() : now()->addYear());
            $sub->save();

            $shopId = $client->shop_id;
            if ($shopId) {
                $shop = \App\Models\Shop::find($shopId);
                if ($shop) {
                    $updates = [];
                    if (! is_null($plan->web_enabled)) {
                        $updates['enable_web'] = (bool) ($services['web'] ?? false);
                    }
                    if (! is_null($plan->android_enabled)) {
                        $updates['enable_android'] = (bool) ($services['android'] ?? false);
                    }
                    if (! is_null($plan->ios_enabled)) {
                        $updates['enable_ios'] = (bool) ($services['ios'] ?? false);
                    }
                    if (! empty($updates)) {
                        $shop->fill($updates);
                        $shop->save();
                    }
                }
            }

            $client->subscription_type = $request->billing_cycle;
            $client->status = 'active';
            $client->license_type = $request->billing_cycle === 'lifetime' ? 'lifetime' : 'subscription';
            $client->paid_amount = $request->billing_cycle === 'lifetime' ? $price : null;
            $client->payment_date = $request->billing_cycle === 'lifetime' ? now()->toDateString() : null;
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
