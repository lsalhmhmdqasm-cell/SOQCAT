import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Using real API
import { AlertTriangle, Clock, Calendar, Save, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';

interface StockProduct {
    id: number;
    name: string;
    image: string;
    stock_quantity: number;
    product_type: 'regular' | 'perishable';
    expiry_date: string | null;
    shelf_life_days: number | null;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export const StockManagement = () => {
    const [products, setProducts] = useState<StockProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'expiring' | 'expired'>('all');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // In a real scenario, we might want a specific endpoint for stock management
            // For now, we'll fetch all products and filter locally or add query params if supported
            // Assuming ProductController index returns all fields
            const res = await api.get('/products?type=perishable');
            // Note: You might need to update ProductController to support type filtering or just fetch all
            // If the API doesn't support filtering by type yet, we filter on client:
            const allProducts = res.data.data || res.data;
            const perishable = allProducts.filter((p: any) => p.product_type === 'perishable');
            setProducts(perishable);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdateStock = async (id: number, quantity: number, days?: number) => {
        setSaving(id);
        try {
            await api.put(`/products/${id}/stock`, {
                stock_quantity: quantity,
                shelf_life_days: days
            });
            // Optimistic update or refetch
            setProducts(products.map(p => p.id === id ? {
                ...p,
                stock_quantity: quantity,
                shelf_life_days: days || p.shelf_life_days
            } : p));
            alert('تم تحديث المخزون بنجاح');
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء التحديث');
        } finally {
            setSaving(null);
        }
    };

    const handleMarkExpired = async () => {
        if (!window.confirm('هل أنت متأكد من إخفاء جميع المنتجات المنتهية الصلاحية؟')) return;
        try {
            const res = await api.post('/products/expired/mark');
            alert(`تم تحديث ${res.data.count} منتجات`);
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p => {
        if (filter === 'all') return true;
        // Simple client-side logic for demo. Ideally use expiry_date comparison
        const daysUntilExpiry = p.expiry_date ? Math.ceil((new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 999;

        if (filter === 'expiring') return daysUntilExpiry <= 2 && daysUntilExpiry >= 0;
        if (filter === 'expired') return daysUntilExpiry < 0 || p.stock_status === 'expired';
        return true;
    });

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة المخزون اليومي (خضار وفواكه)</h1>
                <Button onClick={handleMarkExpired} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={16} className="ml-2" />
                    تنظيف المنتهي
                </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                    الكل ({products.length})
                </button>
                <button
                    onClick={() => setFilter('expiring')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'expiring' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100'}`}
                >
                    <Clock size={16} className="inline ml-1" />
                    ينتهي قريباً
                </button>
                <button
                    onClick={() => setFilter('expired')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'expired' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100'}`}
                >
                    <AlertTriangle size={16} className="inline ml-1" />
                    منتهي الصلاحية
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                    <StockCard
                        key={product.id}
                        product={product}
                        onSave={handleUpdateStock}
                        isSaving={saving === product.id}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد منتجات مطابقة</p>
                </div>
            )}
        </div>
    );
};

const StockCard: React.FC<{ product: StockProduct; onSave: any; isSaving: boolean }> = ({ product, onSave, isSaving }) => {
    const [quantity, setQuantity] = useState(product.stock_quantity);
    const [shelfLife, setShelfLife] = useState(product.shelf_life_days || 1);

    // Check expiry
    const isExpired = product.stock_status === 'expired' || (product.expiry_date && new Date(product.expiry_date) < new Date());
    const daysLeft = product.expiry_date
        ? Math.ceil((new Date(product.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        : null;

    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border ${isExpired ? 'border-red-200 bg-red-50' : daysLeft !== null && daysLeft <= 2 ? 'border-yellow-200' : 'border-gray-200'}`}>
            <div className="flex gap-4 mb-4">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <div className="text-sm mt-1">
                        {isExpired ? (
                            <span className="text-red-600 font-bold flex items-center">
                                <AlertTriangle size={14} className="ml-1" /> منتهي الصلاحية
                            </span>
                        ) : daysLeft !== null ? (
                            <span className={`${daysLeft <= 1 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                                ينتهي خلال {daysLeft} أيام ({product.expiry_date})
                            </span>
                        ) : (
                            <span className="text-gray-500">تاريخ الصلاحية غير محدد</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">الكمية الحالية (كيلو/حبة)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setQuantity(Math.max(0, quantity - 1))} className="p-2 bg-gray-100 rounded hover:bg-gray-200">-</button>
                        <input
                            type="number"
                            className="w-full text-center p-2 border rounded"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        />
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-gray-100 rounded hover:bg-gray-200">+</button>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-500 block mb-1">تجديد الصلاحية (أيام)</label>
                    <select
                        className="w-full p-2 border rounded bg-white"
                        value={shelfLife}
                        onChange={(e) => setShelfLife(parseInt(e.target.value))}
                    >
                        <option value={1}>يوم واحد</option>
                        <option value={2}>يومان</option>
                        <option value={3}>3 أيام</option>
                        <option value={5}>5 أيام</option>
                        <option value={7}>أسبوع</option>
                        <option value={14}>أسبوعين</option>
                    </select>
                </div>

                <Button
                    fullWidth
                    onClick={() => onSave(product.id, quantity, shelfLife)}
                    disabled={isSaving}
                    isLoading={isSaving}
                    variant={isExpired ? "danger" : "primary"}
                >
                    {isExpired ? 'تجديد المخزون وإعادة التفعيل' : 'تحديث المخزون'}
                </Button>
            </div>
        </div>
    );
};
