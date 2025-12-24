<?php

namespace App\Models;

use App\Jobs\ProvisionAndroidApp;
use App\Jobs\ProvisionIOSApp;
use App\Jobs\ProvisionWebShop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'logo', 'status', 'delivery_fee',
        'enable_web', 'enable_android', 'enable_ios',
        'web_status', 'android_status', 'ios_status',
        'web_provisioned_at', 'android_provisioned_at', 'ios_provisioned_at',
        'is_locked',
    ];

    protected $casts = [
        'web_provisioned_at' => 'datetime',
        'android_provisioned_at' => 'datetime',
        'ios_provisioned_at' => 'datetime',
        'enable_web' => 'boolean',
        'enable_android' => 'boolean',
        'enable_ios' => 'boolean',
        'is_locked' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($shop) {
            $shop->web_status = ($shop->enable_web ?? true) ? 'pending' : 'disabled';
            $shop->android_status = ($shop->enable_android ?? true) ? 'pending' : 'disabled';
            $shop->ios_status = ($shop->enable_ios ?? true) ? 'pending' : 'disabled';
        });

        static::created(function (Shop $shop) {
            if ($shop->enable_web && $shop->web_status === 'pending') {
                ProvisionWebShop::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_android && $shop->android_status === 'pending') {
                ProvisionAndroidApp::dispatch($shop->id)->afterCommit();
            }
            if ($shop->enable_ios && $shop->ios_status === 'pending') {
                ProvisionIOSApp::dispatch($shop->id)->afterCommit();
            }
        });

        static::saving(function (Shop $shop) {
            if ($shop->isDirty('enable_web')) {
                $shop->web_status = $shop->enable_web
                    ? ($shop->web_provisioned_at ? 'active' : 'pending')
                    : 'disabled';
            }
            if ($shop->isDirty('enable_android')) {
                $shop->android_status = $shop->enable_android
                    ? ($shop->android_provisioned_at ? 'active' : 'pending')
                    : 'disabled';
            }
            if ($shop->isDirty('enable_ios')) {
                $shop->ios_status = $shop->enable_ios
                    ? ($shop->ios_provisioned_at ? 'active' : 'pending')
                    : 'disabled';
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function getSubscriptionAttribute()
    {
        return $this->client?->subscription;
    }
}
