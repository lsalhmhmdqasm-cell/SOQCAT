import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Smartphone, Zap, Shield, Globe, Lock, Menu, X, Users, Timer, Star, MessageSquare, UserCircle, Server, Activity, Cloud, Gauge, MonitorSmartphone, TabletSmartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { PlatformLandingConfig } from '../types';

export const PlatformLanding = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [leadSubmitting, setLeadSubmitting] = useState(false);
    const [leadShopName, setLeadShopName] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [leadPlan, setLeadPlan] = useState<'basic' | 'premium' | 'enterprise'>('premium');
    const [config, setConfig] = useState<PlatformLandingConfig | null>(null);
    const [plans, setPlans] = useState<Array<{ id: number; name: string; description?: string; monthly_price?: number; yearly_price?: number; lifetime_price?: number; features?: Record<string, any>; is_active?: boolean; sort_order?: number }>>([]);
    const [partnersItems, setPartnersItems] = useState<string[]>([]);
    const [statsData, setStatsData] = useState<Array<{ icon?: string; value: string; label: string }> | null>(null);
    const [testimonialsReal, setTestimonialsReal] = useState<Array<{ name: string; text: string; rating?: number }>>([]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        api.get('/platform/landing')
            .then((res) => setConfig(res.data))
            .catch(() => {});
        api.get('/platform/pricing-plans')
            .then((res) => setPlans(res.data || []))
            .catch(() => {});
        api.get('/platform/partners')
            .then((res) => setPartnersItems(res.data?.items || []))
            .catch(() => {});
        api.get('/platform/stats')
            .then((res) => setStatsData(res.data || null))
            .catch(() => {});
        api.get('/platform/testimonials')
            .then((res) => setTestimonialsReal(res.data?.items || []))
            .catch(() => {});
    }, []);

    const brandName = config?.brand?.name || 'منصة قات شوب';
    const taglineMd = config?.brand?.tagline_md || 'منصة لبيع التطبيقات والباقات لأصحاب المحلات';
    const taglineLg = config?.brand?.tagline_lg || 'المشتريات تتم داخل تطبيق كل محل لعملائه';
    const heroTitle = config?.hero?.title || 'امتلك تطبيقاً لمتجرك';
    const heroHighlight = config?.hero?.highlight || 'وباقات إدارة متكاملة';
    const heroSubtitle = config?.hero?.subtitle || 'منصة مخصصة لأصحاب المحلات لامتلاك تطبيقاتهم الخاصة وإدارة الطلبات والمخزون والعملاء. نوفر لك تطبيقاً يحمل اسم متجرك وشعارك يعمل على iOS و Android مع لوحة تحكم شاملة.';
    const heroPrimaryCta = config?.hero?.primary_cta || 'اطلب نسختك الآن';
    const heroSecondaryCta = config?.hero?.secondary_cta || 'جرب المتجر التجريبي';

    const partnersTitle = config?.partners?.title || 'المتاجر التي تعمل معنا';
    const partnersSubtitle = config?.partners?.subtitle || 'نماذج لمتاجر قيد الإطلاق وتجارب حقيقية';
    const partners = (partnersItems.length ? partnersItems : (config?.partners?.items || ['النسيم', 'الروابي', 'السُّبلان', 'الريان', 'العاصمة', 'الميناء']));

    const previewTitle = config?.preview?.title || 'معاينة التطبيق';
    const previewSubtitle = config?.preview?.subtitle || 'واجهة جذابة تستجيب لجميع الأجهزة';
    const previewCta = config?.preview?.cta || 'اطلب نسختك';

    const testimonialsTitle = config?.testimonials?.title || 'آراء العملاء';
    const testimonialsSubtitle = config?.testimonials?.subtitle || 'تجارب أصحاب المحلات بعد إطلاق تطبيقاتهم';
    const testimonials = (testimonialsReal.length ? testimonialsReal : (config?.testimonials?.items || [
        { name: 'متجر النسيم', text: 'الإطلاق كان سريع والتجربة رائعة. زادت مبيعاتنا بعد أول شهر.' },
        { name: 'متجر الروابي', text: 'التطبيق سهل للعملاء ولوحة التحكم مريحة جداً للإدارة.' },
        { name: 'متجر السُّبلان', text: 'الدعم الفني ممتاز، وكل شيء تم تجهيزه باحترافية.' },
    ]));

    const securityTitle = config?.security?.title || 'تقنيات وأمان';
    const securitySubtitle = config?.security?.subtitle || 'منصة موثوقة بأداء عالي وحماية لبياناتك';
    const securityItems = config?.security?.items || [
        { icon: 'activity', title: 'أداء محسّن', desc: 'تجربة سريعة باستخدام تقنيات حديثة لضمان سلاسة التصفح.' },
        { icon: 'shield', title: 'حماية البيانات', desc: 'مصادقة آمنة وتشفير الاتصالات للحفاظ على سرية المعلومات.' },
        { icon: 'cloud', title: 'اعتمادية عالية', desc: 'بنية قابلة للتوسع واستمرارية في العمل دون انقطاع.' },
        { icon: 'gauge', title: 'مراقبة وتحليلات', desc: 'تقارير وإحصائيات لدعم القرارات وتحسين الأداء.' },
    ];

    const stats = (statsData && statsData.length ? statsData : (config?.stats || [
        { icon: 'users', value: '+50', label: 'محلات قيد التجهيز' },
        { icon: 'timer', value: '3–7 أيام', label: 'متوسط وقت الإطلاق' },
        { icon: 'star', value: '4.9/5', label: 'رضا العملاء' },
    ]));

    const howTitle = config?.how_it_works?.title || 'كيف تعمل المنصة';
    const howSubtitle = config?.how_it_works?.subtitle || 'خطوات بسيطة لإطلاق تطبيق متجرك وبدء العمل';
    const howCta = config?.how_it_works?.cta || 'ابدأ الآن';
    const howSteps = config?.how_it_works?.steps || [
        { title: 'اختر الباقة واطلب نسختك', desc: 'حدّد الباقة المناسبة لحجم عملك وسنبدأ تجهيز نسختك فوراً.' },
        { title: 'تجهيز الهوية والنطاق', desc: 'نربط اسم متجرك وشعارك ونطاقك الخاص لتعزيز علامتك التجارية.' },
        { title: 'إعداد لوحة التحكم', desc: 'حساب إدارة كامل لإضافة المنتجات والطلبات والمخزون والمندوبين.' },
        { title: 'إطلاق التطبيق (PWA)', desc: 'تطبيق ويب تقدمي يعمل على جميع الهواتف مع خيار رفع نسخة Native.' },
        { title: 'بدء البيع داخل تطبيقك', desc: 'الزبائن يشترون من داخل تطبيق متجرك وليس من منصة قات شوب.' },
        { title: 'دعم وتقارير', desc: 'تقارير أداء ودعم فني مستمر لضمان نجاح متجرك.' },
    ];

    const featuresTitle = config?.features?.title || 'لماذا تختار منصة قات شوب؟';
    const featuresSubtitle = config?.features?.subtitle || 'حلول تقنية مخصصة لتمكين أصحاب المحلات من امتلاك تطبيقاتهم وباقاتهم';
    const features = config?.features?.items || [
        { icon: 'smartphone', title: 'تطبيق موبايل خاص', desc: 'تطبيق باسم متجرك وشعارك يعمل كتطبيق متقدم (PWA) على جميع الهواتف.' },
        { icon: 'zap', title: 'سرعة وأداء عالي', desc: 'تجربة مستخدم سريعة وسلسة تضمن سهولة الطلب للزبائن.' },
        { icon: 'shield', title: 'لوحة تحكم شاملة', desc: 'إدارة المنتجات، الطلبات، السائقين، والمخزون من مكان واحد.' },
        { icon: 'globe', title: 'نطاق خاص (Domain)', desc: 'رابط خاص بمتجرك (مثلاً: shop.qatshop.com) لتعزيز علامتك التجارية.' },
        { icon: 'lock', title: 'أمان وحماية', desc: 'نسخ احتياطي يومي وحماية البيانات لضمان استمرارية عملك.' },
        { icon: 'check', title: 'دعم فني متواصل', desc: 'فريق دعم فني جاهز لمساعدتك في أي وقت لضمان نجاح متجرك.' },
    ];

    const ctaStripTitle = config?.cta_strip?.title || 'جاهز لإطلاق تطبيق متجرك؟';
    const ctaStripSubtitle = config?.cta_strip?.subtitle || 'سنجهز لك نسخة متكاملة تحمل اسم وشعار متجرك خلال أيام.';
    const ctaStripPrimary = config?.cta_strip?.primary_cta || 'اطلب نسختك الآن';
    const ctaStripSecondary = config?.cta_strip?.secondary_cta || 'جرب المتجر';

    const pricingTitle = config?.pricing?.title || 'باقات الاشتراك';
    const pricingSubtitle = config?.pricing?.subtitle || 'اختر الباقة المناسبة لحجم عملك';
    const pricingYearlyBadge = config?.pricing?.yearly_badge || 'وفر 20% عند الدفع السنوي';
    const cycleMonthlyLabel = config?.pricing?.cycle_labels?.monthly || 'شهري';
    const cycleYearlyLabel = config?.pricing?.cycle_labels?.yearly || 'سنوي';
    const pricingPlans = (plans.length
        ? plans.map(p => ({
            key: (p.name || '').toLowerCase(),
            name: p.name,
            monthly_price: p.monthly_price != null ? `${p.monthly_price}$` : '—',
            yearly_price: p.yearly_price != null ? `${p.yearly_price}$` : '—',
            monthly_suffix: p.monthly_price != null ? '/ شهرياً' : '',
            yearly_suffix: p.yearly_price != null ? '/ سنوياً' : '',
            features: Object.keys(p.features || {}),
            cta: 'طلب الباقة',
            highlight: /pro|premium|advanced/i.test(p.name || ''),
            badge: null,
        }))
        : (config?.pricing?.plans || [
            {
                key: 'basic',
                name: 'الباقة الأساسية',
                monthly_price: '100$',
                yearly_price: '960$',
                monthly_suffix: '/ شهرياً',
                yearly_suffix: '/ سنوياً',
                features: ['تطبيق PWA', 'إدارة 50 منتج', 'استقبال الطلبات', 'دعم فني عبر الإيميل'],
                cta: 'طلب الباقة',
                highlight: false,
                badge: null,
            },
            {
                key: 'premium',
                name: 'الباقة المتقدمة',
                monthly_price: '250$',
                yearly_price: '2400$',
                monthly_suffix: '/ شهرياً',
                yearly_suffix: '/ سنوياً',
                features: ['كل مميزات الأساسية', 'منتجات غير محدودة', 'إدارة المندوبين والتوصيل', 'تقارير وإحصائيات متقدمة', 'نطاق خاص (Domain)'],
                cta: 'طلب الباقة',
                highlight: true,
                badge: 'الأكثر طلباً',
            },
            {
                key: 'enterprise',
                name: 'باقة الشركات',
                monthly_price: 'تواصل معنا',
                yearly_price: 'تواصل معنا',
                monthly_suffix: '',
                yearly_suffix: '',
                features: ['حلول مخصصة (Custom)', 'تطبيق Native (Store Upload)', 'سيرفر خاص (Dedicated)', 'مدير حساب خاص'],
                cta: 'تواصل معنا',
                highlight: false,
                badge: null,
            },
        ]));

    const faqTitle = config?.faq?.title || 'الأسئلة الشائعة';
    const faqSubtitle = config?.faq?.subtitle || 'إجابات سريعة توضح آلية عمل المنصة';
    const faqItems = config?.faq?.items || [
        { q: 'هل تتم عمليات الشراء داخل منصة قات شوب؟', a: 'لا، المشتريات تتم داخل تطبيق كل محل لعملائه. المنصة مخصّصة لتمكين المحلات من امتلاك تطبيقاتها وإدارتها.' },
        { q: 'كم يستغرق تجهيز النسخة؟', a: 'عادة بين 3 إلى 7 أيام عمل حسب الباقة وحجم التجهيزات المطلوبة.' },
        { q: 'هل سأحصل على نطاق خاص بمتجري؟', a: 'نعم، نوفر ربط نطاق خاص (Domain) لعرض تطبيقك باسم علامتك التجارية.' },
        { q: 'هل يعمل التطبيق على iOS و Android؟', a: 'نعم كتطبيق ويب تقدمي (PWA) يعمل على جميع الأجهزة، مع خيار إعداد نسخة Native ورفعها للمتاجر.' },
        { q: 'ما طرق الدفع للباقات؟', a: 'نوفر خيارات دفع مرنة حسب المنطقة، وسيتم التنسيق عبر فريق المبيعات بعد تقديم الطلب.' },
        { q: 'هل يوجد دعم فني؟', a: 'نعم، دعم فني متواصل وخدمات صيانة وتحديثات لضمان استمرارية عمل متجرك.' },
    ];

    const contactTitle = config?.contact?.title || 'ابدأ نجاحك اليوم';
    const contactSubtitle = config?.contact?.subtitle || 'قم بتعبئة النموذج وسيقوم فريق المبيعات بالتواصل معك فوراً لتجهيز تطبيق متجرك وباقتك المناسبة.';
    const contactLabelShop = config?.contact?.labels?.shop_name || 'اسم المتجر المقترح';
    const contactLabelPhone = config?.contact?.labels?.phone || 'رقم الهاتف (واتساب)';
    const contactLabelPlan = config?.contact?.labels?.plan || 'نوع الباقة المهتم بها';
    const contactPlaceholderShop = config?.contact?.placeholders?.shop_name || 'مثلاً: متجر النسيم';
    const contactPlaceholderPhone = config?.contact?.placeholders?.phone || '7xxxxxxxx';
    const contactSubmitIdle = config?.contact?.submit?.idle || 'إرسال الطلب';
    const contactSubmitLoading = config?.contact?.submit?.loading || 'جاري الإرسال...';

    const iconForKey = (key?: string) => {
        const k = (key || '').toLowerCase();
        if (k === 'smartphone') return <Smartphone className="text-green-600" size={32} />;
        if (k === 'zap') return <Zap className="text-yellow-500" size={32} />;
        if (k === 'shield') return <Shield className="text-blue-600" size={32} />;
        if (k === 'globe') return <Globe className="text-purple-600" size={32} />;
        if (k === 'lock') return <Lock className="text-red-500" size={32} />;
        if (k === 'check') return <Check className="text-green-600" size={32} />;
        return <Server className="text-gray-500" size={32} />;
    };

    const securityIcon = (key?: string) => {
        const k = (key || '').toLowerCase();
        if (k === 'activity') return <Activity className="text-green-600" size={24} />;
        if (k === 'shield') return <Shield className="text-blue-600" size={24} />;
        if (k === 'cloud') return <Cloud className="text-purple-600" size={24} />;
        if (k === 'gauge') return <Gauge className="text-yellow-600" size={24} />;
        return <Server className="text-gray-600" size={24} />;
    };

    const statIcon = (key?: string) => {
        const k = (key || '').toLowerCase();
        if (k === 'users') return <Users size={24} />;
        if (k === 'timer') return <Timer size={24} />;
        if (k === 'star') return <Star size={24} />;
        return <Users size={24} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white font-sans text-gray-900 antialiased" dir="rtl">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🍃</span>
                        <span className="font-bold text-xl text-green-800">{brandName}</span>
                        <span className="hidden md:inline text-xs font-medium text-gray-500">{taglineMd}</span>
                        <span className="hidden lg:inline text-[11px] text-gray-400">{taglineLg}</span>
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            className="md:hidden ms-2 p-2 rounded-lg bg-gray-100 text-gray-700"
                            aria-label="فتح القائمة"
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                        <button onClick={() => scrollToSection('features')} className="hover:text-green-600 transition">المميزات</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-green-600 transition">كيف تعمل المنصة</button>
                        <button onClick={() => scrollToSection('pricing')} className="hover:text-green-600 transition">الباقات</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-green-600 transition">الأسئلة الشائعة</button>
                        <button onClick={() => scrollToSection('contact')} className="hover:text-green-600 transition">اطلب تطبيقك</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/store')}
                            className="text-sm font-bold text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg"
                        >
                            جرب المتجر التجريبي
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-bold text-green-700 hover:text-green-800 px-4 py-2"
                        >
                            دخول المشرف العام
                        </button>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 py-3 grid gap-2">
                            <button onClick={() => { setMobileOpen(false); scrollToSection('features'); }} className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50">المميزات</button>
                            <button onClick={() => { setMobileOpen(false); scrollToSection('how-it-works'); }} className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50">كيف تعمل المنصة</button>
                            <button onClick={() => { setMobileOpen(false); scrollToSection('pricing'); }} className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50">الباقات</button>
                            <button onClick={() => { setMobileOpen(false); scrollToSection('faq'); }} className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50">الأسئلة الشائعة</button>
                            <button onClick={() => { setMobileOpen(false); scrollToSection('contact'); }} className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50">اطلب تطبيقك</button>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-emerald-200 opacity-30 blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-emerald-300 opacity-30 blur-3xl"></div>
                <div className="max-w-4xl mx-auto text-center relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {heroTitle} <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400">{heroHighlight}</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        {heroSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => scrollToSection('contact')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-green-500/30 ring-1 ring-white/20 transition-all"
                        >
                            {heroPrimaryCta}
                        </Button>
                        <Button
                            onClick={() => navigate('/store')}
                            variant="outline"
                            className="px-8 py-4 text-lg rounded-full border-2 border-emerald-200 hover:bg-emerald-50"
                        >
                            {heroSecondaryCta}
                        </Button>
                    </div>
                </div>
            </section>
            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{partnersTitle}</h2>
                        <p className="text-gray-500">{partnersSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                        {partners.map((name, idx) => (
                            <div
                                key={idx}
                                className="h-20 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm flex items-center justify-center text-gray-800 font-bold hover:shadow-md hover:scale-105 transition"
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gradient-to-b from-white to-green-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">{previewTitle}</h2>
                        <p className="text-gray-500">{previewSubtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transform transition-transform hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                                <Smartphone size={20} /> هاتف
                            </div>
                            <div className="w-full h-64 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-200 flex items-center justify-center">
                                <MonitorSmartphone size={48} className="text-gray-500" />
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transform transition-transform hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                                <TabletSmartphone size={20} /> تابلت
                            </div>
                            <div className="w-full h-64 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-200 flex items-center justify-center">
                                <TabletSmartphone size={48} className="text-gray-500" />
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transform transition-transform hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                                <Globe size={20} /> متصفح
                            </div>
                            <div className="w-full h-64 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-200 flex items-center justify-center">
                                <Globe size={48} className="text-gray-500" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <Button onClick={() => scrollToSection('contact')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl">{previewCta}</Button>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{testimonialsTitle}</h2>
                        <p className="text-gray-500">{testimonialsSubtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                        <UserCircle size={20} />
                                    </div>
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                </div>
                                <div className="text-gray-600 leading-relaxed">
                                    <MessageSquare className="inline-block text-green-600 me-2" size={18} />
                                    {t.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{securityTitle}</h2>
                        <p className="text-gray-500">{securitySubtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {securityItems.map((it, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    {securityIcon(it.icon)}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{it.title}</h3>
                                <p className="text-gray-600">{it.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="px-4 -mt-8 mb-12">
                <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-4">
                    {stats.slice(0, 3).map((s, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg border border-white/40 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-1 ring-white/50">
                                {statIcon(s.icon)}
                            </div>
                            <div>
                                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                                <div className="text-sm text-gray-500">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{howTitle}</h2>
                        <p className="text-gray-500">{howSubtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {howSteps.map((s, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">{idx + 1}</div>
                                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                                <p className="text-gray-600">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <Button onClick={() => scrollToSection('contact')} className="px-8 py-3 bg-green-600 text-white rounded-full">{howCta}</Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{featuresTitle}</h2>
                        <p className="text-gray-500">{featuresSubtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-white/40 shadow-sm hover:shadow-lg">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center mb-6">
                                    {iconForKey(feature.icon)}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-12 bg-green-50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">{ctaStripTitle}</h3>
                        <p className="text-gray-600 mt-2">{ctaStripSubtitle}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => scrollToSection('contact')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl">{ctaStripPrimary}</Button>
                        <Button onClick={() => navigate('/store')} variant="outline" className="px-6 py-3 rounded-xl">{ctaStripSecondary}</Button>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{pricingTitle}</h2>
                        <p className="text-gray-400">{pricingSubtitle}</p>
                    </div>
                    <div className="flex items-center justify-center mb-10">
                        <div className="bg-white/10 backdrop-blur-md inline-flex rounded-full p-1 ring-1 ring-white/20">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-200 hover:text-white'}`}
                            >
                                {cycleMonthlyLabel}
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow' : 'text-gray-200 hover:text-white'}`}
                            >
                                {cycleYearlyLabel}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        {pricingPlans.slice(0, 3).map((p, idx) => {
                            const isHighlight = !!p.highlight;
                            const price = billingCycle === 'monthly' ? p.monthly_price : p.yearly_price;
                            const suffix = billingCycle === 'monthly' ? (p.monthly_suffix || '') : (p.yearly_suffix || '');
                            return (
                                <div
                                    key={`${p.key}-${idx}`}
                                    className={
                                        isHighlight
                                            ? 'bg-gradient-to-br from-emerald-600 to-green-600 p-8 rounded-2xl border-4 border-emerald-500 transform scale-105 shadow-2xl shadow-emerald-500/30 relative'
                                            : 'bg-white/5 p-8 rounded-2xl border border-white/10 ring-1 ring-white/10 backdrop-blur-md'
                                    }
                                >
                                    {p.badge && isHighlight && (
                                        <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">{p.badge}</div>
                                    )}
                                    <h3 className={`text-xl font-bold mb-2 ${isHighlight ? 'text-white' : 'text-gray-300'}`}>{p.name}</h3>
                                    <div className={`text-4xl font-bold mb-6 ${isHighlight ? 'text-white' : 'text-white'}`}>
                                        {price} {suffix ? <span className={`text-sm font-normal ${isHighlight ? 'text-green-200' : 'text-gray-400'}`}>{suffix}</span> : null}
                                    </div>
                                    {billingCycle === 'yearly' && pricingYearlyBadge && (
                                        <div className={`text-xs font-bold mb-4 ${isHighlight ? 'text-white' : 'text-yellow-400'}`}>{pricingYearlyBadge}</div>
                                    )}
                                    <ul className={`space-y-4 mb-8 ${isHighlight ? 'text-green-50' : 'text-gray-300'}`}>
                                        {(p.features || []).map((f, fi) => (
                                            <li key={fi} className="flex gap-2"><Check size={20} className={isHighlight ? 'text-white' : 'text-green-500'} /> {f}</li>
                                        ))}
                                    </ul>
                                    <Button
                                        fullWidth
                                        onClick={() => scrollToSection('contact')}
                                        variant={isHighlight ? undefined : 'outline'}
                                        className={isHighlight ? 'bg-white text-green-700 hover:bg-gray-100' : 'border-white/30 text-white hover:bg-white/10'}
                                    >
                                        {p.cta || 'طلب الباقة'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="faq" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">{faqTitle}</h2>
                        <p className="text-gray-500">{faqSubtitle}</p>
                    </div>
                    <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm">
                        {faqItems.map((item, idx) => (
                            <div key={idx} className="border-b border-gray-200">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between py-4 hover:text-emerald-700 transition"
                                >
                                    <span className="text-right font-bold text-gray-900">{item.q}</span>
                                    {openFaq === idx ? <ChevronUp className="text-gray-500" size={18} /> : <ChevronDown className="text-gray-500" size={18} />}
                                </button>
                                {openFaq === idx && (
                                    <div className="pb-4 text-gray-600">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">{contactTitle}</h2>
                    <p className="text-gray-600 mb-8">{contactSubtitle}</p>

                    <form
                        className="space-y-4 max-w-md mx-auto text-right bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!leadShopName || !leadPhone) return;
                            if (leadSubmitting) return;
                            setLeadSubmitting(true);
                            try {
                                await api.post('/leads', {
                                    shop_name: leadShopName,
                                    phone: leadPhone,
                                    plan_type: leadPlan,
                                });
                                alert('تم استلام طلبك! سيتم التواصل معك قريباً.');
                                setLeadShopName('');
                                setLeadPhone('');
                                setLeadPlan('premium');
                            } catch {
                                alert('حدث خطأ أثناء إرسال الطلب. حاول لاحقاً.');
                            } finally {
                                setLeadSubmitting(false);
                            }
                        }}
                    >
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{contactLabelShop}</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder={contactPlaceholderShop}
                                required
                                value={leadShopName}
                                onChange={(e) => setLeadShopName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{contactLabelPhone}</label>
                            <input
                                type="tel"
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder={contactPlaceholderPhone}
                                dir="ltr"
                                required
                                value={leadPhone}
                                onChange={(e) => setLeadPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{contactLabelPlan}</label>
                            <select
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                value={leadPlan}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === 'basic' || v === 'premium' || v === 'enterprise') {
                                        setLeadPlan(v);
                                    }
                                }}
                            >
                                <option value="basic">الباقة الأساسية</option>
                                <option value="premium">الباقة المتقدمة (Best Value)</option>
                                <option value="enterprise">باقة الشركات</option>
                            </select>
                        </div>
                        <Button
                            id="contact-submit"
                            fullWidth
                            className="py-4 text-lg bg-green-600 hover:bg-green-700 ring-1 ring-white/20 disabled:opacity-60"
                            disabled={leadSubmitting}
                        >
                            {leadSubmitting ? contactSubmitLoading : contactSubmitIdle}
                        </Button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-8 text-center text-sm border-t border-white/10">
                <p>{config?.brand?.footer_rights || '© 2025 منصة قات شوب. جميع الحقوق محفوظة.'}</p>
                <p className="mt-2 text-xs opacity-50">{config?.brand?.footer_by || 'تم التطوير بواسطة شركة الرياح للبرمجيات'}</p>
            </footer>
        </div>
    );
};
