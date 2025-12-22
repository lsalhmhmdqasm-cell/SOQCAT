import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, DollarSign, AlertCircle, Package, TrendingUp, Activity } from 'lucide-react';

interface Stats {
    total_clients: number;
    active_clients: number;
    trial_clients: number;
    suspended_clients: number;
    open_tickets: number;
    urgent_tickets: number;
    monthly_revenue: number;
    total_orders_today: number;
}

export const SuperAdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/super-admin/dashboard');
            setStats(res.data.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">جاري التحميل...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">لوحة التحكم المركزية</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="إجمالي المحلات"
                        value={stats?.total_clients || 0}
                        icon={<Users size={24} />}
                        color="blue"
                    />
                    <StatCard
                        title="المحلات النشطة"
                        value={stats?.active_clients || 0}
                        icon={<Activity size={24} />}
                        color="green"
                    />
                    <StatCard
                        title="الإيرادات الشهرية"
                        value={`${stats?.monthly_revenue || 0} ر.ي`}
                        icon={<DollarSign size={24} />}
                        color="purple"
                    />
                    <StatCard
                        title="التذاكر المفتوحة"
                        value={stats?.open_tickets || 0}
                        icon={<AlertCircle size={24} />}
                        color="orange"
                        urgent={stats?.urgent_tickets || 0}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">حالة المحلات</h3>
                            <Package size={20} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">نشط</span>
                                <span className="font-bold text-green-600">{stats?.active_clients}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">تجريبي</span>
                                <span className="font-bold text-blue-600">{stats?.trial_clients}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">معلق</span>
                                <span className="font-bold text-red-600">{stats?.suspended_clients}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">الطلبات اليوم</h3>
                            <TrendingUp size={20} className="text-gray-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800">
                            {stats?.total_orders_today || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">طلب جديد</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">التذاكر العاجلة</h3>
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                            {stats?.urgent_tickets || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">يحتاج معالجة فورية</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4">إجراءات سريعة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
                            إضافة محل جديد
                        </button>
                        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
                            إنشاء تحديث
                        </button>
                        <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition">
                            عرض التذاكر
                        </button>
                        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition">
                            التقارير
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
    urgent?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, urgent }) => {
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`${colors[color]} p-3 rounded-lg text-white`}>
                    {icon}
                </div>
                {urgent !== undefined && urgent > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                        {urgent} عاجل
                    </span>
                )}
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    );
};
