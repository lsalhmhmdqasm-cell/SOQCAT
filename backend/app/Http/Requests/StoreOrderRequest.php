<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        $shopId = $this->input('shop_id');

        return [
            'shop_id' => [
                'required',
                'integer',
                Rule::exists('shops', 'id'),
                function (string $attribute, mixed $value, \Closure $fail) {
                    $userShopId = $this->user()?->shop_id;
                    if (! $this->user()?->isSuperAdmin()) {
                        if (! $userShopId) {
                            $fail('لا يمكن إنشاء طلب بدون متجر مرتبط بهذا المستخدم');
                            return;
                        }
                        if ((int) $userShopId !== (int) $value) {
                            $fail('المتجر غير صحيح لهذا المستخدم');
                            return;
                        }
                    }
                },
            ],
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($q) use ($shopId) {
                    return $q->where('shop_id', $shopId)->where('is_active', true);
                }),
            ],
            'items.*.quantity' => 'required|integer|min:1|max:100',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'delivery_address' => 'required|string|max:500',
            'payment_method' => 'required|in:cash_on_delivery,bank_transfer,e_wallet',
            'payment_receipt' => 'nullable|required_if:payment_method,bank_transfer,e_wallet|image|max:2048', // 2MB Max
            'payment_reference' => 'nullable|required_if:payment_method,bank_transfer,e_wallet|string|max:255',
            'payment_method_id' => [
                'nullable',
                'integer',
                Rule::exists('payment_methods', 'id')->where(function ($q) use ($shopId) {
                    return $q->where('shop_id', $shopId)->where('is_active', true);
                }),
            ],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);

        $shopId = (int) $data['shop_id'];
        $total = 0.0;
        foreach ($data['items'] as $i => $item) {
            $product = Product::where('shop_id', $shopId)->find((int) $item['product_id']);
            $unit = $product ? (float) $product->price : 0.0;
            $qty = (int) $item['quantity'];

            $data['items'][$i]['price'] = $unit;
            $total = round($total + round($unit * $qty, 2), 2);
        }

        $data['total'] = $total;

        return $data;
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
            'delivery_address.required' => 'عنوان التوصيل مطلوب',
            'delivery_address.max' => 'عنوان التوصيل طويل جداً',
        ];
    }
}
