import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, Calendar } from 'lucide-react';
import { Pagination } from '../../components/Pagination';

interface Client {
    id: number;
    shop_name: string;
    owner_name: string;
    email: string;
    phone: string;
    domain: string;
    status: 'active' | 'suspended' | 'trial' | 'expired';
    subscription_type: string;
    subscription_end: string;
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

    useEffect(() => {
        fetchClients();
    }, [currentPage, statusFilter]);

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

    const handleSuspend = async (id: number) => {
        if (!confirm('هل تريد تعليق هذا المحل؟')) return;
        try {
            await api.put(`/super-admin/clients/${id}/suspend`);
            fetchClients();
        } catch (error) {
            alert('فشل تعليق المحل');
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await api.put(`/super-admin/clients/${id}/activate`);
            fetchClients();
        } catch (error) {
            alert('فشل تفعيل المحل');
        }
    };

    const handleExtend = async (id: number) => {
        const months = prompt('عدد الأشهر للتمديد:');
        if (!months) return;
        try {
            await api.put(`/super-admin/clients/${id}/extend`, { months: parseInt(months) });
            fetchClients();
            alert('تم تمديد الاشتراك بنجاح');
        } catch (error) {
            alert('فشل تمديد الاشتراك');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المحل؟ سيتم حذف جميع البيانات!')) return;
        try {
            await api.delete(`/super-admin/clients/${id}`);
            fetchClients();
        } catch (error) {
            alert('فشل حذف المحل');
        }
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
                                            <div className="text-xs text-gray-500">حتى: {client.subscription_end}</div>
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
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="تمديد"
                                                >
                                                    <Calendar size={18} />
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
        </div>
    );
};
