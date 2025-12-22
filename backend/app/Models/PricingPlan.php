<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'monthly_price',
        'yearly_price',
        'lifetime_price',
        'features',
        'max_products',
        'max_orders_per_month',
        'max_storage_mb',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'lifetime_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

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
