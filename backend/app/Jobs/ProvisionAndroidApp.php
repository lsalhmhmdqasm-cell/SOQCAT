<?php

namespace App\Jobs;

use App\Models\Shop;
use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

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
        if (! $shop) {
            return;
        }

        if ($shop->enable_android && $shop->android_status === 'pending') {
            // INTEGRITY FIX: Do not fake activation.
            // Instead, mark as 'processing' and create a manual task/ticket.

            $shop->android_status = 'processing';
            $shop->save();

            // Create an internal ticket for the operations team
            try {
                // Find admin user for this shop to attach ticket to, or just create a system ticket
                $admin = $shop->users()->where('role', 'shop_admin')->first();

                SupportTicket::create([
                    'user_id' => $admin ? $admin->id : 0, // 0 or null for system
                    'shop_id' => $shop->id,
                    'subject' => 'طلب بناء تطبيق Android تلقائي',
                    'message' => "تم طلب تفعيل تطبيق Android للمتجر {$shop->name} (ID: {$shop->id}). يرجى بدء إجراءات البناء والرفع.",
                    'status' => 'open',
                    'priority' => 'high',
                    'category' => 'technical',
                ]);

                Log::info("Android Build Request Queued for Shop: {$shop->id}");

            } catch (\Exception $e) {
                Log::error("Failed to create build ticket for shop {$shop->id}: ".$e->getMessage());
            }
        }
    }
}
