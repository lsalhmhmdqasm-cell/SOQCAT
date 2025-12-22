import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, Phone, RefreshCcw, X, Upload } from 'lucide-react';
import { DeliveryPerson } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const DeliveryManager = () => {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/delivery-persons');
      setDeliveryPersons(res.data);
    } catch (error) {
      console.error('Failed to load delivery persons:', error);
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
      await api.post('/delivery-persons', { name, phone });
      setIsModalOpen(false);
      setName('');
      setPhone('');
      refreshData();
    } catch (error) {
      console.error('Failed to add delivery person:', error);
      alert('فشل إضافة المندوب.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/delivery-persons/${deleteId}`);
      refreshData();
    } catch (error) {
      console.error('Failed to delete delivery person:', error);
      alert('فشل حذف المندوب.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleStatus = async (driver: DeliveryPerson) => {
    const newStatus = driver.status === 'available' ? 'busy' : 'available';
    try {
      await api.put(`/delivery-persons/${driver.id}/status`, { status: newStatus });
      setDeliveryPersons(deliveryPersons.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة مندوبي التوصيل</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> إضافة مندوب
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-400">جاري التحميل...</p>
        ) : deliveryPersons.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">لا يوجد مندوبين</p>
        ) : (
          deliveryPersons.map(driver => (
            <div key={driver.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${driver.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{driver.name}</h4>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1" dir="ltr">
                    <Phone size={12} />
                    <span>{driver.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 border-t pt-2">
                <button
                  onClick={() => toggleStatus(driver)}
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 border transition-all ${driver.status === 'available' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${driver.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {driver.status === 'available' ? 'متاح' : 'مشغول'}
                  <RefreshCcw size={10} className="ml-1 opacity-50" />
                </button>

                <button onClick={() => setDeleteId(driver.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">مندوب جديد</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المندوب</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  dir="ltr"
                />
              </div>
              <Button type="submit" fullWidth>إضافة</Button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="حذف المندوب"
        message="هل أنت متأكد من حذف هذا المندوب؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};