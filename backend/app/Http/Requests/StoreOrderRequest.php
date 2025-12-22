<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'shop_id' => 'required|exists:shops,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:100',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'delivery_address' => 'required|string|max:500',
            'payment_method' => 'required|in:cash_on_delivery,bank_transfer,e_wallet',
            'payment_receipt' => 'nullable|required_if:payment_method,bank_transfer,e_wallet|image|max:2048', // 2MB Max
            'payment_reference' => 'nullable|required_if:payment_method,bank_transfer,e_wallet|string|max:255',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
        ];
    }

    public function messages()
    {
        return [
            'shop_id.required' => 'معرف المتجر مطلوب',
            'shop_id.exists' => 'المتجر غير موجود',
            'items.required' => 'يجب إضافة منتج واحد على الأقل',
            'items.min' => 'يجب إضافة منتج واحد على الأقل',
            'items.*.product_id.required' => 'معرف المنتج مطلوب',
            'items.*.product_id.exists' => 'المنتج غير موجود',
            'items.*.quantity.required' => 'الكمية مطلوبة',
            'items.*.quantity.min' => 'الكمية يجب أن تكون 1 على الأقل',
            'items.*.quantity.max' => 'الكمية كبيرة جداً',
            'items.*.price.required' => 'السعر مطلوب',
            'total.required' => 'الإجمالي مطلوب',
            'delivery_address.required' => 'عنوان التوصيل مطلوب',
            'delivery_address.max' => 'عنوان التوصيل طويل جداً',
        ];
    }
}
