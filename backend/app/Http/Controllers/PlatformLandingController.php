<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use App\Models\PricingPlan;
use App\Models\Shop;
use App\Models\Review;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PlatformLandingController extends Controller
{
    private function defaultConfig(): array
    {
        return [
            'version' => 1,
            'brand' => [
                'name' => 'منصة قات شوب',
                'tagline_md' => 'منصة لبيع التطبيقات والباقات لأصحاب المحلات',
                'tagline_lg' => 'المشتريات تتم داخل تطبيق كل محل لعملائه',
                'footer_rights' => '© 2025 منصة قات شوب. جميع الحقوق محفوظة.',
                'footer_by' => 'تم التطوير بواسطة شركة الرياح للبرمجيات',
            ],
            'hero' => [
                'title' => 'امتلك تطبيقاً لمتجرك',
                'highlight' => 'وباقات إدارة متكاملة',
                'subtitle' => 'منصة مخصصة لأصحاب المحلات لامتلاك تطبيقاتهم الخاصة وإدارة الطلبات والمخزون والعملاء. نوفر لك تطبيقاً يحمل اسم متجرك وشعارك يعمل على iOS و Android مع لوحة تحكم شاملة.',
                'primary_cta' => 'اطلب نسختك الآن',
                'secondary_cta' => 'جرب المتجر التجريبي',
            ],
            'partners' => [
                'title' => 'المتاجر التي تعمل معنا',
                'subtitle' => 'نماذج لمتاجر قيد الإطلاق وتجارب حقيقية',
                'items' => ['النسيم', 'الروابي', 'السُّبلان', 'الريان', 'العاصمة', 'الميناء'],
            ],
            'preview' => [
                'title' => 'معاينة التطبيق',
                'subtitle' => 'واجهة جذابة تستجيب لجميع الأجهزة',
                'cta' => 'اطلب نسختك',
            ],
            'testimonials' => [
                'title' => 'آراء العملاء',
                'subtitle' => 'تجارب أصحاب المحلات بعد إطلاق تطبيقاتهم',
                'items' => [
                    ['name' => 'متجر النسيم', 'text' => 'الإطلاق كان سريع والتجربة رائعة. زادت مبيعاتنا بعد أول شهر.'],
                    ['name' => 'متجر الروابي', 'text' => 'التطبيق سهل للعملاء ولوحة التحكم مريحة جداً للإدارة.'],
                    ['name' => 'متجر السُّبلان', 'text' => 'الدعم الفني ممتاز، وكل شيء تم تجهيزه باحترافية.'],
                ],
            ],
            'security' => [
                'title' => 'تقنيات وأمان',
                'subtitle' => 'منصة موثوقة بأداء عالي وحماية لبياناتك',
                'items' => [
                    ['icon' => 'activity', 'title' => 'أداء محسّن', 'desc' => 'تجربة سريعة باستخدام تقنيات حديثة لضمان سلاسة التصفح.'],
                    ['icon' => 'shield', 'title' => 'حماية البيانات', 'desc' => 'مصادقة آمنة وتشفير الاتصالات للحفاظ على سرية المعلومات.'],
                    ['icon' => 'cloud', 'title' => 'اعتمادية عالية', 'desc' => 'بنية قابلة للتوسع واستمرارية في العمل دون انقطاع.'],
                    ['icon' => 'gauge', 'title' => 'مراقبة وتحليلات', 'desc' => 'تقارير وإحصائيات لدعم القرارات وتحسين الأداء.'],
                ],
            ],
            'stats' => [
                ['icon' => 'users', 'value' => '+50', 'label' => 'محلات قيد التجهيز'],
                ['icon' => 'timer', 'value' => '3–7 أيام', 'label' => 'متوسط وقت الإطلاق'],
                ['icon' => 'star', 'value' => '4.9/5', 'label' => 'رضا العملاء'],
            ],
            'how_it_works' => [
                'title' => 'كيف تعمل المنصة',
                'subtitle' => 'خطوات بسيطة لإطلاق تطبيق متجرك وبدء العمل',
                'cta' => 'ابدأ الآن',
                'steps' => [
                    ['title' => 'اختر الباقة واطلب نسختك', 'desc' => 'حدّد الباقة المناسبة لحجم عملك وسنبدأ تجهيز نسختك فوراً.'],
                    ['title' => 'تجهيز الهوية والنطاق', 'desc' => 'نربط اسم متجرك وشعارك ونطاقك الخاص لتعزيز علامتك التجارية.'],
                    ['title' => 'إعداد لوحة التحكم', 'desc' => 'حساب إدارة كامل لإضافة المنتجات والطلبات والمخزون والمندوبين.'],
                    ['title' => 'إطلاق التطبيق (PWA)', 'desc' => 'تطبيق ويب تقدمي يعمل على جميع الهواتف مع خيار رفع نسخة Native.'],
                    ['title' => 'بدء البيع داخل تطبيقك', 'desc' => 'الزبائن يشترون من داخل تطبيق متجرك وليس من منصة قات شوب.'],
                    ['title' => 'دعم وتقارير', 'desc' => 'تقارير أداء ودعم فني مستمر لضمان نجاح متجرك.'],
                ],
            ],
            'features' => [
                'title' => 'لماذا تختار منصة قات شوب؟',
                'subtitle' => 'حلول تقنية مخصصة لتمكين أصحاب المحلات من امتلاك تطبيقاتهم وباقاتهم',
                'items' => [
                    ['icon' => 'smartphone', 'title' => 'تطبيق موبايل خاص', 'desc' => 'تطبيق باسم متجرك وشعارك يعمل كتطبيق متقدم (PWA) على جميع الهواتف.'],
                    ['icon' => 'zap', 'title' => 'سرعة وأداء عالي', 'desc' => 'تجربة مستخدم سريعة وسلسة تضمن سهولة الطلب للزبائن.'],
                    ['icon' => 'shield', 'title' => 'لوحة تحكم شاملة', 'desc' => 'إدارة المنتجات، الطلبات، السائقين، والمخزون من مكان واحد.'],
                    ['icon' => 'globe', 'title' => 'نطاق خاص (Domain)', 'desc' => 'رابط خاص بمتجرك (مثلاً: shop.qatshop.com) لتعزيز علامتك التجارية.'],
                    ['icon' => 'lock', 'title' => 'أمان وحماية', 'desc' => 'نسخ احتياطي يومي وحماية البيانات لضمان استمرارية عملك.'],
                    ['icon' => 'check', 'title' => 'دعم فني متواصل', 'desc' => 'فريق دعم فني جاهز لمساعدتك في أي وقت لضمان نجاح متجرك.'],
                ],
            ],
            'cta_strip' => [
                'title' => 'جاهز لإطلاق تطبيق متجرك؟',
                'subtitle' => 'سنجهز لك نسخة متكاملة تحمل اسم وشعار متجرك خلال أيام.',
                'primary_cta' => 'اطلب نسختك الآن',
                'secondary_cta' => 'جرب المتجر',
            ],
            'pricing' => [
                'title' => 'باقات الاشتراك',
                'subtitle' => 'اختر الباقة المناسبة لحجم عملك',
                'yearly_badge' => 'وفر 20% عند الدفع السنوي',
                'plans' => [
                    [
                        'key' => 'basic',
                        'name' => 'الباقة الأساسية',
                        'monthly_price' => '100$',
                        'yearly_price' => '960$',
                        'monthly_suffix' => '/ شهرياً',
                        'yearly_suffix' => '/ سنوياً',
                        'features' => ['تطبيق PWA', 'إدارة 50 منتج', 'استقبال الطلبات', 'دعم فني عبر الإيميل'],
                        'cta' => 'طلب الباقة',
                        'highlight' => false,
                        'badge' => null,
                    ],
                    [
                        'key' => 'premium',
                        'name' => 'الباقة المتقدمة',
                        'monthly_price' => '250$',
                        'yearly_price' => '2400$',
                        'monthly_suffix' => '/ شهرياً',
                        'yearly_suffix' => '/ سنوياً',
                        'features' => ['كل مميزات الأساسية', 'منتجات غير محدودة', 'إدارة المندوبين والتوصيل', 'تقارير وإحصائيات متقدمة', 'نطاق خاص (Domain)'],
                        'cta' => 'طلب الباقة',
                        'highlight' => true,
                        'badge' => 'الأكثر طلباً',
                    ],
                    [
                        'key' => 'enterprise',
                        'name' => 'باقة الشركات',
                        'monthly_price' => 'تواصل معنا',
                        'yearly_price' => 'تواصل معنا',
                        'monthly_suffix' => '',
                        'yearly_suffix' => '',
                        'features' => ['حلول مخصصة (Custom)', 'تطبيق Native (Store Upload)', 'سيرفر خاص (Dedicated)', 'مدير حساب خاص'],
                        'cta' => 'تواصل معنا',
                        'highlight' => false,
                        'badge' => null,
                    ],
                ],
                'cycle_labels' => [
                    'monthly' => 'شهري',
                    'yearly' => 'سنوي',
                ],
            ],
            'faq' => [
                'title' => 'الأسئلة الشائعة',
                'subtitle' => 'إجابات سريعة توضح آلية عمل المنصة',
                'items' => [
                    ['q' => 'هل تتم عمليات الشراء داخل منصة قات شوب؟', 'a' => 'لا، المشتريات تتم داخل تطبيق كل محل لعملائه. المنصة مخصّصة لتمكين المحلات من امتلاك تطبيقاتها وإدارتها.'],
                    ['q' => 'كم يستغرق تجهيز النسخة؟', 'a' => 'عادة بين 3 إلى 7 أيام عمل حسب الباقة وحجم التجهيزات المطلوبة.'],
                    ['q' => 'هل سأحصل على نطاق خاص بمتجري؟', 'a' => 'نعم، نوفر ربط نطاق خاص (Domain) لعرض تطبيقك باسم علامتك التجارية.'],
                    ['q' => 'هل يعمل التطبيق على iOS و Android؟', 'a' => 'نعم كتطبيق ويب تقدمي (PWA) يعمل على جميع الأجهزة، مع خيار إعداد نسخة Native ورفعها للمتاجر.'],
                    ['q' => 'ما طرق الدفع للباقات؟', 'a' => 'نوفر خيارات دفع مرنة حسب المنطقة، وسيتم التنسيق عبر فريق المبيعات بعد تقديم الطلب.'],
                    ['q' => 'هل يوجد دعم فني؟', 'a' => 'نعم، دعم فني متواصل وخدمات صيانة وتحديثات لضمان استمرارية عمل متجرك.'],
                ],
            ],
            'contact' => [
                'title' => 'ابدأ نجاحك اليوم',
                'subtitle' => 'قم بتعبئة النموذج وسيقوم فريق المبيعات بالتواصل معك فوراً لتجهيز تطبيق متجرك وباقتك المناسبة.',
                'labels' => [
                    'shop_name' => 'اسم المتجر المقترح',
                    'phone' => 'رقم الهاتف (واتساب)',
                    'plan' => 'نوع الباقة المهتم بها',
                ],
                'placeholders' => [
                    'shop_name' => 'مثلاً: متجر النسيم',
                    'phone' => '7xxxxxxxx',
                ],
                'submit' => [
                    'idle' => 'إرسال الطلب',
                    'loading' => 'جاري الإرسال...',
                ],
            ],
        ];
    }

    private function getOrCreateLandingSetting(): PlatformSetting
    {
        $setting = PlatformSetting::where('key', 'landing')->first();
        if (! $setting) {
            $setting = PlatformSetting::create([
                'key' => 'landing',
                'value' => $this->defaultConfig(),
            ]);
        }
        return $setting;
    }

    private function hasPlatformSettingsTable(): bool
    {
        try {
            return Schema::hasTable('platform_settings');
        } catch (Throwable) {
            return false;
        }
    }

    private function missingPlatformSettingsResponse()
    {
        return response()->json([
            'message' => 'قاعدة البيانات غير مهيأة بعد. شغّل migrations لإنشاء جدول platform_settings.',
        ], 503);
    }

    public function show(Request $request)
    {
        if ($request->boolean('default')) {
            return response()->json($this->defaultConfig());
        }
        if (! $this->hasPlatformSettingsTable()) {
            return response()->json($this->defaultConfig());
        }
        try {
            return response()->json($this->getOrCreateLandingSetting()->value);
        } catch (QueryException) {
            return response()->json($this->defaultConfig());
        }
    }

    public function adminShow(Request $request)
    {
        if (! $request->user() || $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($request->boolean('default')) {
            return response()->json($this->defaultConfig());
        }
        if (! $this->hasPlatformSettingsTable()) {
            return response()->json($this->defaultConfig());
        }
        try {
            return response()->json($this->getOrCreateLandingSetting()->value);
        } catch (QueryException) {
            return response()->json($this->defaultConfig());
        }
    }

    public function update(Request $request)
    {
        if (! $request->user() || $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if (! $this->hasPlatformSettingsTable()) {
            return $this->missingPlatformSettingsResponse();
        }

        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        try {
            $setting = $this->getOrCreateLandingSetting();
            $setting->value = $validated['config'];
            $setting->save();
        } catch (QueryException) {
            return $this->missingPlatformSettingsResponse();
        }

        return response()->json($setting->value);
    }

    public function publicPricing(Request $request)
    {
        $plans = PricingPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'description', 'monthly_price', 'yearly_price', 'lifetime_price', 'features', 'web_enabled', 'android_enabled', 'ios_enabled', 'is_active', 'sort_order']);
        return response()->json($plans);
    }

    public function partners(Request $request)
    {
        $items = Shop::orderBy('id', 'desc')->limit(6)->pluck('name')->toArray();
        return response()->json(['items' => $items]);
    }

    public function stats(Request $request)
    {
        $shops = Shop::count();
        $avgRating = round((float) Review::avg('rating'), 1);
        $avgRatingLabel = $avgRating > 0 ? "{$avgRating}/5" : '—';
        $days = '3–7 أيام';
        return response()->json([
            ['icon' => 'users', 'value' => "+{$shops}", 'label' => 'محلات مسجلة'],
            ['icon' => 'timer', 'value' => $days, 'label' => 'متوسط وقت الإطلاق'],
            ['icon' => 'star', 'value' => $avgRatingLabel, 'label' => 'رضا العملاء'],
        ]);
    }

    public function testimonials(Request $request)
    {
        $reviews = Review::with(['product.shop', 'user'])
            ->orderBy('id', 'desc')
            ->limit(3)
            ->get();
        $items = $reviews->map(function ($r) {
            $name = $r->product && $r->product->shop ? $r->product->shop->name : ($r->user->name ?? 'عميل');
            return [
                'name' => $name,
                'text' => (string) ($r->comment ?? ''),
                'rating' => (int) ($r->rating ?? 0),
            ];
        });
        return response()->json(['items' => $items]);
    }
}
