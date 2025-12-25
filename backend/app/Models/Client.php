<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'shop_name',
        'owner_name',
        'email',
        'phone',
        'domain',
        'shop_id',
        'logo_url',
        'primary_color',
        'secondary_color',
        'status',
        'subscription_type',
        'license_type',
        'paid_amount',
        'payment_date',
        'subscription_start',
        'subscription_end',
    ];

    protected $casts = [
        'subscription_start' => 'datetime',
        'subscription_end' => 'datetime',
        'payment_date' => 'date',
    ];

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function tickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function logs()
    {
        return $this->hasMany(SubscriptionLog::class)->orderBy('created_at', 'desc');
    }

    public function isActive()
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->license_type === 'lifetime') {
            return true;
        }

        return $this->subscription_end && $this->subscription_end->isFuture();
    }

    public function isExpired()
    {
        if ($this->license_type === 'lifetime') {
            return false;
        }

        return $this->subscription_end && $this->subscription_end->isPast();
    }
}
