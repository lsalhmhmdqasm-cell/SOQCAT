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
}
