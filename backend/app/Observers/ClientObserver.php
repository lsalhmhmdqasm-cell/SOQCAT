<?php

namespace App\Observers;

use App\Models\Client;
use App\Models\Shop;
use App\Models\SubscriptionLog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Request;

class ClientObserver
{
    /**
     * Handle the Client "updated" event.
     */
    public function updated(Client $client): void
    {
        // 1. Sync Status to Shop
        if ($client->isDirty('status')) {
            $this->syncShopStatus($client);
            $this->logStatusChange($client);
        }

        // 2. Log Subscription Extension
        if ($client->isDirty('subscription_end')) {
            $this->logExtension($client);
        }
    }

    private function syncShopStatus(Client $client)
    {
        $shop = Shop::find($client->shop_id);
        if ($shop) {
            $statusMap = [
                'active' => 'active',
                'trial' => 'active',
                'suspended' => 'suspended',
                'expired' => 'suspended',
            ];

            $newStatus = $statusMap[$client->status] ?? 'suspended';

            if ($shop->status !== $newStatus) {
                $shop->status = $newStatus;
                $shop->save();
            }
        }
    }

    private function logStatusChange(Client $client)
    {
        SubscriptionLog::create([
            'client_id' => $client->id,
            'action' => 'status_change',
            'old_value' => $client->getOriginal('status'),
            'new_value' => $client->status,
            'performed_by' => auth()->id(), // Null if console/system
            'ip_address' => Request::ip(),
            'details' => json_encode(['source' => app()->runningInConsole() ? 'console' : 'web']),
        ]);
    }

    private function logExtension(Client $client)
    {
        $old = $client->getOriginal('subscription_end');
        $oldValue = null;
        if ($old) {
            $oldValue = Carbon::parse($old)->toDateTimeString();
        }

        $newValue = $client->subscription_end ? $client->subscription_end->toDateTimeString() : null;

        SubscriptionLog::create([
            'client_id' => $client->id,
            'action' => 'extended',
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'performed_by' => auth()->id(),
            'ip_address' => Request::ip(),
            'details' => json_encode(['source' => app()->runningInConsole() ? 'console' : 'web']),
        ]);
    }
}
