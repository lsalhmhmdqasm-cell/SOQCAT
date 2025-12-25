<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Events\MonitoringAlert;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use App\Models\RequestMetric;
use App\Models\Shop;
use App\Models\SupportTicket;
use App\Models\SystemUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $stats = [
                'total_clients' => Schema::hasTable('clients') ? Client::count() : 0,
                'active_clients' => Schema::hasTable('clients') ? Client::where('status', 'active')->count() : 0,
                'trial_clients' => Schema::hasTable('clients') ? Client::where('status', 'trial')->count() : 0,
                'suspended_clients' => Schema::hasTable('clients') ? Client::where('status', 'suspended')->count() : 0,
                'expired_clients' => Schema::hasTable('clients') ? Client::where('status', 'expired')->count() : 0,

                'open_tickets' => Schema::hasTable('support_tickets') ? SupportTicket::whereIn('status', ['open', 'in_progress'])->count() : 0,
                'urgent_tickets' => Schema::hasTable('support_tickets') ? SupportTicket::where('priority', 'urgent')->where('status', '!=', 'closed')->count() : 0,

                'pending_updates' => Schema::hasTable('system_updates') ? SystemUpdate::whereDate('release_date', '<=', now())->count() : 0,

                'monthly_revenue' => $this->safeMonthlyRevenue(),
                'total_orders_today' => Schema::hasTable('orders') ? Order::whereDate('created_at', today())->count() : 0,
            ];

            $recent_clients = Schema::hasTable('clients') ? Client::latest()->take(5)->get() : collect();
            $recent_tickets = Schema::hasTable('support_tickets') ? SupportTicket::with('client')->latest()->take(5)->get() : collect();

            $monitoring = $this->buildMonitoringMetrics();

            $response = [
                'stats' => $stats,
                'recent_clients' => $recent_clients,
                'recent_tickets' => $recent_tickets,
                'monitoring' => $monitoring,
            ];

            $this->safeBroadcastMonitoringAlert([
                'type' => 'daily_summary',
                'summary' => $monitoring,
                'generated_at' => now()->toDateTimeString(),
            ]);

            return response()->json($response);
        } catch (\Throwable $e) {
            Log::error('super_admin_dashboard_failed', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json($this->defaultDashboardPayload());
        }
    }

    private function defaultDashboardPayload(): array
    {
        return [
            'stats' => [
                'total_clients' => 0,
                'active_clients' => 0,
                'trial_clients' => 0,
                'suspended_clients' => 0,
                'expired_clients' => 0,
                'open_tickets' => 0,
                'urgent_tickets' => 0,
                'pending_updates' => 0,
                'monthly_revenue' => 0,
                'total_orders_today' => 0,
            ],
            'recent_clients' => [],
            'recent_tickets' => [],
            'monitoring' => [
                'crash_free_rate' => 100.0,
                'avg_response_ms' => 0,
                'p95_response_ms' => 0,
                'products_p95_ms' => 0,
                'order_success_rate' => 0.0,
                'requests_last_24h' => 0,
                'errors_last_24h' => 0,
                'shops_worst' => [],
            ],
        ];
    }

    private function safeMonthlyRevenue()
    {
        if (! Schema::hasTable('subscriptions') || ! Schema::hasTable('clients')) {
            return 0;
        }
        try {
            return Client::where('clients.status', 'active')
                ->join('subscriptions', 'clients.id', '=', 'subscriptions.client_id')
                ->where('subscriptions.status', 'active')
                ->sum('subscriptions.price');
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private function buildMonitoringMetrics(): array
    {
        $from = now()->subDay();

        if (! Schema::hasTable('request_metrics')) {
            return [
                'crash_free_rate' => 100.0,
                'avg_response_ms' => 0,
                'p95_response_ms' => 0,
                'products_p95_ms' => 0,
                'order_success_rate' => 0.0,
                'requests_last_24h' => 0,
                'errors_last_24h' => 0,
                'shops_worst' => collect(),
            ];
        }

        try {
            $totalRequests = RequestMetric::where('created_at', '>=', $from)->count();
            $errorRequests = RequestMetric::where('created_at', '>=', $from)->where('status_code', '>=', 500)->count();
            $avgResponseMs = (int) round(RequestMetric::where('created_at', '>=', $from)->avg('duration_ms') ?? 0);
            $allDurations = RequestMetric::where('created_at', '>=', $from)->pluck('duration_ms');
            $p95ResponseMs = $this->percentile($allDurations->all(), 0.95);
            $productsDurations = RequestMetric::where('created_at', '>=', $from)
                ->where('path', 'like', 'api/products%')
                ->pluck('duration_ms');
            $productsP95Ms = $this->percentile($productsDurations->all(), 0.95);

            $totalOrders24h = Schema::hasTable('orders') ? Order::where('created_at', '>=', $from)->count() : 0;
            $delivered24h = Schema::hasTable('orders') ? Order::where('created_at', '>=', $from)->where('status', 'delivered')->count() : 0;
            $orderSuccessRate = $totalOrders24h > 0 ? round(($delivered24h * 1.0 / $totalOrders24h) * 100, 2) : 0.0;

            $crashFreeRate = $totalRequests > 0 ? round((($totalRequests - $errorRequests) / $totalRequests) * 100, 2) : 100.0;

            $shopsWorst = RequestMetric::selectRaw('shop_id, SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors, COUNT(*) as total')
                ->where('created_at', '>=', $from)
                ->whereNotNull('shop_id')
                ->groupBy('shop_id')
                ->orderByRaw('errors * 1.0 / NULLIF(total, 0) DESC')
                ->limit(5)
                ->get()
                ->map(function ($row) {
                    $rate = $row->total > 0 ? round((($row->total - $row->errors) / $row->total) * 100, 2) : 100.0;

                    return [
                        'shop_id' => (int) $row->shop_id,
                        'crash_free_rate' => $rate,
                        'errors' => (int) $row->errors,
                        'total' => (int) $row->total,
                    ];
                });

            $shopNames = Schema::hasTable('shops')
                ? Shop::whereIn('id', $shopsWorst->pluck('shop_id'))->pluck('name', 'id')
                : collect();
            $shopsWorst = $shopsWorst->map(function ($item) use ($shopNames) {
                $item['shop_name'] = $shopNames[$item['shop_id']] ?? null;

                return $item;
            });

            return [
                'crash_free_rate' => $crashFreeRate,
                'avg_response_ms' => $avgResponseMs,
                'p95_response_ms' => $p95ResponseMs,
                'products_p95_ms' => $productsP95Ms,
                'order_success_rate' => $orderSuccessRate,
                'requests_last_24h' => $totalRequests,
                'errors_last_24h' => $errorRequests,
                'shops_worst' => $shopsWorst,
            ];
        } catch (\Throwable $e) {
            return [
                'crash_free_rate' => 100.0,
                'avg_response_ms' => 0,
                'p95_response_ms' => 0,
                'products_p95_ms' => 0,
                'order_success_rate' => 0.0,
                'requests_last_24h' => 0,
                'errors_last_24h' => 0,
                'shops_worst' => collect(),
            ];
        }
    }

    public function metrics(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $from = $request->filled('from') ? \Carbon\Carbon::parse($request->get('from')) : now()->subDay();
        $to = $request->filled('to') ? \Carbon\Carbon::parse($request->get('to')) : now();
        $shopId = $request->get('shop_id');

        if (! Schema::hasTable('request_metrics')) {
            return response()->json([
                'summary' => [
                    'from' => $from->toDateTimeString(),
                    'to' => $to->toDateTimeString(),
                    'shop_id' => $shopId ? (int) $shopId : null,
                    'requests' => 0,
                    'errors' => 0,
                    'avg_response_ms' => 0,
                    'p95_response_ms' => 0,
                    'products_p95_ms' => 0,
                    'crash_free_rate' => 100.0,
                ],
                'series' => [],
                'top_endpoints' => [],
                'top_exceptions' => [],
                'alerts' => [],
            ]);
        }

        $base = RequestMetric::query()->whereBetween('created_at', [$from, $to]);
        if ($shopId) {
            $base->where('shop_id', $shopId);
        }

        $totalRequests = (clone $base)->count();
        $errorRequests = (clone $base)->where('status_code', '>=', 500)->count();
        $avgResponseMs = (int) round((clone $base)->avg('duration_ms') ?? 0);
        $crashFreeRate = $totalRequests > 0 ? round((($totalRequests - $errorRequests) / $totalRequests) * 100, 2) : 100.0;
        $durations = (clone $base)->pluck('duration_ms');
        $p95ResponseMs = $this->percentile($durations->all(), 0.95);
        $prodDurations = RequestMetric::query()
            ->whereBetween('created_at', [$from, $to])
            ->when($shopId, fn ($q) => $q->where('shop_id', $shopId))
            ->where('path', 'like', 'api/products%')
            ->pluck('duration_ms');
        $productsP95Ms = $this->percentile($prodDurations->all(), 0.95);

        $rows = RequestMetric::whereBetween('created_at', [$from, $to])
            ->when($shopId, fn ($q) => $q->where('shop_id', $shopId))
            ->get(['created_at', 'status_code', 'duration_ms']);
        $grouped = $rows->groupBy(function ($r) {
            return $r->created_at->format('Y-m-d H:00:00');
        });
        $series = $grouped->map(function ($items, $bucket) {
            $requests = $items->count();
            $errors = $items->where('status_code', '>=', 500)->count();
            $avg = (int) round($items->avg('duration_ms') ?? 0);
            $crf = $requests > 0 ? round((($requests - $errors) / $requests) * 100, 2) : 100.0;

            return [
                'bucket' => $bucket,
                'requests' => $requests,
                'errors' => $errors,
                'avg_response_ms' => $avg,
                'crash_free_rate' => $crf,
            ];
        })->values()->sortBy('bucket')->values();

        $topEndpoints = RequestMetric::select([
            'path',
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors'),
        ])
            ->whereBetween('created_at', [$from, $to])
            ->when($shopId, fn ($q) => $q->where('shop_id', $shopId))
            ->groupBy('path')
            ->orderBy('errors', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $rate = $row->total > 0 ? round(($row->errors / $row->total) * 100, 2) : 0.0;

                return [
                    'path' => $row->path,
                    'total' => (int) $row->total,
                    'errors' => (int) $row->errors,
                    'error_rate' => $rate,
                ];
            });

        $topExceptions = RequestMetric::select([
            'exception_class',
            DB::raw('COUNT(*) as total'),
        ])
            ->whereBetween('created_at', [$from, $to])
            ->when($shopId, fn ($q) => $q->where('shop_id', $shopId))
            ->whereNotNull('exception_class')
            ->groupBy('exception_class')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        $crashFreeThreshold = (float) env('CRASH_FREE_THRESHOLD', 97);
        $avgResponseThreshold = (int) env('AVG_RESPONSE_MS_THRESHOLD', 800);
        $alerts = [];
        if ($crashFreeRate < $crashFreeThreshold) {
            $alerts[] = [
                'type' => 'crash_free_low',
                'value' => $crashFreeRate,
                'threshold' => $crashFreeThreshold,
            ];
        }
        if ($avgResponseMs > $avgResponseThreshold) {
            $alerts[] = [
                'type' => 'response_time_high',
                'value' => $avgResponseMs,
                'threshold' => $avgResponseThreshold,
            ];
        }

        return response()->json([
            'summary' => [
                'from' => $from->toDateTimeString(),
                'to' => $to->toDateTimeString(),
                'shop_id' => $shopId ? (int) $shopId : null,
                'requests' => $totalRequests,
                'errors' => $errorRequests,
                'avg_response_ms' => $avgResponseMs,
                'p95_response_ms' => $p95ResponseMs,
                'products_p95_ms' => $productsP95Ms,
                'crash_free_rate' => $crashFreeRate,
            ],
            'series' => $series,
            'top_endpoints' => $topEndpoints,
            'top_exceptions' => $topExceptions,
            'alerts' => $alerts,
        ]);
    }

    private function percentile(array $values, float $p): int
    {
        $n = count($values);
        if ($n === 0) {
            return 0;
        }
        sort($values);
        $posf = ($n - 1) * $p;
        $pos = (int) floor($posf);
        $base = $values[$pos];
        $next = $values[min($pos + 1, $n - 1)];
        $frac = $posf - $pos;

        return (int) round($base + ($next - $base) * $frac);
    }

    private function safeBroadcastMonitoringAlert(array $payload): void
    {
        if (! $this->canBroadcastMonitoringAlerts()) {
            return;
        }

        try {
            event(new MonitoringAlert($payload));
        } catch (\Throwable $e) {
        }
    }

    private function canBroadcastMonitoringAlerts(): bool
    {
        $driver = (string) (config('broadcasting.default') ?? '');
        if (! $driver || $driver === 'null') {
            return false;
        }

        if ($driver === 'pusher') {
            return (bool) (
                config('broadcasting.connections.pusher.key')
                && config('broadcasting.connections.pusher.secret')
                && config('broadcasting.connections.pusher.app_id')
            );
        }

        if ($driver === 'ably') {
            return (bool) config('broadcasting.connections.ably.key');
        }

        return true;
    }
}
