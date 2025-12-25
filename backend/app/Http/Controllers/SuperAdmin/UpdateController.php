<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\SystemUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UpdateController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updates = SystemUpdate::latest('release_date')->paginate(20);

        return response()->json($updates);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'version' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'changelog' => 'nullable|string',
            'release_date' => 'required|date',
            'is_critical' => 'boolean',
        ]);

        $update = SystemUpdate::create($validated);

        return response()->json($update, 201);
    }

    public function deploy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! $request->has('target_clients')) {
            return response()->json(['message' => 'Validation error', 'errors' => ['target_clients' => ['The target_clients field is required.']]], 422);
        }

        $update = SystemUpdate::findOrFail($id);

        if ($request->get('target_clients') === 'all') {
            $clientIds = Client::where('status', 'active')->pluck('id')->toArray();
        } else {
            $request->validate([
                'target_clients' => 'array',
                'target_clients.*' => 'integer|exists:clients,id',
            ]);
            $clientIds = $request->get('target_clients', []);
        }

        // Mark as applied
        foreach ($clientIds as $clientId) {
            $update->markAsApplied($clientId);
        }

        // TODO: Send notifications to clients
        // TODO: Trigger deployment script

        return response()->json([
            'message' => 'Update deployed',
            'applied_to_count' => count($clientIds),
        ]);
    }

    public function getStats($id, Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $update = SystemUpdate::findOrFail($id);
        $totalClients = Client::where('status', 'active')->count();
        $appliedCount = count($update->applied_to ?? []);

        return response()->json([
            'total_clients' => $totalClients,
            'applied_count' => $appliedCount,
            'pending_count' => $totalClients - $appliedCount,
            'percentage' => $totalClients > 0 ? round(($appliedCount / $totalClients) * 100, 2) : 0,
        ]);
    }

    public function migrate(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lock = Cache::lock('super_admin:maintenance:migrate', 600);
        if (! $lock->get()) {
            return response()->json(['message' => 'Migration is already running'], 409);
        }

        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = Artisan::output();

            Log::info('super_admin_migrate_executed', [
                'user_id' => $request->user()->id,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Migrations executed',
                'output' => $output,
            ]);
        } catch (\Throwable $e) {
            Log::error('super_admin_migrate_failed', [
                'user_id' => $request->user()->id,
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Migration failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
            ], 500);
        } finally {
            optional($lock)->release();
        }
    }
}
