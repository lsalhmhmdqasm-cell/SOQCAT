<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_dashboard_works_even_if_broadcasting_is_misconfigured(): void
    {
        config([
            'broadcasting.default' => 'pusher',
            'broadcasting.connections.pusher.key' => null,
            'broadcasting.connections.pusher.secret' => null,
            'broadcasting.connections.pusher.app_id' => null,
        ]);

        $user = User::factory()->create([
            'role' => 'super_admin',
        ]);

        Sanctum::actingAs($user);

        $res = $this->getJson('/api/super-admin/dashboard');

        $res->assertOk()->assertJsonStructure([
            'stats' => [
                'total_clients',
                'active_clients',
                'trial_clients',
                'suspended_clients',
                'expired_clients',
                'open_tickets',
                'urgent_tickets',
                'pending_updates',
                'monthly_revenue',
                'total_orders_today',
            ],
            'recent_clients',
            'recent_tickets',
            'monitoring' => [
                'crash_free_rate',
                'avg_response_ms',
                'p95_response_ms',
                'products_p95_ms',
                'order_success_rate',
                'requests_last_24h',
                'errors_last_24h',
                'shops_worst',
            ],
        ]);
    }
}
