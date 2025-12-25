<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\PricingPlan;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed necessary data
        $this->seed(\Database\Seeders\PricingPlanSeeder::class);
    }

    public function test_client_status_syncs_to_shop_status()
    {
        // 1. Create Active Client & Shop
        $plan = PricingPlan::first();
        $shop = Shop::create([
            'name' => 'Test Shop',
            'status' => 'active',
            'enable_web' => true,
        ]);
        $client = Client::create([
            'shop_name' => 'Test Shop',
            'owner_name' => 'Owner',
            'email' => 'owner@test.com',
            'phone' => '123456789',
            'domain' => 'test.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
        ]);

        // 2. Suspend Client
        $client->update(['status' => 'suspended']);

        // Check Shop status
        $this->assertEquals('suspended', $shop->fresh()->status);

        // 3. Reactivate Client
        $client->update(['status' => 'active']);
        $this->assertEquals('active', $shop->fresh()->status);
    }

    public function test_expired_subscription_command()
    {
        // 1. Create Expired Client
        $shop = Shop::create(['name' => 'Expired Shop', 'status' => 'active']);
        $client = Client::create([
            'shop_name' => 'Expired Shop',
            'owner_name' => 'Owner',
            'email' => 'expired@test.com',
            'phone' => '123456789',
            'domain' => 'expired.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'subscription_end' => now()->subDay(), // Expired yesterday
        ]);

        // 2. Run Command
        $this->artisan('subscription:check-expiry')
            ->assertExitCode(0);

        // 3. Check Status
        $this->assertEquals('expired', $client->fresh()->status);
        $this->assertEquals('suspended', $shop->fresh()->status); // mapped to suspended
    }

    public function test_middleware_blocks_suspended_shop()
    {
        // 1. Setup Shop & User
        $shop = Shop::create(['name' => 'Suspended Shop', 'status' => 'suspended', 'enable_web' => true]);
        $user = User::factory()->create(['shop_id' => $shop->id]);

        // 2. Make Request
        $response = $this->actingAs($user)
            ->withHeaders(['X-Client-Platform' => 'web'])
            ->getJson('/api/products');

        // 3. Assert Forbidden
        $response->assertStatus(403)
            ->assertJson(['message' => 'Your shop is currently suspended']);
    }

    public function test_super_admin_store_client_creates_subscription_with_plan_features(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $plan = PricingPlan::where('web_enabled', true)->firstOrFail();

        $res = $this->postJson('/api/super-admin/clients', [
            'shop_name' => 'New Shop',
            'owner_name' => 'Owner',
            'email' => 'newshop@test.com',
            'phone' => '777123456',
            'domain' => 'newshop.qatshop.com',
            'subscription_type' => 'monthly',
            'pricing_plan_id' => $plan->id,
        ]);

        $res->assertStatus(201);
        $res->assertJsonPath('client.subscription.plan_name', $plan->name);
        $res->assertJsonPath('client.subscription.features.products', $plan->features['products']);

        $this->assertDatabaseHas('subscriptions', [
            'plan_name' => $plan->name,
        ]);
    }

    public function test_assign_plan_lifetime_sets_client_and_subscription_correctly(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $shop = Shop::create([
            'name' => 'Lifetime Shop',
            'status' => 'active',
            'enable_web' => false,
            'enable_android' => false,
            'enable_ios' => false,
        ]);

        $client = Client::create([
            'shop_name' => 'Lifetime Shop',
            'owner_name' => 'Owner',
            'email' => 'lifetime@test.com',
            'phone' => '777000111',
            'domain' => 'lifetime.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'license_type' => 'subscription',
            'subscription_start' => now(),
            'subscription_end' => now()->addMonth(),
        ]);

        $plan = PricingPlan::where('android_enabled', true)->firstOrFail();

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'lifetime',
        ]);

        $res->assertOk();
        $res->assertJsonPath('client.subscription_type', 'lifetime');
        $res->assertJsonPath('client.license_type', 'lifetime');
        $res->assertJsonPath('client.subscription.billing_cycle', 'yearly');
        $res->assertJsonPath('client.subscription.next_billing_date', null);

        $shopFresh = $shop->fresh();
        $this->assertEquals((bool) $plan->web_enabled, $shopFresh->enable_web);
        $this->assertEquals((bool) $plan->android_enabled, $shopFresh->enable_android);
        $this->assertEquals((bool) $plan->ios_enabled, $shopFresh->enable_ios);
    }

    public function test_extend_returns_422_for_lifetime_client(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $shop = Shop::create(['name' => 'Cannot Extend', 'status' => 'active', 'enable_web' => true]);
        $client = Client::create([
            'shop_name' => 'Cannot Extend',
            'owner_name' => 'Owner',
            'email' => 'cannotextend@test.com',
            'phone' => '777123000',
            'domain' => 'cannotextend.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'lifetime',
            'license_type' => 'lifetime',
            'subscription_start' => now(),
            'subscription_end' => null,
        ]);

        $res = $this->putJson("/api/super-admin/clients/{$client->id}/extend", ['months' => 1]);

        $res->assertStatus(422);
    }

    public function test_assign_plan_calculates_total_by_selected_services(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $shop = Shop::create([
            'name' => 'Svc Price Shop',
            'status' => 'active',
            'enable_web' => false,
            'enable_android' => false,
            'enable_ios' => false,
        ]);

        $client = Client::create([
            'shop_name' => 'Svc Price Shop',
            'owner_name' => 'Owner',
            'email' => 'svcprice@test.com',
            'phone' => '777111222',
            'domain' => 'svcprice.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'license_type' => 'subscription',
            'subscription_start' => now(),
            'subscription_end' => now()->addMonth(),
        ]);

        $plan = PricingPlan::create([
            'name' => 'SvcPrice',
            'description' => 'Test',
            'features' => ['products' => 10],
            'web_enabled' => true,
            'android_enabled' => true,
            'ios_enabled' => true,
            'monthly_price_web' => 100,
            'monthly_price_android' => 40,
            'monthly_price_ios' => 60,
            'yearly_price_web' => 1000,
            'yearly_price_android' => 400,
            'yearly_price_ios' => 600,
            'lifetime_price_web' => 5000,
            'lifetime_price_android' => 2000,
            'lifetime_price_ios' => 3000,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $services = ['web' => true, 'android' => false, 'ios' => true];

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'monthly',
            'services' => $services,
        ]);

        $res->assertOk();
        $sub = \App\Models\Subscription::where('client_id', $client->id)->firstOrFail();
        $this->assertEquals(160.0, (float) $sub->price);

        $shopFresh = $shop->fresh();
        $this->assertTrue((bool) $shopFresh->enable_web);
        $this->assertFalse((bool) $shopFresh->enable_android);
        $this->assertTrue((bool) $shopFresh->enable_ios);

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'yearly',
            'services' => $services,
        ]);

        $res->assertOk();
        $sub = \App\Models\Subscription::where('client_id', $client->id)->firstOrFail();
        $this->assertEquals(1600.0, (float) $sub->price);

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'lifetime',
            'services' => $services,
        ]);

        $res->assertOk();
        $res->assertJsonPath('client.subscription_type', 'lifetime');
        $res->assertJsonPath('client.license_type', 'lifetime');
        $res->assertJsonPath('client.subscription.billing_cycle', 'yearly');
        $res->assertJsonPath('client.subscription.next_billing_date', null);

        $sub = \App\Models\Subscription::where('client_id', $client->id)->firstOrFail();
        $this->assertEquals(8000.0, (float) $sub->price);
    }

    public function test_super_admin_store_client_calculates_price_by_selected_services(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $plan = PricingPlan::create([
            'name' => 'StoreSvcPrice',
            'description' => 'Test',
            'features' => ['products' => 10],
            'web_enabled' => true,
            'android_enabled' => true,
            'ios_enabled' => true,
            'monthly_price_web' => 100,
            'monthly_price_android' => 40,
            'monthly_price_ios' => 60,
            'yearly_price_web' => 1000,
            'yearly_price_android' => 400,
            'yearly_price_ios' => 600,
            'lifetime_price_web' => 5000,
            'lifetime_price_android' => 2000,
            'lifetime_price_ios' => 3000,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $services = ['web' => true, 'android' => false, 'ios' => true];

        $res = $this->postJson('/api/super-admin/clients', [
            'shop_name' => 'Store Svc Shop',
            'owner_name' => 'Owner',
            'email' => 'storesvc@test.com',
            'phone' => '777222333',
            'domain' => 'storesvc.qatshop.com',
            'subscription_type' => 'yearly',
            'pricing_plan_id' => $plan->id,
            'services' => $services,
        ]);

        $res->assertStatus(201);
        $clientId = $res->json('client.id');
        $this->assertNotNull($clientId);
        $sub = \App\Models\Subscription::where('client_id', $clientId)->firstOrFail();
        $this->assertEquals(1600.0, (float) $sub->price);
        $shop = \App\Models\Shop::findOrFail((int) $res->json('shop.id'));
        $this->assertTrue((bool) $shop->enable_web);
        $this->assertFalse((bool) $shop->enable_android);
        $this->assertTrue((bool) $shop->enable_ios);

        $res = $this->postJson('/api/super-admin/clients', [
            'shop_name' => 'Store Svc Shop Lifetime',
            'owner_name' => 'Owner',
            'email' => 'storesvclife@test.com',
            'phone' => '777222334',
            'domain' => 'storesvclife.qatshop.com',
            'subscription_type' => 'lifetime',
            'pricing_plan_id' => $plan->id,
            'services' => $services,
        ]);

        $res->assertStatus(201);
        $res->assertJsonPath('client.subscription.next_billing_date', null);
        $res->assertJsonPath('client.license_type', 'lifetime');
        $clientId = $res->json('client.id');
        $this->assertNotNull($clientId);
        $client = \App\Models\Client::findOrFail((int) $clientId);
        $sub = \App\Models\Subscription::where('client_id', $clientId)->firstOrFail();
        $this->assertEquals(8000.0, (float) $sub->price);
        $this->assertEquals(8000.0, (float) $client->paid_amount);
    }

    public function test_assign_plan_rejects_unavailable_service(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $shop = Shop::create([
            'name' => 'Svc Reject Shop',
            'status' => 'active',
            'enable_web' => true,
            'enable_android' => false,
            'enable_ios' => false,
        ]);

        $client = Client::create([
            'shop_name' => 'Svc Reject Shop',
            'owner_name' => 'Owner',
            'email' => 'svcreject@test.com',
            'phone' => '777333444',
            'domain' => 'svcreject.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'license_type' => 'subscription',
            'subscription_start' => now(),
            'subscription_end' => now()->addMonth(),
        ]);

        $plan = PricingPlan::create([
            'name' => 'WebOnly',
            'description' => 'Web only',
            'features' => ['products' => 10],
            'web_enabled' => true,
            'android_enabled' => false,
            'ios_enabled' => false,
            'monthly_price_web' => 100,
            'yearly_price_web' => 1000,
            'lifetime_price_web' => 5000,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'monthly',
            'services' => ['web' => true, 'android' => true, 'ios' => false],
        ]);

        $res->assertStatus(422);
    }

    public function test_assign_plan_requires_price_for_selected_service(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $shop = Shop::create([
            'name' => 'Svc Missing Price',
            'status' => 'active',
            'enable_web' => false,
            'enable_android' => false,
            'enable_ios' => false,
        ]);

        $client = Client::create([
            'shop_name' => 'Svc Missing Price',
            'owner_name' => 'Owner',
            'email' => 'svcmissing@test.com',
            'phone' => '777555666',
            'domain' => 'svcmissing.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'license_type' => 'subscription',
            'subscription_start' => now(),
            'subscription_end' => now()->addMonth(),
        ]);

        $plan = PricingPlan::create([
            'name' => 'MissingAndroidPrice',
            'description' => 'Missing android price',
            'features' => ['products' => 10],
            'web_enabled' => true,
            'android_enabled' => true,
            'ios_enabled' => false,
            'monthly_price_web' => 100,
            'monthly_price_android' => null,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $res = $this->postJson("/api/super_admin/clients/{$client->id}/assign-plan", [
            'pricing_plan_id' => $plan->id,
            'billing_cycle' => 'monthly',
            'services' => ['web' => false, 'android' => true, 'ios' => false],
        ]);

        $res->assertStatus(422);
    }
}
