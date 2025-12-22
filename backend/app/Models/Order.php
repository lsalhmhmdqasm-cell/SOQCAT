<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'total',
        'status',
        'delivery_address',
        'delivery_person_id',
        'estimated_delivery_time',
        'delivery_fee',
        'tracking_number'
    ];

    protected $casts = [
        'estimated_delivery_time' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            if (!$order->tracking_number) {
                $order->tracking_number = 'ORD-' . strtoupper(uniqid());
            }
        });
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function updateStatus($status, $note = null, $userId = null)
    {
        $this->update(['status' => $status]);
        
        $this->statusHistory()->create([
            'status' => $status,
            'note' => $note,
            'updated_by' => $userId
        ]);
        
        return $this;
    }
}
