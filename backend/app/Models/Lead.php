<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'shop_name',
        'phone',
        'plan_type',
        'status',
        'notes',
    ];
}
