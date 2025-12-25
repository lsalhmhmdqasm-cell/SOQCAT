<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminDashboardMissingMetricsTableTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_works_when_request_metrics_table_is_missing(): void
    {
        Schema::dropIfExists('request_metrics');

        $user = User::factory()->create([
            'role' => 'super_admin',
        ]);
        Sanctum::actingAs($user);

        $res = $this->getJson('/api/super-admin/dashboard');

        $res->assertOk()->assertJsonStructure([
            'stats',
            'recent_clients',
            'recent_tickets',
            'monitoring',
        ]);
    }
}
