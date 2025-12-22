<?php

namespace App\Policies;

use App\Models\PaymentMethod;
use App\Models\User;

class PaymentMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isShopAdmin();
    }

    public function view(User $user, PaymentMethod $method): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isShopAdmin();
    }

    public function update(User $user, PaymentMethod $method): bool
    {
        return $user->isSuperAdmin() || ($user->isShopAdmin() && $method->shop_id === $user->shop_id);
    }

    public function delete(User $user, PaymentMethod $method): bool
    {
        return $user->isSuperAdmin() || ($user->isShopAdmin() && $method->shop_id === $user->shop_id);
    }
}

