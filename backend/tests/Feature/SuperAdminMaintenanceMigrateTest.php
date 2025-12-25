<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminMaintenanceMigrateTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_admin_cannot_run_migrations(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/super-admin/maintenance/migrate');

        $res->assertStatus(403);
    }

    public function test_super_admin_can_run_migrations(): void
    {
        $user = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/super-admin/maintenance/migrate');

        $res->assertOk()->assertJsonStructure(['message', 'output']);
    }
}
