<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'monthly_price',
        'monthly_price_web',
        'monthly_price_android',
        'monthly_price_ios',
        'yearly_price',
        'yearly_price_web',
        'yearly_price_android',
        'yearly_price_ios',
        'lifetime_price',
        'lifetime_price_web',
        'lifetime_price_android',
        'lifetime_price_ios',
        'features',
        'web_enabled',
        'android_enabled',
        'ios_enabled',
        'max_products',
        'max_orders_per_month',
        'max_api_requests_per_day',
        'max_storage_mb',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'monthly_price' => 'decimal:2',
        'monthly_price_web' => 'decimal:2',
        'monthly_price_android' => 'decimal:2',
        'monthly_price_ios' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'yearly_price_web' => 'decimal:2',
        'yearly_price_android' => 'decimal:2',
        'yearly_price_ios' => 'decimal:2',
        'lifetime_price' => 'decimal:2',
        'lifetime_price_web' => 'decimal:2',
        'lifetime_price_android' => 'decimal:2',
        'lifetime_price_ios' => 'decimal:2',
        'is_active' => 'boolean',
        'web_enabled' => 'boolean',
        'android_enabled' => 'boolean',
        'ios_enabled' => 'boolean',
    ];

    public function servicePrice(string $cycle, string $platform): ?float
    {
        $cycle = strtolower($cycle);
        $platform = strtolower($platform);
        if (! in_array($cycle, ['monthly', 'yearly', 'lifetime'], true)) {
            return null;
        }
        if (! in_array($platform, ['web', 'android', 'ios'], true)) {
            return null;
        }

        $field = $cycle.'_price_'.$platform;
        $val = $this->{$field} ?? null;
        if ($val !== null) {
            return (float) $val;
        }

        if ($platform === 'web') {
            if ($cycle === 'monthly') {
                return $this->monthly_price !== null ? (float) $this->monthly_price : null;
            }
            if ($cycle === 'yearly') {
                return $this->yearly_price !== null ? (float) $this->yearly_price : null;
            }

            return $this->lifetime_price !== null ? (float) $this->lifetime_price : null;
        }

        return null;
    }

    public function calcTotalPrice(string $cycle, array $services): float
    {
        $total = 0.0;
        foreach (['web', 'android', 'ios'] as $platform) {
            if (! ($services[$platform] ?? false)) {
                continue;
            }
            $p = $this->servicePrice($cycle, $platform);
            $total += $p ?? 0.0;
        }

        return $total;
    }

    public function allowsService(string $platform): bool
    {
        $platform = strtolower($platform);
        if ($platform === 'web') {
            return (bool) ($this->web_enabled ?? true);
        }
        if ($platform === 'android') {
            return (bool) ($this->android_enabled ?? true);
        }
        if ($platform === 'ios') {
            return (bool) ($this->ios_enabled ?? true);
        }

        return false;
    }

    public function hasMonthlyOption()
    {
        return $this->monthly_price !== null && $this->monthly_price > 0;
    }

    public function hasYearlyOption()
    {
        return $this->yearly_price !== null && $this->yearly_price > 0;
    }

    public function hasLifetimeOption()
    {
        return $this->lifetime_price !== null && $this->lifetime_price > 0;
    }

    public function getYearlySavings()
    {
        if (! $this->hasMonthlyOption() || ! $this->hasYearlyOption()) {
            return 0;
        }

        $yearlyAsMonthly = $this->monthly_price * 12;

        return $yearlyAsMonthly - $this->yearly_price;
    }

    public function getYearlySavingsPercentage()
    {
        if (! $this->hasMonthlyOption() || ! $this->hasYearlyOption()) {
            return 0;
        }

        $yearlyAsMonthly = $this->monthly_price * 12;

        return round((($yearlyAsMonthly - $this->yearly_price) / $yearlyAsMonthly) * 100, 1);
    }
}
