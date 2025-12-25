<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_lead_with_valid_phone_and_honeypot_empty(): void
    {
        User::factory()->create(['role' => 'super_admin', 'email' => 'admin1@qatshop.com', 'name' => 'Admin One']);
        User::factory()->create(['role' => 'super_admin', 'email' => 'admin2@qatshop.com', 'name' => 'Admin Two']);

        $payload = [
            'shop_name' => 'متجر النسيم',
            'phone' => '777000000', // 9 digits starting with 7
            'plan_type' => 'premium',
            'honeypot' => '',
        ];

        $res = $this->postJson('/api/leads', $payload);
        $res->assertStatus(201)->assertJsonFragment([
            'shop_name' => 'متجر النسيم',
            'phone' => '777000000',
            'plan_type' => 'premium',
            'status' => 'new',
        ]);

        $this->assertEquals(2, Notification::where('type', 'lead')->count());
    }

    public function test_rejects_lead_with_invalid_phone(): void
    {
        $payload = [
            'shop_name' => 'متجر الروابي',
            'phone' => '12345',
            'plan_type' => 'basic',
        ];

        $res = $this->postJson('/api/leads', $payload);
        $res->assertStatus(422);
    }

    public function test_rejects_lead_when_honeypot_filled(): void
    {
        $payload = [
            'shop_name' => 'متجر السبلان',
            'phone' => '771234567',
            'plan_type' => 'enterprise',
            'honeypot' => 'bot',
        ];

        $res = $this->postJson('/api/leads', $payload);
        $res->assertStatus(400);
    }

    public function test_plan_type_validation(): void
    {
        $payload = [
            'shop_name' => 'متجر الريان',
            'phone' => '771234567',
            'plan_type' => 'invalid',
        ];

        $res = $this->postJson('/api/leads', $payload);
        $res->assertStatus(422);
    }
}
