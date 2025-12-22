import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, DollarSign, AlertCircle, Package, TrendingUp, Activity, Gauge, Timer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { echo } from '../../services/echo';

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
    const [monitoring, setMonitoring] = useState<{
        crash_free_rate: number;
        avg_response_ms: number;
        order_success_rate: number;
        requests_last_24h: number;
        errors_last_24h: number;
        shops_worst: Array<{ shop_id: number; shop_name?: string; crash_free_rate: number; errors: number; total: number }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState<Array<{ bucket: string; requests: number; errors: number; avg_response_ms: number; crash_free_rate: number }>>([]);
    const [shopId, setShopId] = useState<number | null>(null);
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');
    const [shops, setShops] = useState<Array<{ id: number; name: string }>>([]);
    const [summary, setSummary] = useState<{ from: string; to: string; shop_id: number | null; requests: number; errors: number; avg_response_ms: number; crash_free_rate: number } | null>(null);
    const [alerts, setAlerts] = useState<Array<{ type: string; value: number; threshold: number }>>([]);
    const [topEndpoints, setTopEndpoints] = useState<Array<{ path: string; total: number; errors: number; error_rate: number }>>([]);
    const [topExceptions, setTopExceptions] = useState<Array<{ exception_class: string; total: number }>>([]);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/super-admin/dashboard');
            setStats(res.data.stats);
            setMonitoring(res.data.monitoring);
            await fetchMonitoring();
            await fetchShops();
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShops = async () => {
        try {
            const res = await api.get('/shops');
            setShops(res.data || []);
        } catch {}
    };

    const fetchMonitoring = async () => {
        const params: any = {};
        if (shopId) params.shop_id = shopId;
        if (from) params.from = from;
        if (to) params.to = to;
        try {
            const res = await api.get('/super-admin/monitoring/metrics', { params });
            setSeries(res.data.series || []);
            setSummary(res.data.summary || null);
            setAlerts(res.data.alerts || []);
            setTopEndpoints(res.data.top_endpoints || []);
            setTopExceptions(res.data.top_exceptions || []);
        } catch (e) {
            console.error('Failed to load monitoring series', e);
        }
    };

    const applyFilters = async () => {
        await fetchMonitoring();
    };

    useEffect(() => {
        const channel = echo.channel('superadmin.alerts');
        channel.listen('.monitoring.alert', (e: any) => {
            if (e?.alerts && Array.isArray(e.alerts)) {
                setAlerts((prev) => [...e.alerts, ...prev].slice(0, 20));
            } else if (e?.summary) {
                // daily_summary payload
                setMonitoring(e.summary);
            }
        });
        return () => {
            echo.leaveChannel('superadmin.alerts');
        };
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(() => {
            fetchMonitoring();
        }, 30000);
        return () => clearInterval(id);
    }, [autoRefresh, shopId, from, to]);

    const downloadCSV = () => {
        const lines: string[] = [];
        lines.push('bucket,requests,errors,avg_response_ms,crash_free_rate');
        series.forEach((s) => {
            lines.push(`${s.bucket},${s.requests},${s.errors},${s.avg_response_ms},${s.crash_free_rate}`);
        });
        lines.push('');
        lines.push('path,total,errors,error_rate');
        topEndpoints.forEach((e) => {
            lines.push(`"${e.path}",${e.total},${e.errors},${e.error_rate}`);
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'monitoring.csv';
        a.click();
        URL.revokeObjectURL(url);
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

                {/* Monitoring Grid */}
                {monitoring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Crash‑Free نسبة (24س)"
                            value={`${monitoring.crash_free_rate}%`}
                            icon={<Gauge size={24} />}
                            color="green"
                        />
                        <StatCard
                            title="زمن الاستجابة (متوسط 24س)"
                            value={`${monitoring.avg_response_ms} ms`}
                            icon={<Timer size={24} />}
                            color="blue"
                        />
                        <StatCard
                            title="معدل نجاح الطلبات (24س)"
                            value={`${monitoring.order_success_rate}%`}
                            icon={<TrendingUp size={24} />}
                            color="purple"
                        />
                        <StatCard
                            title="عدد الأخطاء خلال 24س"
                            value={monitoring.errors_last_24h}
                            icon={<AlertCircle size={24} />}
                            color="orange"
                        />
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700">مرشحات المراقبة</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">المحل</label>
                            <select className="w-full border rounded-lg p-2" value={shopId || ''} onChange={(e) => setShopId(e.target.value ? Number(e.target.value) : null)}>
                                <option value="">الكل</option>
                                {shops.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">من</label>
                            <input type="datetime-local" className="w-full border rounded-lg p-2" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">إلى</label>
                            <input type="datetime-local" className="w-full border rounded-lg p-2" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <button onClick={applyFilters} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition w-full">تطبيق</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                            <span className="text-sm text-gray-600">تحديث تلقائي كل 30 ثانية</span>
                        </div>
                        <button onClick={downloadCSV} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">تحميل CSV</button>
                    </div>
                </div>

                {alerts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
                        <div className="font-bold mb-2">تنبيهات</div>
                        <ul className="list-disc ms-5">
                            {alerts.map((a, idx) => (
                                <li key={idx} className="text-sm">
                                    {a.type === 'crash_free_low' ? `انخفاض Crash‑Free: ${a.value}% (الحد ${a.threshold}%)` :
                                     a.type === 'response_time_high' ? `زمن الاستجابة مرتفع: ${a.value}ms (الحد ${a.threshold}ms)` :
                                     `${a.type}: ${a.value}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {series.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">مخطط الأداء الزمني</h3>
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <LineChart data={series}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="bucket" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="avg_response_ms" name="متوسط الاستجابة (ms)" stroke="#3b82f6" dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="errors" name="الأخطاء" stroke="#ef4444" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

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

                {monitoring && monitoring.shops_worst?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">أسوأ 5 محلات حسب Crash‑Free</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-600">
                                        <th className="py-2">المحل</th>
                                        <th className="py-2">Crash‑Free</th>
                                        <th className="py-2">الأخطاء</th>
                                        <th className="py-2">عدد الطلبات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monitoring.shops_worst.map((s) => (
                                        <tr key={s.shop_id} className="border-t">
                                            <td className="py-2">
                                                {s.shop_name || `Shop #${s.shop_id}`}
                                            </td>
                                            <td className="py-2 font-bold">{s.crash_free_rate}%</td>
                                            <td className="py-2 text-red-600">{s.errors}</td>
                                            <td className="py-2">{s.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
