<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryPerson extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'name',
        'phone',
        'status'
    ];

    /**
     * Get the shop this delivery person belongs to
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get orders assigned to this delivery person
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'delivery_person_id');
    }

    /**
     * Scope for available delivery persons only
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}
