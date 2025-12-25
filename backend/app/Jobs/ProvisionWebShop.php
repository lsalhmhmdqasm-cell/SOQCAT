<?php

namespace App\Jobs;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProvisionWebShop implements ShouldQueue
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
        if (! $shop) {
            return;
        }

        if ($shop->enable_web && $shop->web_status === 'pending') {
            $shop->web_status = 'active';
            $shop->web_provisioned_at = now();
            $shop->save();
        }
    }
}
