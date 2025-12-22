<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() && $this->user()->role === 'shop_admin';
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|max:999999',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:500',
            'category' => 'required|string|max:100',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'اسم المنتج مطلوب',
            'name.max' => 'اسم المنتج يجب ألا يتجاوز 255 حرف',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقماً',
            'price.min' => 'السعر يجب أن يكون أكبر من أو يساوي صفر',
            'price.max' => 'السعر كبير جداً',
            'category.required' => 'التصنيف مطلوب',
            'category.max' => 'التصنيف يجب ألا يتجاوز 100 حرف',
            'description.max' => 'الوصف يجب ألا يتجاوز 1000 حرف',
        ];
    }
}
