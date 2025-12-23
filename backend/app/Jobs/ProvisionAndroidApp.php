<?php

namespace App\Jobs;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProvisionAndroidApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $shopId;

    public function __construct(int $shopId)
    {
        $this->shopId = $shopId;
    }

    public function handle(): void
    {
        $shop = Shop::find($this->shopId);
        if (!$shop) {
            return;
        }

        if ($shop->enable_android && $shop->android_status === 'pending') {
            $shop->android_status = 'active';
            $shop->android_provisioned_at = now();
            $shop->save();
        }
    }
}
