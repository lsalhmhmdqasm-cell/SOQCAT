<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'action',
        'old_value',
        'new_value',
        'details',
        'performed_by',
        'ip_address',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
