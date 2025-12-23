<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class SuperAdminOnboardShopRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() && $this->user()->role === 'super_admin';
    }

    public function rules()
    {
        return [
            'shop_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string|max:500',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|string|email|max:255|unique:users,email',
            'admin_password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised()],
            'phone' => 'nullable|string|max:20',
            'pricing_plan_id' => 'required|integer|exists:pricing_plans,id',
        ];
    }
}
