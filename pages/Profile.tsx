import React, { useState, useEffect } from 'react';
import { User, LogOut, Edit2, Save, MapPin, Plus, Trash2, Key, HelpCircle, ChevronLeft, Download, Smartphone } from 'lucide-react';
import { User as UserType, Address } from '../types';
import { Button } from '../components/Button';
import { api } from '../services/api'; // ✅ استخدام Real API
import { useNavigate } from 'react-router-dom';
import { usePWA } from '../hooks/usePWA';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();
  const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('المنزل');
  const [newDetails, setNewDetails] = useState('');

  useEffect(() => {
    if (activeTab === 'addresses' && !user.isAdmin) {
      api.get('/addresses')
        .then(res => setAddresses(res.data))
        .catch(err => console.error('Failed to load addresses:', err));
    }
  }, [activeTab, user.isAdmin]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = { name, phone };
      if (password) updateData.password = password;

      await api.put('/profile', updateData);
      onUpdateUser({ ...user, name, phone });
      setIsEditing(false);
      setPassword('');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('فشل تحديث الملف الشخصي.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', { label: newLabel, details: newDetails });
      setAddresses([...addresses, res.data]);
      setShowAddAddress(false);
      setNewDetails('');
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('فشل إضافة العنوان.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('حذف هذا العنوان؟')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('فشل حذف العنوان.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-700 p-8 pb-16 text-center text-white rounded-b-[2.5rem] shadow-lg relative">
        <div className="w-24 h-24 bg-white text-green-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-xl border-4 border-green-200">
          {user.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-green-200 text-sm mt-1">{user.phone}</p>

        <button
          onClick={onLogout}
          className="absolute top-4 left-4 bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="px-6 -mt-8">
        {/* Install App Banner */}
        {isInstallable && (
          <div className="bg-gray-900 text-white rounded-xl shadow-lg p-4 mb-4 flex items-center justify-between animate-slide-down">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">تثبيت التطبيق</h3>
                <p className="text-xs text-gray-300">للوصول السريع وتجربة أفضل</p>
              </div>
            </div>
            <button
              onClick={installApp}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Download size={14} /> تثبيت
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-sm font-bold ${activeTab === 'info' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500'}`}
            >
              بياناتي
            </button>
            {!user.isAdmin && (
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'addresses' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500'}`}
              >
                العناوين المسجلة
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'info' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="font-bold text-gray-800">المعلومات الشخصية</h2>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-green-600 text-sm font-bold flex items-center gap-1">
                      <Edit2 size={14} /> تعديل
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">الاسم الكامل</label>
                    {isEditing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">رقم الهاتف</label>
                    {isEditing ? (
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800" dir="ltr">{user.phone}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="pt-2 border-t mt-2">
                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Key size={12} /> تغيير كلمة المرور (اختياري)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="اتركها فارغة إذا لم ترد التغيير"
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {!isEditing && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">تاريخ الانضمام</label>
                      <p className="font-medium text-gray-800">
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'غير معروف'}
                      </p>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button fullWidth onClick={handleSave} isLoading={loading}>
                        <Save size={16} /> حفظ
                      </Button>
                      <Button fullWidth variant="secondary" onClick={() => setIsEditing(false)}>
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-4">
                {showAddAddress ? (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-bold mb-3 text-sm">إضافة عنوان جديد</h3>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">الاسم (مثال: المنزل)</label>
                      <select value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full border p-2 rounded bg-white">
                        <option>المنزل</option>
                        <option>العمل</option>
                        <option>الديوان</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">العنوان بالتفصيل</label>
                      <textarea
                        required
                        value={newDetails}
                        onChange={e => setNewDetails(e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500"
                        placeholder="الشارع، الحي، رقم المنزل..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="text-sm">حفظ</Button>
                      <Button variant="secondary" onClick={() => setShowAddAddress(false)} className="text-sm">إلغاء</Button>
                    </div>
                  </form>
                ) : (
                  <Button variant="outline" fullWidth onClick={() => setShowAddAddress(true)}>
                    <Plus size={16} /> إضافة عنوان جديد
                  </Button>
                )}

                <div className="space-y-3 mt-4">
                  {addresses.length === 0 && !showAddAddress && <p className="text-center text-gray-400 text-sm py-4">لا توجد عناوين مسجلة</p>}
                  {addresses.map(addr => (
                    <div key={addr.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-green-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{addr.label}</h4>
                          <p className="text-xs text-gray-500">{addr.details}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-full">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <button
            onClick={() => navigate('/support')}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-gray-800 text-sm">مركز المساعدة</h3>
              <p className="text-xs text-gray-400">تواصل معنا للدعم والاستفسارات</p>
            </div>
            <ChevronLeft size={16} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};