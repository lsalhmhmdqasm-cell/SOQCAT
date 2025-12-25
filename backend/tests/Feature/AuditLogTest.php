<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\PricingPlanSeeder::class);
    }

    public function test_status_change_logs_automatically()
    {
        // 1. Create Client
        $shop = Shop::create(['name' => 'Log Shop', 'status' => 'active']);
        $client = Client::create([
            'shop_name' => 'Log Shop',
            'owner_name' => 'Owner',
            'email' => 'log@test.com',
            'phone' => '123456789',
            'domain' => 'log.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
        ]);

        // 2. Perform Action (Suspend)
        $admin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($admin);

        $client->update(['status' => 'suspended']);

        // 3. Verify Log
        $this->assertDatabaseHas('subscription_logs', [
            'client_id' => $client->id,
            'action' => 'status_change',
            'old_value' => 'active',
            'new_value' => 'suspended',
            'performed_by' => $admin->id,
        ]);
    }

    public function test_extension_logs_automatically()
    {
        // 1. Create Client
        $shop = Shop::create(['name' => 'Extend Shop', 'status' => 'active']);
        $initialEnd = now()->addMonth();
        $client = Client::create([
            'shop_name' => 'Extend Shop',
            'owner_name' => 'Owner',
            'email' => 'extend@test.com',
            'phone' => '123456789',
            'domain' => 'extend.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
            'subscription_end' => $initialEnd,
        ]);

        // 2. Perform Action (Extend)
        $admin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($admin);

        $newEnd = $initialEnd->copy()->addMonth();
        $client->update(['subscription_end' => $newEnd]);

        // 3. Verify Log
        $this->assertDatabaseHas('subscription_logs', [
            'client_id' => $client->id,
            'action' => 'extended',
            'old_value' => $initialEnd->toDateTimeString(), // default serialization
            'new_value' => $newEnd->toDateTimeString(),
            'performed_by' => $admin->id,
        ]);
    }

    public function test_api_can_retrieve_logs()
    {
        $shop = Shop::create(['name' => 'API Shop', 'status' => 'active']);
        $client = Client::create([
            'shop_name' => 'API Shop',
            'owner_name' => 'Owner',
            'email' => 'api@test.com',
            'phone' => '123456789',
            'domain' => 'api.qatshop.com',
            'status' => 'active',
            'shop_id' => $shop->id,
            'subscription_type' => 'monthly',
        ]);

        // Generate logs
        $client->update(['status' => 'suspended']);
        $client->update(['status' => 'active']);

        $admin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($admin)
            ->getJson("/api/super-admin/clients/{$client->id}/logs");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
