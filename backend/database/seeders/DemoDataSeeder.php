<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shop;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $shopNames = ['النسيم', 'الروابي', 'السُّبلان', 'الريان', 'العاصمة', 'الميناء'];
        $shops = [];
        foreach ($shopNames as $name) {
            $shops[] = Shop::updateOrCreate(
                ['name' => $name],
                ['description' => 'متجر تجريبي', 'status' => 'active']
            );
        }

        foreach ($shops as $shop) {
            if ($shop->products()->count() < 3) {
                for ($i = 0; $i < 3; $i++) {
                    Product::create([
                        'shop_id' => $shop->id,
                        'name' => 'منتج ' . ($i + 1) . ' - ' . $shop->name,
                        'price' => rand(10, 100),
                        'description' => 'منتج تجريبي',
                        'image' => null,
                        'category' => 'عام',
                        'is_active' => true,
                    ]);
                }
            }
        }

        $userAli = User::firstOrCreate(
            ['email' => 'ali@example.com'],
            ['name' => 'علي', 'password' => Hash::make('password'), 'role' => 'customer']
        );
        $userFahd = User::firstOrCreate(
            ['email' => 'fahd@example.com'],
            ['name' => 'فهد', 'password' => Hash::make('password'), 'role' => 'customer']
        );
        $userSara = User::firstOrCreate(
            ['email' => 'sara@example.com'],
            ['name' => 'سارة', 'password' => Hash::make('password'), 'role' => 'customer']
        );

        $products = Product::orderBy('id', 'desc')->take(3)->get();
        $users = [$userAli, $userFahd, $userSara];
        foreach ($products as $idx => $product) {
            $user = $users[$idx % count($users)];
            Review::updateOrCreate(
                ['product_id' => $product->id, 'user_id' => $user->id],
                ['rating' => [5, 4, 5][$idx % 3], 'comment' => 'تقييم تجريبي ممتاز']
            );
        }
    }
}
