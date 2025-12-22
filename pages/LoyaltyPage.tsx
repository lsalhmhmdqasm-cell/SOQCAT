import React, { useState, useEffect } from 'react';
import { Gift, Award, Copy, Share2, History, Users } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { useShop } from '../context/ShopContext';

export const LoyaltyPage = () => {
    const { user } = useShop();
    const [activeTab, setActiveTab] = useState<'points' | 'referrals'>('points');
    const [loading, setLoading] = useState(true);
    const [pointsData, setPointsData] = useState<any>(null);
    const [referralData, setReferralData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pointsRes, refRes] = await Promise.all([
                api.get('/loyalty/points'),
                api.get('/referrals')
            ]);
            setPointsData(pointsRes.data);
            setReferralData(refRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (referralData?.referral_code) {
            navigator.clipboard.writeText(referralData.referral_code);
            alert('تم نسخ كود الدعوة بنجاح!');
        }
    };

    if (loading) return <div className="p-8 text-center">جاري تحميل بيانات الولاء...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-primary p-6 text-white text-center rounded-b-3xl">
                <h1 className="text-2xl font-bold mb-2">برنامج الولاء والمكافآت</h1>
                <p className="opacity-90 text-sm">اجمع النقاط واحصل على خصومات مميزة</p>

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={() => setActiveTab('points')}
                        className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'points' ? 'bg-white text-primary shadow-lg' : 'bg-primary-dark/30 text-white border border-white/30'}`}
                    >
                        <Award size={18} className="inline ml-2" />
                        نقاطي
                    </button>
                    <button
                        onClick={() => setActiveTab('referrals')}
                        className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'referrals' ? 'bg-white text-primary shadow-lg' : 'bg-primary-dark/30 text-white border border-white/30'}`}
                    >
                        <Users size={18} className="inline ml-2" />
                        دعوة صديق
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'points' && pointsData && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Balance Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                            <h2 className="text-gray-500 font-medium mb-2">رصيد النقاط الحالي</h2>
                            <div className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                                <span className="text-yellow-500">🪙</span>
                                {pointsData.balance}
                            </div>
                            <p className="text-xs text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full border border-green-100">
                                تعادل {pointsData.balance * 10} ر.ي خصم
                            </p>
                        </div>

                        {/* History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
                                <History size={18} />
                                سجل العمليات
                            </div>
                            <div className="divide-y divide-gray-100">
                                {pointsData.history.length > 0 ? pointsData.history.map((tx: any) => (
                                    <div key={tx.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{tx.description || 'عملية نقاط'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(tx.created_at).toLocaleDateString('ar-YE')}</p>
                                        </div>
                                        <span className={`font-bold text-sm ${tx.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'earned' ? '+' : '-'}{tx.points}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        لا توجد عمليات سابقة
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'referrals' && referralData && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Referral Code Card */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white text-center">
                            <Gift size={48} className="mx-auto mb-4 text-purple-200" />
                            <h2 className="text-xl font-bold mb-2">اكسب نقاط مجانية!</h2>
                            <p className="text-purple-100 text-sm mb-6">
                                شارك كود الدعوة مع أصدقائك. سيحصل صديقك على 20 نقطة، وستحصل أنت على 50 نقطة عند أول طلب له!
                            </p>

                            <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/20 mb-4 flex items-center justify-between gap-3">
                                <code className="text-xl font-mono font-bold tracking-wider">{referralData.referral_code}</code>
                                <button onClick={copyReferralCode} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                                    <Copy size={20} />
                                </button>
                            </div>

                            <Button fullWidth onClick={copyReferralCode} className="bg-white text-purple-700 hover:bg-purple-50 shadow-none border-none">
                                <Share2 size={18} className="ml-2" />
                                نسخ ومشاركة الكود
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <p className="text-gray-500 text-xs mb-1">المدعوين</p>
                                <p className="text-2xl font-bold text-gray-800">{referralData.referrals.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <p className="text-gray-500 text-xs mb-1">نقاط مكتسبة</p>
                                <p className="text-2xl font-bold text-green-600">{referralData.total_earned}</p>
                            </div>
                        </div>

                        {/* Referral List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 text-sm">
                                الأصدقاء المدعوين
                            </div>
                            <div className="divide-y divide-gray-100">
                                {referralData.referrals.length > 0 ? referralData.referrals.map((ref: any) => (
                                    <div key={ref.id} className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                {ref.referred.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{ref.referred.name}</p>
                                                <p className="text-xs text-gray-400">انضم {new Date(ref.created_at).toLocaleDateString('ar-YE')}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${ref.status === 'rewarded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {ref.status === 'rewarded' ? 'تمت المكافأة' : 'معلق'}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        لم تقم بدعوة أحد بعد
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
