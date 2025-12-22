import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, CreditCard, Smartphone } from 'lucide-react';
import { api } from '../../services/api';

interface PaymentMethod {
    id: number;
    type: 'bank_transfer' | 'e_wallet';
    is_active: boolean;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    branch?: string;
    e_wallet_network?: string;
    wallet_name?: string;
    wallet_number?: string;
    instructions?: string;
}

const PaymentSettings = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'bank_transfer',
        bank_name: '',
        account_name: '',
        account_number: '',
        branch: '',
        e_wallet_network: '',
        wallet_name: '',
        wallet_number: '',
        instructions: ''
    });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const response = await api.get('/payment-methods');
            setMethods(response.data);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/payment-methods', formData);
            setShowForm(false);
            setFormData({
                type: 'bank_transfer',
                bank_name: '',
                account_name: '',
                account_number: '',
                branch: '',
                e_wallet_network: '',
                wallet_name: '',
                wallet_number: '',
                instructions: ''
            });
            fetchMethods();
        } catch (error) {
            console.error('Error creating payment method:', error);
            alert('حدث خطأ أثناء إضافة طريقة الدفع');
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.post(`/payment-methods/${id}/toggle`);
            fetchMethods();
        } catch (error) {
            console.error('Error toggling payment method:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) return;
        try {
            await api.delete(`/payment-methods/${id}`);
            fetchMethods();
        } catch (error) {
            console.error('Error deleting payment method:', error);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">إعدادات طرق الدفع</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
                >
                    <Plus size={20} />
                    إضافة طريقة دفع
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">إضافة طريقة دفع جديدة</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">نوع الطريقة</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="bank_transfer">تحويل بنكي 🏦</option>
                                <option value="e_wallet">محفظة إلكترونية 💰</option>
                            </select>
                        </div>

                        {formData.type === 'bank_transfer' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">اسم البنك</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="مثال: بنك الكريمي"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">رقم الحساب</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="123456789"
                                            value={formData.account_number}
                                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">اسم صاحب الحساب</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            value={formData.account_name}
                                            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الفرع (اختياري)</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الشبكة</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="مثال: الشبكة الموحدة"
                                            value={formData.e_wallet_network}
                                            onChange={(e) => setFormData({ ...formData, e_wallet_network: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">رقم المحفظة/الهاتف</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="77xxxxxxx"
                                            value={formData.wallet_number}
                                            onChange={(e) => setFormData({ ...formData, wallet_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">اسم صاحب المحفظة</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            value={formData.wallet_name}
                                            onChange={(e) => setFormData({ ...formData, wallet_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">تعليمات إضافية</label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                placeholder="مثال: يرجى إرسال الإيصال عبر الواتساب أيضاَ..."
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                            >
                                حفظ الطريقة
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {methods.map((method) => (
                    <div key={method.id} className={`bg-white p-6 rounded-lg shadow-md border-r-4 ${method.is_active ? 'border-green-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${method.type === 'bank_transfer' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {method.type === 'bank_transfer' ? <CreditCard size={24} /> : <Smartphone size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {method.type === 'bank_transfer' ? method.bank_name : method.e_wallet_network}
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${method.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {method.is_active ? 'نشط' : 'معطل'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggle(method.id)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                    title={method.is_active ? 'تعطيل' : 'تفعيل'}
                                >
                                    {method.is_active ? <X size={20} /> : <Check size={20} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(method.id)}
                                    className="p-1 hover:bg-red-50 rounded text-red-500"
                                    title="حذف"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>الاسم:</span>
                                <span className="font-medium text-gray-900">
                                    {method.type === 'bank_transfer' ? method.account_name : method.wallet_name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>الرقم:</span>
                                <span className="font-medium text-gray-900 font-mono">
                                    {method.type === 'bank_transfer' ? method.account_number : method.wallet_number}
                                </span>
                            </div>
                            {method.branch && (
                                <div className="flex justify-between">
                                    <span>الفرع:</span>
                                    <span className="font-medium text-gray-900">{method.branch}</span>
                                </div>
                            )}
                        </div>

                        {method.instructions && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                                <p>{method.instructions}</p>
                            </div>
                        )}
                    </div>
                ))}

                {methods.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">لم تقم بإضافة طرق دفع بعد</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-primary hover:underline font-medium"
                        >
                            إضافة طريقة دفع جديدة الآن
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSettings;
