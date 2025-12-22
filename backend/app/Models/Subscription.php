<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'client_id',
        'plan_name',
        'price',
        'billing_cycle',
        'features',
        'status',
        'next_billing_date',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'next_billing_date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
}
