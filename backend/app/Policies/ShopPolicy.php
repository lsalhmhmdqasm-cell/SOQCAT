<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Shop $shop): bool
    {
        return $user->isSuperAdmin() || ($user->shop_id === $shop->id);
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Shop $shop): bool
    {
        return $user->hasPermissionTo('manage_settings') &&
               ($user->isSuperAdmin() || $user->shop_id === $shop->id);
    }

    public function delete(User $user, Shop $shop): bool
    {
        return $user->isSuperAdmin();
    }
}
