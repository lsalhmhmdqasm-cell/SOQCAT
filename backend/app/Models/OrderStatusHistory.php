<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_history';

    protected $fillable = [
        'order_id',
        'status',
        'note',
        'updated_by',
    ];

    /**
     * Get the order that owns the status history
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who updated the status
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
