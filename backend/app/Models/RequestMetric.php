<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'method',
        'path',
        'route_name',
        'status_code',
        'duration_ms',
        'is_error',
        'exception_class',
    ];

    protected $casts = [
        'is_error' => 'boolean',
        'duration_ms' => 'integer',
        'status_code' => 'integer',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
