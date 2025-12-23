<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>إنشاء متجر جديد</title>
    @vite(['resources/css/app.css', 'resources/js/superadmin/onboard_shop.js'])
</head>
<body class="antialiased">
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">معالج إنشاء متجر جديد</h1>
        <div id="service-disabled-banner" style="display:none" class="mb-4 p-3 rounded bg-yellow-100 text-yellow-800"></div>
        <div id="wizard">
            <div id="steps-header" class="flex gap-2 mb-6">
                <div class="step-pill" data-step="1">بيانات المتجر</div>
                <div class="step-pill" data-step="2">بيانات المدير</div>
                <div class="step-pill" data-step="3">اختيار الباقة</div>
                <div class="step-pill" data-step="4">مراجعة وتأكيد</div>
            </div>

            <div id="step-1" class="step">
                <div class="mb-3">
                    <label class="block mb-1">اسم المتجر</label>
                    <input id="shop_name" type="text" class="w-full border rounded p-2" />
                </div>
                <div class="mb-3">
                    <label class="block mb-1">الوصف</label>
                    <textarea id="description" class="w-full border rounded p-2"></textarea>
                </div>
                <div class="mb-3">
                    <label class="block mb-1">رابط الشعار (Logo URL)</label>
                    <input id="logo" type="text" class="w-full border rounded p-2" />
                </div>
                <div class="mb-3">
                    <label class="block mb-1">رقم الهاتف</label>
                    <input id="phone" type="text" class="w-full border rounded p-2" />
                </div>
                <div class="flex gap-2">
                    <button id="next-1" class="px-4 py-2 bg-green-600 text-white rounded">التالي</button>
                </div>
                <div id="error-1" class="text-red-600 mt-2"></div>
            </div>

            <div id="step-2" class="step" style="display:none">
                <div class="mb-3">
                    <label class="block mb-1">اسم المدير</label>
                    <input id="admin_name" type="text" class="w-full border rounded p-2" />
                </div>
                <div class="mb-3">
                    <label class="block mb-1">البريد الإلكتروني</label>
                    <input id="admin_email" type="email" class="w-full border rounded p-2" />
                </div>
                <div class="mb-3">
                    <label class="block mb-1">كلمة المرور</label>
                    <input id="admin_password" type="password" class="w-full border rounded p-2" />
                </div>
                <div class="flex gap-2">
                    <button id="back-2" class="px-4 py-2 bg-gray-300 rounded">رجوع</button>
                    <button id="next-2" class="px-4 py-2 bg-green-600 text-white rounded">التالي</button>
                </div>
                <div id="error-2" class="text-red-600 mt-2"></div>
            </div>

            <div id="step-3" class="step" style="display:none">
                <div class="mb-3">
                    <label class="block mb-1">اختر الباقة</label>
                    <div id="plans-list" class="grid grid-cols-1 gap-3"></div>
                </div>
                <div class="flex gap-2">
                    <button id="back-3" class="px-4 py-2 bg-gray-300 rounded">رجوع</button>
                    <button id="next-3" class="px-4 py-2 bg-green-600 text-white rounded">التالي</button>
                </div>
                <div id="error-3" class="text-red-600 mt-2"></div>
            </div>

            <div id="step-4" class="step" style="display:none">
                <div id="review" class="mb-4 border rounded p-3"></div>
                <div class="flex gap-2">
                    <button id="back-4" class="px-4 py-2 bg-gray-300 rounded">رجوع</button>
                    <button id="submit" class="px-4 py-2 bg-blue-600 text-white rounded">إنشاء المتجر</button>
                </div>
                <div id="error-4" class="text-red-600 mt-2"></div>
                <div id="success" class="text-green-700 mt-2"></div>
            </div>
        </div>
    </div>
</body>
</html>
