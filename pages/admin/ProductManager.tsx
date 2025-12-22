import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Search } from 'lucide-react';
import { Product, Category } from '../../types';
import { api } from '../../services/api'; // ✅ استخدام Real API
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableRowSkeleton } from '../../components/Skeleton';

export const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Perishable Logic
  const [productType, setProductType] = useState<'regular' | 'perishable'>('regular');
  const [shelfLife, setShelfLife] = useState('1');

  const refreshData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setPrice(product.price.toString());
      setDesc(product.description);
      setCat(product.category);
      setImage(product.image);
      setProductType((product as any).product_type || 'regular');
      setShelfLife(String((product as any).shelf_life_days || '1'));
    } else {
      setEditingProduct(null);
      setName('');
      setPrice('');
      setDesc('');
      setCat(categories[0]?.name || '');
      setImage('');
      setProductType('regular');
      setShelfLife('1');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = image;

      // Upload image if new file selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await api.post('/upload/product-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageUrl = uploadRes.data.url;
      }

      const productData = {
        name,
        price: Number(price),
        description: desc,
        category: cat,
        image: imageUrl || 'https://via.placeholder.com/150',
        product_type: productType,
        shelf_life_days: productType === 'perishable' ? Number(shelfLife) : null
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post('/products', productData);
      }

      setIsModalOpen(false);
      setImageFile(null);
      refreshData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('فشل حفظ المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setDeleteId(null);
      refreshData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('فشل حذف المنتج.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">المنتجات</h2>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث في المنتجات..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span className="hidden md:inline">إضافة منتج</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="p-4 font-medium">المنتج</th>
              <th className="p-4 font-medium">السعر</th>
              <th className="p-4 font-medium">التصنيف</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3].map(i => <TableRowSkeleton key={i} />)
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا توجد منتجات مطابقة.</td></tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <span className="font-bold text-gray-700">{p.name}</span>
                  </td>
                  <td className="p-4 text-green-600 font-bold">{p.price.toLocaleString()} ر.ي</td>
                  <td className="p-4 text-gray-500">{p.category}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingProduct ? 'تعديل منتج' : 'منتج جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <select value={cat} onChange={e => setCat(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
                    <option value="">اختر التصنيف</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* New Perishable Settings */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productType === 'perishable'}
                    onChange={(e) => setProductType(e.target.checked ? 'perishable' : 'regular')}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="font-bold text-gray-800">منتج قابل للتلف (خضار/فواكه)</span>
                </label>

                {productType === 'perishable' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-1 text-gray-600">مدة الصلاحية (أيام)</label>
                    <select
                      value={shelfLife}
                      onChange={(e) => setShelfLife(e.target.value)}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                    >
                      <option value="1">يوم واحد</option>
                      <option value="2">يومان</option>
                      <option value="3">3 أيام</option>
                      <option value="4">4 أيام</option>
                      <option value="5">5 أيام</option>
                      <option value="7">أسبوع</option>
                      <option value="10">10 أيام</option>
                      <option value="14">أسبوعين</option>
                      <option value="30">شهر</option>
                    </select>
                    <p className="text-xs text-orange-600 mt-2">
                      * سيظهر هذا المنتج تلقائياً في صفحة "إدارة المخزون اليومي" لمتابعة صلاحيته.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {image ? (
                    <img src={image} alt="Preview" className="h-24 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="text-gray-400">
                      <Upload size={24} className="mx-auto mb-2" />
                      <span className="text-xs">اضغط لرفع صورة</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" rows={3}></textarea>
              </div>
              <Button type="submit" fullWidth>{editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}</Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="حذف المنتج"
        message="هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};