<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdminOnboardShopRequest;
use App\Jobs\ProvisionAndroidApp;
use App\Jobs\ProvisionIOSApp;
use App\Jobs\ProvisionWebShop;
use App\Models\Client;
use App\Models\PricingPlan;
use App\Models\Shop;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OnboardingController extends Controller
{
    public function onboardShop(SuperAdminOnboardShopRequest $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();
        $plan = PricingPlan::findOrFail((int) $validated['pricing_plan_id']);
        $web = (bool) ($plan->web_enabled ?? false);
        $android = (bool) ($plan->android_enabled ?? false);
        $ios = (bool) ($plan->ios_enabled ?? false);
        if (! ($web || $android || $ios)) {
            return response()->json(['message' => 'At least one service must be enabled'], 422);
        }

        return DB::transaction(function () use ($validated, $plan, $web, $android, $ios) {
            $shop = Shop::create([
                'name' => $validated['shop_name'],
                'description' => $validated['description'] ?? null,
                'logo' => $validated['logo'] ?? null,
                'status' => 'active',
                'delivery_fee' => 1000,
                'enable_web' => $web,
                'enable_android' => $android,
                'enable_ios' => $ios,
            ]);

            $admin = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'phone' => $validated['phone'] ?? null,
                'role' => 'shop_admin',
                'shop_id' => $shop->id,
            ]);

            // Create Client Record (Business Entity)
            $client = Client::create([
                'shop_name' => $shop->name,
                'owner_name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone ?? '000000000',
                'domain' => 'shop-' . $shop->id . '.qatshop.com', // Default domain
                'subscription_type' => 'monthly', // Default, can be updated later or passed in request
                'status' => 'active',
                'subscription_start' => now(),
                'subscription_end' => now()->addMonth(),
                'shop_id' => $shop->id,
            ]);

            // Create Subscription Record
            Subscription::create([
                'client_id' => $client->id,
                'pricing_plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $plan->monthly_price ?? 0,
                'billing_cycle' => 'monthly',
                'features' => $plan->features,
                'status' => 'active',
                'next_billing_date' => now()->addMonth(),
            ]);

            // Provisioning Jobs are handled by Shop model events (created/saving)
            // But we can double check or just rely on the model events which we verified exist.

            return response()->json([
                'shop' => $shop->fresh(),
                'admin_user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => $admin->role,
                    'shop_id' => $admin->shop_id,
                ],
                'enabled_services' => [
                    'web' => (bool) $shop->enable_web,
                    'android' => (bool) $shop->enable_android,
                    'ios' => (bool) $shop->enable_ios,
                ],
                'pricing_plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'web_enabled' => (bool) ($plan->web_enabled ?? false),
                    'android_enabled' => (bool) ($plan->android_enabled ?? false),
                    'ios_enabled' => (bool) ($plan->ios_enabled ?? false),
                ],
            ], 201);
        });
    }
}
