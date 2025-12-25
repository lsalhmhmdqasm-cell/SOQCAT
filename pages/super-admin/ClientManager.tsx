import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast, ToastType } from '../../components/Toast';

interface Client {
    id: number;
    shop_name: string;
    owner_name: string;
    email: string;
    phone: string;
    domain: string;
    status: 'active' | 'suspended' | 'trial' | 'expired';
    subscription_type: string;
    subscription_end?: string | null;
}

export const ClientManager = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [plans, setPlans] = useState<Array<any>>([]);
    const [createForm, setCreateForm] = useState({
        shop_name: '',
        owner_name: '',
        email: '',
        phone: '',
        domain: '',
        subscription_type: 'monthly',
        pricing_plan_id: '',
        price: 0,
        services: { web: true, android: true, ios: true },
        admin_password: ''
    });
    const [assignModal, setAssignModal] = useState<{ open: boolean; clientId: number | null }>({ open: false, clientId: null });
    const [assignForm, setAssignForm] = useState({ pricing_plan_id: '', billing_cycle: 'monthly', services: { web: true, android: true, ios: true } });
    const [extendModal, setExtendModal] = useState<{ open: boolean; clientId: number | null; months: string }>({ open: false, clientId: null, months: '1' });
    const [confirm, setConfirm] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isLoading?: boolean }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        isLoading: false
    });
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const showToast = (message: string, type: ToastType = 'info') => setToast({ message, type });

    useEffect(() => {
        fetchClients();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;

            const res = await api.get('/super-admin/clients', { params });
            setClients(res.data.data);
            setTotalPages(res.data.last_page);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await api.get('/super_admin/pricing-plans');
            const list = res.data || [];
            setPlans(list);
            setCreateForm((prev) => {
                if (prev.pricing_plan_id || !Array.isArray(list) || list.length === 0) return prev;
                const first = list[0];
                const allowed = {
                    web: !!first?.web_enabled,
                    android: !!first?.android_enabled,
                    ios: !!first?.ios_enabled,
                };
                const services = { ...prev.services, ...allowed };
                const price = calcPlanTotal(first, prev.subscription_type, services);
                return { ...prev, pricing_plan_id: String(first.id), price, services };
            });
        } catch {}
    };

    const getPlatformPrice = (plan: any, cycle: string, platform: 'web' | 'android' | 'ios') => {
        const key = `${cycle}_price_${platform}`;
        const v = plan?.[key];
        if (typeof v === 'number') return v;
        if (platform === 'web') {
            if (cycle === 'monthly') return typeof plan?.monthly_price === 'number' ? plan.monthly_price : 0;
            if (cycle === 'yearly') return typeof plan?.yearly_price === 'number' ? plan.yearly_price : 0;
            if (cycle === 'lifetime') return typeof plan?.lifetime_price === 'number' ? plan.lifetime_price : 0;
        }
        return 0;
    };

    const calcPlanTotal = (plan: any, cycle: string, services: { web: boolean; android: boolean; ios: boolean }) => {
        let total = 0;
        if (services.web) total += getPlatformPrice(plan, cycle, 'web');
        if (services.android) total += getPlatformPrice(plan, cycle, 'android');
        if (services.ios) total += getPlatformPrice(plan, cycle, 'ios');
        return total;
    };

    const handleSuspend = async (id: number) => {
        setConfirm({
            isOpen: true,
            title: 'تأكيد تعليق المحل',
            message: 'هل تريد تعليق هذا المحل؟',
            onConfirm: async () => {
                try {
                    await api.put(`/super-admin/clients/${id}/suspend`);
                    fetchClients();
                    showToast('تم تعليق المحل بنجاح', 'success');
                } catch (error) {
                    showToast('فشل تعليق المحل', 'error');
                } finally {
                    setConfirm((c) => ({ ...c, isOpen: false, isLoading: false }));
                }
            },
            isLoading: false
        });
    };

    const handleActivate = async (id: number) => {
        try {
            await api.put(`/super-admin/clients/${id}/activate`);
            fetchClients();
            showToast('تم تفعيل المحل بنجاح', 'success');
        } catch (error) {
            showToast('فشل تفعيل المحل', 'error');
        }
    };

    const handleExtend = async (id: number) => {
        setExtendModal({ open: true, clientId: id, months: '1' });
    };

    const handleDelete = async (id: number) => {
        setConfirm({
            isOpen: true,
            title: 'حذف المحل',
            message: 'هل أنت متأكد من حذف هذا المحل؟ سيتم حذف جميع البيانات!',
            onConfirm: async () => {
                try {
                    await api.delete(`/super-admin/clients/${id}`);
                    fetchClients();
                    showToast('تم حذف المحل بنجاح', 'success');
                } catch (error) {
                    showToast('فشل حذف المحل', 'error');
                } finally {
                    setConfirm((c) => ({ ...c, isOpen: false, isLoading: false }));
                }
            },
            isLoading: false
        });
    };
    const formatDate = (d: Date | null | undefined) => {
        if (!d || isNaN(d.getTime())) return 'غير محدد';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            trial: 'bg-blue-100 text-blue-700',
            suspended: 'bg-red-100 text-red-700',
            expired: 'bg-gray-100 text-gray-700'
        };
        const labels = {
            active: 'نشط',
            trial: 'تجريبي',
            suspended: 'معلق',
            expired: 'منتهي'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">إدارة المحلات</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        إضافة محل جديد
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchClients()}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="trial">تجريبي</option>
                            <option value="suspended">معلق</option>
                            <option value="expired">منتهي</option>
                        </select>
                        <button
                            onClick={fetchClients}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            بحث
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">جاري التحميل...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحل</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المالك</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدومين</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاشتراك</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{client.shop_name}</div>
                                            <div className="text-sm text-gray-500">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.owner_name}</div>
                                            <div className="text-sm text-gray-500">{client.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{client.domain}</td>
                                        <td className="px-6 py-4">{getStatusBadge(client.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.subscription_type}</div>
                                            <div className="text-xs text-gray-500">
                                                حتى:{' '}
                                                {client.subscription_type === 'lifetime'
                                                    ? 'مدى الحياة'
                                                    : (client.subscription_end || 'غير محدد')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {client.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleSuspend(client.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="تعليق"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(client.id)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="تفعيل"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleExtend(client.id)}
                                                    className={`text-blue-600 hover:text-blue-800 ${client.subscription_type === 'lifetime' ? 'opacity-40 cursor-not-allowed hover:text-blue-600' : ''}`}
                                                    title={client.subscription_type === 'lifetime' ? 'مدى الحياة لا يحتاج تمديد' : 'تمديد'}
                                                    disabled={client.subscription_type === 'lifetime'}
                                                >
                                                    <Calendar size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setAssignModal({ open: true, clientId: client.id }); setAssignForm({ pricing_plan_id: '', billing_cycle: 'monthly', services: { web: true, android: true, ios: true } }); }}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="إسناد باقة"
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">إضافة محل جديد</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">اسم المحل</label>
                                <input className="w-full px-4 py-2 border rounded-lg" value={createForm.shop_name} onChange={(e) => setCreateForm({ ...createForm, shop_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">اسم المالك</label>
                                <input className="w-full px-4 py-2 border rounded-lg" value={createForm.owner_name} onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                                <input type="email" className="w-full px-4 py-2 border rounded-lg" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">الهاتف</label>
                                <input className="w-full px-4 py-2 border rounded-lg" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-2">الدومين</label>
                                <input className="w-full px-4 py-2 border rounded-lg" value={createForm.domain} onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })} placeholder="shop1.qatshop.com" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-2">كلمة مرور مدير المحل (اختياري)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="اتركه فارغاً لإنشاء كلمة مرور تلقائياً"
                                    value={createForm.admin_password}
                                    onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">الباقة</label>
                                <select className="w-full px-4 py-2 border rounded-lg" value={createForm.pricing_plan_id} onChange={(e) => {
                                    const pid = e.target.value;
                                    const plan = plans.find(p => String(p.id) === String(pid));
                                    const nextServices = {
                                        web: !!plan?.web_enabled,
                                        android: !!plan?.android_enabled,
                                        ios: !!plan?.ios_enabled,
                                    };
                                    const price = plan ? calcPlanTotal(plan, createForm.subscription_type, nextServices) : 0;
                                    setCreateForm({ ...createForm, pricing_plan_id: pid, services: nextServices, price });
                                }}>
                                    <option value="">اختر الباقة</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">نوع الاشتراك</label>
                                <select className="w-full px-4 py-2 border rounded-lg" value={createForm.subscription_type} onChange={(e) => {
                                    const sub = e.target.value;
                                    const plan = plans.find(p => String(p.id) === String(createForm.pricing_plan_id));
                                    const price = plan ? calcPlanTotal(plan, sub, createForm.services) : 0;
                                    setCreateForm({ ...createForm, subscription_type: sub, price });
                                }}>
                                    <option value="monthly">شهري</option>
                                    <option value="yearly">سنوي</option>
                                    <option value="lifetime">مدى الحياة</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">السعر</label>
                                <input type="number" className="w-full px-4 py-2 border rounded-lg bg-gray-50" value={createForm.price} readOnly />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-bold mb-2">الخدمات</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(() => {
                                    const plan = plans.find(p => String(p.id) === String(createForm.pricing_plan_id));
                                    const allowed = {
                                        web: !!plan?.web_enabled,
                                        android: !!plan?.android_enabled,
                                        ios: !!plan?.ios_enabled,
                                    };
                                    const setSvc = (k: 'web' | 'android' | 'ios') => {
                                        if (!allowed[k]) return;
                                        const nextServices = { ...createForm.services, [k]: !createForm.services[k] };
                                        const price = plan ? calcPlanTotal(plan, createForm.subscription_type, nextServices) : 0;
                                        setCreateForm({ ...createForm, services: nextServices, price });
                                    };
                                    return (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSvc('web')}
                                                className={`px-4 py-2 rounded-lg border ${!allowed.web ? 'opacity-40 cursor-not-allowed' : ''} ${createForm.services.web ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                disabled={!allowed.web}
                                            >
                                                Web
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSvc('android')}
                                                className={`px-4 py-2 rounded-lg border ${!allowed.android ? 'opacity-40 cursor-not-allowed' : ''} ${createForm.services.android ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                disabled={!allowed.android}
                                            >
                                                Android
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSvc('ios')}
                                                className={`px-4 py-2 rounded-lg border ${!allowed.ios ? 'opacity-40 cursor-not-allowed' : ''} ${createForm.services.ios ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                disabled={!allowed.ios}
                                            >
                                                iOS
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={async () => {
                                    if (!createForm.pricing_plan_id) {
                                        showToast('يرجى اختيار الباقة أولاً', 'warning');
                                        return;
                                    }
                                    try {
                                        const res = await api.post('/super-admin/clients', {
                                            ...createForm,
                                            services: createForm.services,
                                        });
                                        setShowModal(false);
                                        setCreateForm({ shop_name: '', owner_name: '', email: '', phone: '', domain: '', subscription_type: 'monthly', pricing_plan_id: '', price: 0, services: { web: true, android: true, ios: true }, admin_password: '' });
                                        fetchClients();
                                        const admin = res?.data?.admin_user;
                                        if (admin?.email && admin?.password) {
                                            showToast(`تم إنشاء المحل بنجاح. بيانات مدير المحل: البريد ${admin.email} ، كلمة المرور ${admin.password}`, 'success');
                                        } else {
                                            showToast('تم إنشاء المحل بنجاح', 'success');
                                        }
                                    } catch (e: any) {
                                        const status = e?.response?.status;
                                        const data = e?.response?.data;
                                        const message = data?.message;
                                        const errors = data?.errors;

                                        if (status === 422 && errors && typeof errors === 'object') {
                                            const firstMessages = Object.values(errors)
                                                .flat()
                                                .filter(Boolean)
                                                .slice(0, 3)
                                                .join(' | ');
                                            showToast(firstMessages || message || 'تحقق من البيانات المدخلة', 'error');
                                            return;
                                        }

                                        showToast(message || 'فشل إنشاء المحل', 'error');
                                    }
                                }}
                                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                            >
                                إنشاء
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {assignModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">إسناد باقة</h2>
                        <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">الباقة</label>
                                        <select className="w-full px-4 py-2 border rounded-lg" value={assignForm.pricing_plan_id} onChange={(e) => {
                                            const pid = e.target.value;
                                            const plan = plans.find(p => String(p.id) === String(pid));
                                            const next = {
                                                web: !!plan?.web_enabled,
                                                android: !!plan?.android_enabled,
                                                ios: !!plan?.ios_enabled,
                                            };
                                            setAssignForm({ ...assignForm, pricing_plan_id: pid, services: next });
                                        }}>
                                            <option value="">اختر الباقة</option>
                                            {plans.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">الدورة</label>
                                        <select className="w-full px-4 py-2 border rounded-lg" value={assignForm.billing_cycle} onChange={(e) => setAssignForm({ ...assignForm, billing_cycle: e.target.value })}>
                                            <option value="monthly">شهري</option>
                                            <option value="yearly">سنوي</option>
                                            <option value="lifetime">مدى الحياة</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-2">الخدمات</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(() => {
                                                const plan = plans.find(p => String(p.id) === String(assignForm.pricing_plan_id));
                                                const allowed = {
                                                    web: !!plan?.web_enabled,
                                                    android: !!plan?.android_enabled,
                                                    ios: !!plan?.ios_enabled,
                                                };
                                                const setSvc = (k: 'web' | 'android' | 'ios') => {
                                                    if (!allowed[k]) return;
                                                    setAssignForm({ ...assignForm, services: { ...assignForm.services, [k]: !assignForm.services[k] } });
                                                };
                                                return (
                                                    <>
                                                        <button type="button" onClick={() => setSvc('web')} className={`px-4 py-2 rounded-lg border ${!allowed.web ? 'opacity-40 cursor-not-allowed' : ''} ${assignForm.services.web ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`} disabled={!allowed.web}>Web</button>
                                                        <button type="button" onClick={() => setSvc('android')} className={`px-4 py-2 rounded-lg border ${!allowed.android ? 'opacity-40 cursor-not-allowed' : ''} ${assignForm.services.android ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`} disabled={!allowed.android}>Android</button>
                                                        <button type="button" onClick={() => setSvc('ios')} className={`px-4 py-2 rounded-lg border ${!allowed.ios ? 'opacity-40 cursor-not-allowed' : ''} ${assignForm.services.ios ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`} disabled={!allowed.ios}>iOS</button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={async () => {
                                            if (!assignModal.clientId || !assignForm.pricing_plan_id) return;
                                            try {
                                                await api.post(`/super_admin/clients/${assignModal.clientId}/assign-plan`, {
                                                    pricing_plan_id: assignForm.pricing_plan_id,
                                                    billing_cycle: assignForm.billing_cycle,
                                                    services: assignForm.services,
                                                });
                                                setAssignModal({ open: false, clientId: null });
                                                fetchClients();
                                                showToast('تم الإسناد بنجاح', 'success');
                                    } catch {
                                        showToast('فشل الإسناد', 'error');
                                    }
                                }}
                            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                            >
                                حفظ
                            </button>
                            <button
                                onClick={() => setAssignModal({ open: false, clientId: null })}
                                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {extendModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">تمديد الاشتراك</h2>
                        <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">تاريخ الانتهاء الحالي</span>
                                    <span className="font-bold text-gray-800">
                                        {(() => {
                                            const c = clients.find((x) => x.id === extendModal.clientId);
                                            const cur = c?.subscription_end ? new Date(c.subscription_end) : null;
                                            return formatDate(cur as any);
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-600">بعد التمديد</span>
                                    <span className="font-bold text-green-700">
                                        {(() => {
                                            const c = clients.find((x) => x.id === extendModal.clientId);
                                            const cur = c?.subscription_end ? new Date(c.subscription_end) : null;
                                            const months = parseInt(extendModal.months || '0');
                                            if (!months || months < 1) return '—';
                                            const base = cur && !isNaN(cur.getTime()) ? cur : new Date();
                                            const d = new Date(base.getTime());
                                            d.setMonth(d.getMonth() + months);
                                            return formatDate(d);
                                        })()}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">عدد الأشهر</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={extendModal.months}
                                    onChange={(e) => setExtendModal({ ...extendModal, months: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={async () => {
                                    if (!extendModal.clientId) return;
                                    const m = parseInt(extendModal.months || '0');
                                    if (isNaN(m) || m < 1) {
                                        showToast('يرجى إدخال عدد أشهر صحيح', 'warning');
                                        return;
                                    }
                                    try {
                                        await api.put(`/super-admin/clients/${extendModal.clientId}/extend`, { months: m });
                                        setExtendModal({ open: false, clientId: null, months: '1' });
                                        fetchClients();
                                        showToast('تم تمديد الاشتراك بنجاح', 'success');
                                    } catch {
                                        showToast('فشل تمديد الاشتراك', 'error');
                                    }
                                }}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                            >
                                حفظ
                            </button>
                            <button
                                onClick={() => setExtendModal({ open: false, clientId: null, months: '1' })}
                                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={confirm.isOpen}
                title={confirm.title}
                message={confirm.message}
                onConfirm={confirm.onConfirm}
                onCancel={() => setConfirm((c) => ({ ...c, isOpen: false }))}
                isLoading={confirm.isLoading}
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
