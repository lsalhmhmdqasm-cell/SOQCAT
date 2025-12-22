<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PricingPlan;

class PricingPlanSeeder extends Seeder
{
    public function run()
    {
        $plans = [
            [
                'name' => 'Basic',
                'description' => 'مثالي للمحلات الصغيرة',
                'monthly_price' => 3000,
                'yearly_price' => 30000, // خصم 17%
                'lifetime_price' => 100000,
                'features' => [
                    'products' => 50,
                    'orders' => 100,
                    'storage' => '1GB',
                    'support' => 'عادي',
                    'updates' => true
                ],
                'max_products' => 50,
                'max_orders_per_month' => 100,
                'max_storage_mb' => 1024,
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'Pro',
                'description' => 'الأكثر شعبية للمحلات المتوسطة',
                'monthly_price' => 5000,
                'yearly_price' => 50000, // خصم 17%
                'lifetime_price' => 180000,
                'features' => [
                    'products' => 'unlimited',
                    'orders' => 'unlimited',
                    'storage' => '5GB',
                    'support' => 'أولوية',
                    'updates' => true,
                    'analytics' => true
                ],
                'max_products' => null, // unlimited
                'max_orders_per_month' => null, // unlimited
                'max_storage_mb' => 5120,
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'Enterprise',
                'description' => 'للمحلات الكبيرة والسلاسل',
                'monthly_price' => 10000,
                'yearly_price' => 100000, // خصم 17%
                'lifetime_price' => 350000,
                'features' => [
                    'products' => 'unlimited',
                    'orders' => 'unlimited',
                    'storage' => '20GB',
                    'support' => '24/7',
                    'updates' => true,
                    'analytics' => true,
                    'custom_domain' => true,
                    'white_label' => true
                ],
                'max_products' => null,
                'max_orders_per_month' => null,
                'max_storage_mb' => 20480,
                'is_active' => true,
                'sort_order' => 3
            ]
        ];

        foreach ($plans as $plan) {
            PricingPlan::create($plan);
        }
    }
}
