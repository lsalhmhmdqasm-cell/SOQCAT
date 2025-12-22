import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Plus, Trash2, Tag, Percent, DollarSign, Calendar } from 'lucide-react';
import { TableRowSkeleton } from '../../components/Skeleton';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface Coupon {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase: number | null;
    max_uses: number | null;
    used_count: number;
    valid_until: string | null;
    is_active: boolean;
}

export const CouponManager = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        min_purchase: '',
        max_uses: '',
        valid_until: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/coupons', formData);
            setIsModalOpen(false);
            fetchCoupons();
            setFormData({
                code: '',
                type: 'percentage',
                value: '',
                min_purchase: '',
                max_uses: '',
                valid_until: ''
            });
        } catch (error) {
            console.error(error);
            alert('فشل إنشاء الكوبون. تأكد من أن الكود غير مكرر.');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/coupons/${deleteId}`);
            fetchCoupons();
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة الكوبونات والخصومات</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="ml-2" />
                    كوبون جديد
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="p-4">الكود</th>
                            <th className="p-4">الخصم</th>
                            <th className="p-4">الحد الأدنى للشراء</th>
                            <th className="p-4">الاستخدامات</th>
                            <th className="p-4">الصلاحية</th>
                            <th className="p-4">حذف</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [1, 2, 3].map(i => <TableRowSkeleton key={i} />)
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد كوبونات نشطة</td></tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold font-mono text-primary">{coupon.code}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {coupon.type === 'percentage' ? `%${coupon.value}` : `${coupon.value} ر.ي`}
                                        </span>
                                    </td>
                                    <td className="p-4">{coupon.min_purchase ? `${coupon.min_purchase} ر.ي` : '-'}</td>
                                    <td className="p-4 text-sm">
                                        {coupon.used_count} / {coupon.max_uses || '∞'}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {coupon.valid_until || 'مفتوح'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setDeleteId(coupon.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Coupon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-bold text-xl mb-4">إنشاء كوبون جديد</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">كود الخصم</label>
                                <div className="relative">
                                    <Tag size={18} className="absolute top-3 right-3 text-gray-400" />
                                    <input
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full pr-10 p-2 border rounded-lg font-mono uppercase"
                                        placeholder="SALE20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">نوع الخصم</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-white"
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ر.ي)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">القيمة</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder={formData.type === 'percentage' ? '20' : '1000'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">الحد الأدنى للشراء (اختياري)</label>
                                <input
                                    type="number"
                                    value={formData.min_purchase}
                                    onChange={e => setFormData({ ...formData, min_purchase: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">حد الاستخدام</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="عدد المرات الكلي"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" fullWidth>إنشاء الكوبون</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف الكوبون"
                message="هل أنت متأكد من حذف هذا الكوبون؟ لن يتمكن أحد من استخدامه بعد الآن."
            />
        </div>
    );
};
