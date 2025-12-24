<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\PricingPlan;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
