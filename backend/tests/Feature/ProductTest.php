<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected $customer;

    protected $shop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shop = Shop::factory()->create();
        $this->shop->update([
            'web_status' => 'active',
            'web_provisioned_at' => now(),
            'android_status' => 'active',
            'android_provisioned_at' => now(),
            'ios_status' => 'active',
            'ios_provisioned_at' => now(),
        ]);
        $this->admin = User::factory()->create([
            'role' => 'shop_admin',
            'shop_id' => $this->shop->id,
        ]);
        $this->customer = User::factory()->create(['role' => 'customer']);
    }

    public function test_can_list_products()
    {
        Product::factory()->count(5)->create([
            'shop_id' => $this->shop->id,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(5);
    }

    public function test_admin_can_create_product()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Test Product',
                'price' => 100,
                'description' => 'Test description',
                'category' => 'Test Category',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Test Product')
            ->assertJsonPath('price', 100);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'shop_id' => $this->shop->id,
        ]);
    }

    public function test_customer_cannot_create_product()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Test Product',
                'price' => 100,
            ]);

        $response->assertStatus(403);
    }

    public function test_guest_cannot_create_product()
    {
        $response = $this->postJson('/api/products', [
            'name' => 'Test Product',
            'price' => 100,
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_update_own_product()
    {
        $product = Product::factory()->create([
            'shop_id' => $this->shop->id,
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/products/{$product->id}", [
                'name' => 'New Name',
                'price' => 200,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('name', 'New Name');
    }

    public function test_admin_can_delete_own_product()
    {
        $product = Product::factory()->create(['shop_id' => $this->shop->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_validation()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/products', [
                'name' => '', // Invalid
                'price' => -10, // Invalid
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price']);
    }
}
