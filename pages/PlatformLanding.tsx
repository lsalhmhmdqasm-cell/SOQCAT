import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Smartphone, Zap, Shield, Globe, Lock, Menu, X, Users, Timer, Star, MessageSquare, UserCircle, Server, Activity, Cloud, Gauge, MonitorSmartphone, TabletSmartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';

export const PlatformLanding = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white font-sans text-gray-900 antialiased" dir="rtl">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🍃</span>
                        <span className="font-bold text-xl text-green-800">منصة قات شوب</span>
                        <span className="hidden md:inline text-xs font-medium text-gray-500">منصة لبيع التطبيقات والباقات لأصحاب المحلات</span>
                        <span className="hidden lg:inline text-[11px] text-gray-400">المشتريات تتم داخل تطبيق كل محل لعملائه</span>
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
                        امتلك تطبيقاً لمتجرك <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400">وباقات إدارة متكاملة</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        منصة مخصصة لأصحاب المحلات لامتلاك تطبيقاتهم الخاصة وإدارة الطلبات والمخزون والعملاء.
                        نوفر لك تطبيقاً يحمل اسم متجرك وشعارك يعمل على iOS و Android مع لوحة تحكم شاملة.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => scrollToSection('contact')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-green-500/30 ring-1 ring-white/20 transition-all"
                        >
                            اطلب نسختك الآن
                        </Button>
                        <Button
                            onClick={() => navigate('/store')}
                            variant="outline"
                            className="px-8 py-4 text-lg rounded-full border-2 border-emerald-200 hover:bg-emerald-50"
                        >
                            جرب المتجر التجريبي
                        </Button>
                    </div>
                </div>
            </section>
            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">المتاجر التي تعمل معنا</h2>
                        <p className="text-gray-500">نماذج لمتاجر قيد الإطلاق وتجارب حقيقية</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                        {['النسيم','الروابي','السُّبلان','الريان','العاصمة','الميناء'].map((name, idx) => (
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
                        <h2 className="text-3xl font-extrabold text-gray-900">معاينة التطبيق</h2>
                        <p className="text-gray-500">واجهة جذابة تستجيب لجميع الأجهزة</p>
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
                        <Button onClick={() => scrollToSection('contact')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl">اطلب نسختك</Button>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">آراء العملاء</h2>
                        <p className="text-gray-500">تجارب أصحاب المحلات بعد إطلاق تطبيقاتهم</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'متجر النسيم', text: 'الإطلاق كان سريع والتجربة رائعة. زادت مبيعاتنا بعد أول شهر.' },
                            { name: 'متجر الروابي', text: 'التطبيق سهل للعملاء ولوحة التحكم مريحة جداً للإدارة.' },
                            { name: 'متجر السُّبلان', text: 'الدعم الفني ممتاز، وكل شيء تم تجهيزه باحترافية.' },
                        ].map((t, i) => (
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
                        <h2 className="text-3xl font-bold mb-4">تقنيات وأمان</h2>
                        <p className="text-gray-500">منصة موثوقة بأداء عالي وحماية لبياناتك</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <Activity className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">أداء محسّن</h3>
                            <p className="text-gray-600">تجربة سريعة باستخدام تقنيات حديثة لضمان سلاسة التصفح.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <Shield className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">حماية البيانات</h3>
                            <p className="text-gray-600">مصادقة آمنة وتشفير الاتصالات للحفاظ على سرية المعلومات.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <Cloud className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">اعتمادية عالية</h3>
                            <p className="text-gray-600">بنية قابلة للتوسع واستمرارية في العمل دون انقطاع.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <Gauge className="text-yellow-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">مراقبة وتحليلات</h3>
                            <p className="text-gray-600">تقارير وإحصائيات لدعم القرارات وتحسين الأداء.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="px-4 -mt-8 mb-12">
                <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg border border-white/40 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-1 ring-white/50">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-gray-900">+50</div>
                            <div className="text-sm text-gray-500">محلات قيد التجهيز</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg border border-white/40 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-1 ring-white/50">
                            <Timer size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-gray-900">3–7 أيام</div>
                            <div className="text-sm text-gray-500">متوسط وقت الإطلاق</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg border border-white/40 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-1 ring-white/50">
                            <Star size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-gray-900">4.9/5</div>
                            <div className="text-sm text-gray-500">رضا العملاء</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">كيف تعمل المنصة</h2>
                        <p className="text-gray-500">خطوات بسيطة لإطلاق تطبيق متجرك وبدء العمل</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">1</div>
                            <h3 className="text-xl font-bold mb-2">اختر الباقة واطلب نسختك</h3>
                            <p className="text-gray-600">حدّد الباقة المناسبة لحجم عملك وسنبدأ تجهيز نسختك فوراً.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">2</div>
                            <h3 className="text-xl font-bold mb-2">تجهيز الهوية والنطاق</h3>
                            <p className="text-gray-600">نربط اسم متجرك وشعارك ونطاقك الخاص لتعزيز علامتك التجارية.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">3</div>
                            <h3 className="text-xl font-bold mb-2">إعداد لوحة التحكم</h3>
                            <p className="text-gray-600">حساب إدارة كامل لإضافة المنتجات والطلبات والمخزون والمندوبين.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">4</div>
                            <h3 className="text-xl font-bold mb-2">إطلاق التطبيق (PWA)</h3>
                            <p className="text-gray-600">تطبيق ويب تقدمي يعمل على جميع الهواتف مع خيار رفع نسخة Native.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">5</div>
                            <h3 className="text-xl font-bold mb-2">بدء البيع داخل تطبيقك</h3>
                            <p className="text-gray-600">الزبائن يشترون من داخل تطبيق متجرك وليس من منصة قات شوب.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-4">6</div>
                            <h3 className="text-xl font-bold mb-2">دعم وتقارير</h3>
                            <p className="text-gray-600">تقارير أداء ودعم فني مستمر لضمان نجاح متجرك.</p>
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <Button onClick={() => scrollToSection('contact')} className="px-8 py-3 bg-green-600 text-white rounded-full">ابدأ الآن</Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">لماذا تختار منصة قات شوب؟</h2>
                        <p className="text-gray-500">حلول تقنية مخصصة لتمكين أصحاب المحلات من امتلاك تطبيقاتهم وباقاتهم</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Smartphone className="text-green-600" size={32} />,
                                title: "تطبيق موبايل خاص",
                                desc: "تطبيق باسم متجرك وشعارك يعمل كتطبيق متقدم (PWA) على جميع الهواتف."
                            },
                            {
                                icon: <Zap className="text-yellow-500" size={32} />,
                                title: "سرعة وأداء عالي",
                                desc: "تجربة مستخدم سريعة وسلسة تضمن سهولة الطلب للزبائن."
                            },
                            {
                                icon: <Shield className="text-blue-600" size={32} />,
                                title: "لوحة تحكم شاملة",
                                desc: "إدارة المنتجات، الطلبات، السائقين، والمخزون من مكان واحد."
                            },
                            {
                                icon: <Globe className="text-purple-600" size={32} />,
                                title: "نطاق خاص (Domain)",
                                desc: "رابط خاص بمتجرك (مثلاً: shop.qatshop.com) لتعزيز علامتك التجارية."
                            },
                            {
                                icon: <Lock className="text-red-500" size={32} />,
                                title: "أمان وحماية",
                                desc: "نسخ احتياطي يومي وحماية البيانات لضمان استمرارية عملك."
                            },
                            {
                                icon: <Check className="text-green-600" size={32} />,
                                title: "دعم فني متواصل",
                                desc: "فريق دعم فني جاهز لمساعدتك في أي وقت لضمان نجاح متجرك."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-white/40 shadow-sm hover:shadow-lg">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center mb-6">
                                    {feature.icon}
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
                        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">جاهز لإطلاق تطبيق متجرك؟</h3>
                        <p className="text-gray-600 mt-2">سنجهز لك نسخة متكاملة تحمل اسم وشعار متجرك خلال أيام.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => scrollToSection('contact')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl">اطلب نسختك الآن</Button>
                        <Button onClick={() => navigate('/store')} variant="outline" className="px-6 py-3 rounded-xl">جرب المتجر</Button>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">باقات الاشتراك</h2>
                        <p className="text-gray-400">اختر الباقة المناسبة لحجم عملك</p>
                    </div>
                    <div className="flex items-center justify-center mb-10">
                        <div className="bg-white/10 backdrop-blur-md inline-flex rounded-full p-1 ring-1 ring-white/20">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-200 hover:text-white'}`}
                            >
                                شهري
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow' : 'text-gray-200 hover:text-white'}`}
                            >
                                سنوي
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        {/* Basic Plan */}
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 ring-1 ring-white/10 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-2 text-gray-300">الباقة الأساسية</h3>
                            <div className="text-4xl font-bold mb-6 text-white">
                                {billingCycle === 'monthly' ? '100$' : '960$'} <span className="text-sm font-normal text-gray-400">{billingCycle === 'monthly' ? '/ شهرياً' : '/ سنوياً'}</span>
                            </div>
                            {billingCycle === 'yearly' && <div className="text-xs font-bold text-yellow-400 mb-4">وفر 20% عند الدفع السنوي</div>}
                            <ul className="space-y-4 mb-8 text-gray-300">
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> تطبيق PWA</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> إدارة 50 منتج</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> استقبال الطلبات</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> دعم فني عبر الإيميل</li>
                            </ul>
                            <Button fullWidth onClick={() => scrollToSection('contact')} variant="outline" className="border-white/30 text-white hover:bg-white/10">طلب الباقة</Button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-8 rounded-2xl border-4 border-emerald-500 transform scale-105 shadow-2xl shadow-emerald-500/30 relative">
                            <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">الأكثر طلباً</div>
                            <h3 className="text-xl font-bold mb-2 text-white">الباقة المتقدمة</h3>
                            <div className="text-4xl font-bold mb-6 text-white">
                                {billingCycle === 'monthly' ? '250$' : '2400$'} <span className="text-sm font-normal text-green-200">{billingCycle === 'monthly' ? '/ شهرياً' : '/ سنوياً'}</span>
                            </div>
                            {billingCycle === 'yearly' && <div className="text-xs font-bold text-white mb-4">وفر 20% عند الدفع السنوي</div>}
                            <ul className="space-y-4 mb-8 text-green-50">
                                <li className="flex gap-2"><Check size={20} className="text-white" /> كل مميزات الأساسية</li>
                                <li className="flex gap-2"><Check size={20} className="text-white" /> منتجات غير محدودة</li>
                                <li className="flex gap-2"><Check size={20} className="text-white" /> إدارة المندوبين والتوصيل</li>
                                <li className="flex gap-2"><Check size={20} className="text-white" /> تقارير وإحصائيات متقدمة</li>
                                <li className="flex gap-2"><Check size={20} className="text-white" /> نطاق خاص (Domain)</li>
                            </ul>
                            <Button fullWidth onClick={() => scrollToSection('contact')} className="bg-white text-green-700 hover:bg-gray-100">طلب الباقة</Button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 ring-1 ring-white/10 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-2 text-gray-300">باقة الشركات</h3>
                            <div className="text-4xl font-bold mb-6 text-white">تواصل معنا</div>
                            <ul className="space-y-4 mb-8 text-gray-300">
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> حلول مخصصة (Custom)</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> تطبيق Native (Store Upload)</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> سيرفر خاص (Dedicated)</li>
                                <li className="flex gap-2"><Check size={20} className="text-green-500" /> مدير حساب خاص</li>
                            </ul>
                            <Button fullWidth onClick={() => scrollToSection('contact')} variant="outline" className="border-white/30 text-white hover:bg-white/10">تواصل معنا</Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">الأسئلة الشائعة</h2>
                        <p className="text-gray-500">إجابات سريعة توضح آلية عمل المنصة</p>
                    </div>
                    <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm">
                        {[
                            { q: 'هل تتم عمليات الشراء داخل منصة قات شوب؟', a: 'لا، المشتريات تتم داخل تطبيق كل محل لعملائه. المنصة مخصّصة لتمكين المحلات من امتلاك تطبيقاتها وإدارتها.' },
                            { q: 'كم يستغرق تجهيز النسخة؟', a: 'عادة بين 3 إلى 7 أيام عمل حسب الباقة وحجم التجهيزات المطلوبة.' },
                            { q: 'هل سأحصل على نطاق خاص بمتجري؟', a: 'نعم، نوفر ربط نطاق خاص (Domain) لعرض تطبيقك باسم علامتك التجارية.' },
                            { q: 'هل يعمل التطبيق على iOS و Android؟', a: 'نعم كتطبيق ويب تقدمي (PWA) يعمل على جميع الأجهزة، مع خيار إعداد نسخة Native ورفعها للمتاجر.' },
                            { q: 'ما طرق الدفع للباقات؟', a: 'نوفر خيارات دفع مرنة حسب المنطقة، وسيتم التنسيق عبر فريق المبيعات بعد تقديم الطلب.' },
                            { q: 'هل يوجد دعم فني؟', a: 'نعم، دعم فني متواصل وخدمات صيانة وتحديثات لضمان استمرارية عمل متجرك.' },
                        ].map((item, idx) => (
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
                    <h2 className="text-3xl font-bold mb-8">ابدأ نجاحك اليوم</h2>
                    <p className="text-gray-600 mb-8">
                        قم بتعبئة النموذج وسيقوم فريق المبيعات بالتواصل معك فوراً لتجهيز تطبيق متجرك وباقتك المناسبة.
                    </p>

                    <form
                        className="space-y-4 max-w-md mx-auto text-right bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const btn = document.getElementById('contact-submit');
                            if (btn) btn.setAttribute('disabled', 'true');
                            setTimeout(() => {
                                alert('تم استلام طلبك! سيتم التواصل معك قريباً.');
                                if (btn) btn.removeAttribute('disabled');
                            }, 1000);
                        }}
                    >
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">اسم المتجر المقترح</label>
                            <input type="text" className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="مثلاً: متجر النسيم" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف (واتساب)</label>
                            <input type="tel" className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="7xxxxxxxx" dir="ltr" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">نوع الباقة المهتم بها</label>
                            <select className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>الباقة الأساسية</option>
                                <option selected>الباقة المتقدمة (Best Value)</option>
                                <option>باقة الشركات</option>
                            </select>
                        </div>
                        <Button id="contact-submit" fullWidth className="py-4 text-lg bg-green-600 hover:bg-green-700 ring-1 ring-white/20">إرسال الطلب</Button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-8 text-center text-sm border-t border-white/10">
                <p>© 2025 منصة قات شوب. جميع الحقوق محفوظة.</p>
                <p className="mt-2 text-xs opacity-50">تم التطوير بواسطة شركة الرياح للبرمجيات</p>
            </footer>
        </div>
    );
};
