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
        'logo_url',
        'primary_color',
        'secondary_color',
        'status',
        'subscription_type',
        'subscription_start',
        'subscription_end'
    ];

    protected $casts = [
        'subscription_start' => 'date',
        'subscription_end' => 'date'
    ];

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function tickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function isActive()
    {
        return $this->status === 'active' && 
               $this->subscription_end && 
               $this->subscription_end->isFuture();
    }

    public function isExpired()
    {
        return $this->subscription_end && $this->subscription_end->isPast();
    }
}
