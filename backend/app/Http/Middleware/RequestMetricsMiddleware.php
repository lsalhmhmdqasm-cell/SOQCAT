<?php

namespace App\Http\Middleware;

use App\Events\MonitoringAlert;
use App\Models\Client;
use App\Models\RequestMetric;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class RequestMetricsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $shopId = $this->resolveShopId($request);
        $userId = optional($request->user())->id;

        Log::withContext([
            'shop_id' => $shopId,
            'path' => $request->path(),
            'method' => $request->method(),
        ]);

        try {
            $response = $next($request);
        } catch (Throwable $e) {
            $this->storeMetricSafely($request, $start, 500, true, $shopId, $userId, get_class($e));
            throw $e;
        }

        $status = $response->getStatusCode();
        $this->storeMetricSafely($request, $start, $status, $status >= 500, $shopId, $userId, null);

        $this->maybeBroadcastAlertsSafely($shopId);

        return $response;
    }

    private function resolveShopId(Request $request): ?int
    {
        $userShopId = optional($request->user())->shop_id;
        if ($userShopId) {
            return $userShopId;
        }

        $routeParams = $request->route()?->parameters() ?? [];
        foreach (['shop_id', 'shopId', 'shop'] as $key) {
            if (isset($routeParams[$key]) && is_numeric($routeParams[$key])) {
                return (int) $routeParams[$key];
            }
        }

        $inputShopId = $request->input('shop_id');
        if (is_numeric($inputShopId)) {
            return (int) $inputShopId;
        }

        $headerShopId = $request->header('X-Shop-Id');
        if (is_numeric($headerShopId)) {
            return (int) $headerShopId;
        }

        return null;
    }

    private function storeMetricSafely(Request $request, float $start, int $statusCode, bool $isError, ?int $shopId, ?int $userId, ?string $exceptionClass): void
    {
        if (! Schema::hasTable('request_metrics')) {
            return;
        }

        $durationMs = (int) round((microtime(true) - $start) * 1000);
        $routeName = $request->route()?->getName();

        try {
            RequestMetric::create([
                'shop_id' => $shopId,
                'user_id' => $userId,
                'method' => $request->method(),
                'path' => $request->path(),
                'route_name' => $routeName,
                'status_code' => $statusCode,
                'duration_ms' => $durationMs,
                'is_error' => $isError,
                'exception_class' => $exceptionClass,
            ]);
        } catch (\Throwable $e) {
        }
    }

    private function maybeBroadcastAlertsSafely(?int $shopId): void
    {
        if (! Schema::hasTable('request_metrics')) {
            return;
        }

        try {
            $this->maybeBroadcastAlerts($shopId);
        } catch (\Throwable $e) {
        }
    }

    private function maybeBroadcastAlerts(?int $shopId): void
    {
        $from = now()->subMinutes(15);
        $thresholdCrashFree = (float) env('CRASH_FREE_THRESHOLD', 97);
        $thresholdAvgMs = (int) env('AVG_RESPONSE_MS_THRESHOLD', 800);
        $thresholdP95MsGlobal = (int) env('P95_RESPONSE_MS_THRESHOLD', 900);

        $query = RequestMetric::where('created_at', '>=', $from);
        $globalTotal = (clone $query)->count();
        $globalErrors = (clone $query)->where('status_code', '>=', 500)->count();
        $globalAvg = (int) round((clone $query)->avg('duration_ms') ?? 0);
        $globalP95 = $this->calcPercentile((clone $query)->pluck('duration_ms')->all(), 0.95);
        $globalCrash = $globalTotal > 0 ? round((($globalTotal - $globalErrors) / $globalTotal) * 100, 2) : 100.0;

        $alerts = [];
        if ($globalCrash < $thresholdCrashFree && Cache::add('alert:crash_free:global', true, 300)) {
            $alerts[] = [
                'type' => 'crash_free_low',
                'scope' => 'global',
                'value' => $globalCrash,
                'threshold' => $thresholdCrashFree,
                'window_minutes' => 15,
            ];
        }
        if ($globalAvg > $thresholdAvgMs && Cache::add('alert:response_time:global', true, 300)) {
            $alerts[] = [
                'type' => 'response_time_high',
                'scope' => 'global',
                'value' => $globalAvg,
                'threshold' => $thresholdAvgMs,
                'window_minutes' => 15,
            ];
        }
        if ($globalP95 > $thresholdP95MsGlobal && Cache::add('alert:p95_time:global', true, 300)) {
            $alerts[] = [
                'type' => 'response_p95_high',
                'scope' => 'global',
                'value' => $globalP95,
                'threshold' => $thresholdP95MsGlobal,
                'window_minutes' => 15,
            ];
        }

        if ($shopId) {
            $sq = RequestMetric::where('created_at', '>=', $from)->where('shop_id', $shopId);
            $stotal = (clone $sq)->count();
            $serrors = (clone $sq)->where('status_code', '>=', 500)->count();
            $savg = (int) round((clone $sq)->avg('duration_ms') ?? 0);
            $sp95 = $this->calcPercentile((clone $sq)->pluck('duration_ms')->all(), 0.95);
            $scrash = $stotal > 0 ? round((($stotal - $serrors) / $stotal) * 100, 2) : 100.0;

            $planP95Threshold = $this->getShopPlanP95Threshold($shopId) ?? $thresholdP95MsGlobal;

            if ($scrash < $thresholdCrashFree && Cache::add('alert:crash_free:shop:'.$shopId, true, 300)) {
                $alerts[] = [
                    'type' => 'crash_free_low',
                    'scope' => 'shop',
                    'shop_id' => $shopId,
                    'value' => $scrash,
                    'threshold' => $thresholdCrashFree,
                    'window_minutes' => 15,
                ];
            }
            if ($savg > $thresholdAvgMs && Cache::add('alert:response_time:shop:'.$shopId, true, 300)) {
                $alerts[] = [
                    'type' => 'response_time_high',
                    'scope' => 'shop',
                    'shop_id' => $shopId,
                    'value' => $savg,
                    'threshold' => $thresholdAvgMs,
                    'window_minutes' => 15,
                ];
            }
            if ($sp95 > $planP95Threshold && Cache::add('alert:p95_time:shop:'.$shopId, true, 300)) {
                $alerts[] = [
                    'type' => 'response_p95_high',
                    'scope' => 'shop',
                    'shop_id' => $shopId,
                    'value' => $sp95,
                    'threshold' => $planP95Threshold,
                    'window_minutes' => 15,
                ];
            }
        }

        if (! empty($alerts)) {
            $this->safeBroadcastMonitoringAlert([
                'type' => 'threshold_breach',
                'alerts' => $alerts,
                'generated_at' => now()->toDateTimeString(),
            ]);
        }
    }

    private function calcPercentile(array $values, float $p): int
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

    private function getShopPlanP95Threshold(int $shopId): ?int
    {
        $client = Client::where('shop_id', $shopId)->with('subscription')->first();
        if (! $client) {
            return null;
        }
        $features = $client->subscription?->features ?? null;
        if (! $features) {
            return null;
        }
        $val = $features['sla_p95_ms'] ?? null;

        return is_numeric($val) ? (int) $val : null;
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
