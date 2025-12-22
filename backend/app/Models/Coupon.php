<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'code',
        'type', // fixed, percentage
        'value',
        'min_purchase_amount',
        'max_discount_amount',
        'usage_limit', // per coupon
        'usage_limit_per_user',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function uses()
    {
        return $this->hasMany(CouponUse::class);
    }

    public function isValidForUser($userId, $amount)
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->usage_limit > 0 && $this->used_count >= $this->usage_limit) {
            return false;
        }
        if ($this->min_purchase_amount > 0 && $amount < $this->min_purchase_amount) {
            return false;
        }

        $userUses = $this->uses()->where('user_id', $userId)->count();
        if ($this->usage_limit_per_user > 0 && $userUses >= $this->usage_limit_per_user) {
            return false;
        }

        return true;
    }
}
