<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;

class CheckSubscriptionExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expired subscriptions and update client status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired subscriptions...');

        // 1. Check Trial Expiry
        $expiredTrials = Client::where('status', 'trial')
            ->where('subscription_end', '<', now())
            ->get();

        foreach ($expiredTrials as $client) {
            $client->update(['status' => 'expired']);
            $this->info("Client {$client->id} ({$client->shop_name}) trial expired.");
        }

        // 2. Check Active Subscription Expiry (Monthly/Yearly)
        // Lifetime subscriptions usually have null end date or very far future, so they are safe.
        $expiredSubscriptions = Client::where('status', 'active')
            ->whereNotNull('subscription_end')
            ->where('subscription_end', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $client) {
            $client->update(['status' => 'expired']);
            $this->info("Client {$client->id} ({$client->shop_name}) subscription expired.");
        }

        $this->info('Check complete.');
    }
}
