import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, image: image || 'https://via.placeholder.com/150' });
      setIsModalOpen(false);
      setName('');
      setImage('');
      refreshData();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('فشل إضافة التصنيف.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      refreshData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('فشل حذف التصنيف.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">التصنيفات</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> إضافة تصنيف
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-400">جاري التحميل...</p>
        ) : categories.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">لا توجد تصنيفات</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
              <button
                onClick={() => setDeleteId(cat.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
              {cat.image && (
                <img src={cat.image} alt={cat.name} className="w-full h-20 object-cover rounded-lg mb-2" />
              )}
              <h3 className="font-bold text-center text-gray-800">{cat.name}</h3>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">تصنيف جديد</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم التصنيف</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">صورة التصنيف</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative">
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
              <Button type="submit" fullWidth disabled={uploading}>
                {uploading ? 'جاري الرفع...' : 'إضافة'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="حذف التصنيف"
        message="هل أنت متأكد من رغبتك في حذف هذا التصنيف؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};