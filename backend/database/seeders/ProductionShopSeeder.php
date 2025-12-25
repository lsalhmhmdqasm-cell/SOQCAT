<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if shop 1 exists
        if (Shop::find(1)) {
            $this->command->info('Shop ID 1 already exists. Skipping...');

            return;
        }

        // Create Shop 1
        $shop = Shop::create([
            'id' => 1, // Force ID 1
            'name' => 'متجر النسيم (تجريبي)',
            'description' => 'أول متجر على منصة قات شوب',
            'logo' => 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
            'status' => 'active',
            'delivery_fee' => 1000,
            'enable_web' => true,
            'enable_android' => true,
            'enable_ios' => false,
        ]);

        // Create Admin User for Shop 1
        User::create([
            'name' => 'مدير النسيم',
            'email' => 'admin@alnaseem.com',
            'password' => Hash::make('password123'),
            'role' => 'shop_admin',
            'shop_id' => $shop->id,
        ]);

        // Create Client Record (For Domain/Config)
        Client::create([
            'shop_id' => $shop->id,
            'shop_name' => $shop->name,
            'owner_name' => 'أحمد العميل',
            'phone' => '770000000',
            'email' => 'admin@alnaseem.com',
            'domain' => 'qatshop-frontend.onrender.com', // Link to your Render frontend domain temporarily
            'status' => 'active',
            'subscription_start' => now(),
            'subscription_end' => now()->addYear(),
        ]);

        $this->command->info('Shop ID 1 created successfully!');
    }
}
