import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Plus, Search, MoreVertical, Trash2, Edit2, Shield, Store } from 'lucide-react';
import { TableRowSkeleton } from '../../components/Skeleton';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    business_name: string;
    status: 'active' | 'inactive' | 'suspended';
    subscription_end: string;
    shop?: {
        id: number;
        name: string;
    };
}

export const ClientManager = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        status: 'active'
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone,
                business_name: client.business_name,
                status: client.status
            });
        } else {
            setEditingClient(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                business_name: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, formData);
            } else {
                await api.post('/clients', formData);
            }
            setIsModalOpen(false);
            fetchClients();
        } catch (error) {
            console.error(error);
            alert('حدث خطأ. قد يكون البريد الإلكتروني مسجلاً مسبقاً.');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/clients/${deleteId}`);
            setDeleteId(null);
            fetchClients();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.includes(search) ||
        c.business_name.includes(search) ||
        c.email.includes(search)
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة المشتركين (المتاجر)</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} className="ml-2" />
                    مشترك جديد
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث باسم العميل، المتجر، أو البريد الإلكتروني..."
                        className="w-full pr-10 p-2 border rounded-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="p-4">العميل</th>
                            <th className="p-4">المتجر</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">الاشتراك</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [1, 2, 3].map(i => <TableRowSkeleton key={i} />)
                        ) : filteredClients.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا يوجد مشتركين</td></tr>
                        ) : (
                            filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{client.name}</p>
                                        <p className="text-xs text-gray-500">{client.email}</p>
                                        <p className="text-xs text-gray-500">{client.phone}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Store size={16} className="text-gray-400" />
                                            <span>{client.business_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${client.status === 'active' ? 'bg-green-100 text-green-700' :
                                                client.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {client.status === 'active' ? 'نشط' : client.status === 'suspended' ? 'موقوف' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {client.subscription_end ? new Date(client.subscription_end).toLocaleDateString('ar-YE') : 'غير محدد'}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleOpenModal(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                        <button onClick={() => setDeleteId(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h3 className="font-bold text-xl mb-4">{editingClient ? 'تعديل بيانات المشترك' : 'إضافة مشترك جديد'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم العميل</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded-lg" disabled={!!editingClient} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                                    <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المتجر / النشاط التجاري</label>
                                <input required value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">حالة الحساب</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full p-2 border rounded-lg bg-white"
                                >
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="suspended">موقوف</option>
                                </select>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" fullWidth>{editingClient ? 'حفظ التغييرات' : 'إنشاء الحساب'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteId}
                title="حذف المشترك"
                message="هل أنت متأكد من رغبتك في حذف هذا المشترك؟ سيتم حذف جميع بيانات المتجر المرتبطة به."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};
