<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'shop_id' => Shop::factory(),
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 1, 500),
            'description' => fake()->optional()->paragraph(),
            'image' => null,
            'category' => fake()->optional()->word(),
            'is_active' => true,
        ];
    }
}
