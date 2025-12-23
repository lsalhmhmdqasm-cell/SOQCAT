<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdminOnboardShopRequest;
use App\Jobs\ProvisionAndroidApp;
use App\Jobs\ProvisionIOSApp;
use App\Jobs\ProvisionWebShop;
use App\Models\PricingPlan;
use App\Models\Shop;
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
        if (!($web || $android || $ios)) {
            return response()->json(['message' => 'At least one service must be enabled'], 422);
        }

        return DB::transaction(function () use ($validated, $plan, $web, $android, $ios) {
            $shop = Shop::create([
                'name' => $validated['shop_name'],
                'description' => $validated['description'] ?? null,
                'logo' => $validated['logo'] ?? null,
                'status' => 'active',
            ]);

            $admin = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'phone' => $validated['phone'] ?? null,
                'role' => 'shop_admin',
                'shop_id' => $shop->id,
            ]);

            $shop->enable_web = $web;
            $shop->enable_android = $android;
            $shop->enable_ios = $ios;
            $shop->save();

            if ($shop->enable_web && $shop->web_status === 'pending') {
                ProvisionWebShop::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_android && $shop->android_status === 'pending') {
                ProvisionAndroidApp::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_ios && $shop->ios_status === 'pending') {
                ProvisionIOSApp::dispatch($shop->id)->afterCommit();
            }

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
