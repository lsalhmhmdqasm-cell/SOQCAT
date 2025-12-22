import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { login } = useShop();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    setLoading(true);
    try {
      const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
      await fetch(`${backendBase}/sanctum/csrf-cookie`, { credentials: 'include' });
      const response = await api.post('/login', { email: `${phone}@qatshop.com`, password });
      const { data } = response.data;
      if (data?.role !== 'super_admin') {
        alert('هذه الصفحة مخصصة لدخول المشرف العام فقط. يرجى الدخول من تطبيق المتجر الخاص بكم.');
        return;
      }
      login(data);
      onLogin(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setPhone('admin');
    setPassword('admin');
  };

  return (
    <div className="min-h-screen bg-green-700 flex flex-col items-center justify-center p-6 text-white relative animate-slide-down">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors"
      >
        <X size={24} />
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">دخول المشرف العام</h1>
        <p className="text-green-100">هذه الصفحة مخصصة لمالك المنصة فقط</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
              placeholder="admin"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
              placeholder="••••••••"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button fullWidth type="submit" isLoading={loading} className="mt-4 py-3">
            دخول
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 mb-3">تجربة سريعة:</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={fillAdmin}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              بيانات المشرف العام
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center opacity-60">
        <p className="text-[10px] text-green-200">تصميم وتطوير</p>
        <p className="text-xs font-bold text-white">الرياح للبرامج والتطبيقات</p>
        <p className="text-xs text-green-200 dir-ltr">772519054 / 718419380</p>
      </div>
    </div>
  );
};
