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
  const { login } = useShop(); // Use context login
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    if (isRegister && !name) return;

    setLoading(true);
    try {
      let response;
      if (isRegister) {
        response = await api.post('/register', { name, email: `${phone}@qatshop.com`, phone, password });
      } else {
        response = await api.post('/login', { email: `${phone}@qatshop.com`, password });
      }

      const { data, access_token } = response.data;

      // Update Context
      login(data, access_token);

      // Legacy prop fallback (for App.tsx logic if needed, but context handles state now)
      onLogin(data);

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || (isRegister ? "فشل التسجيل" : "فشل تسجيل الدخول"));
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'admin' | 'user') => {
    setIsRegister(false);
    if (type === 'admin') {
      setPhone('admin');
      setPassword('admin');
    } else {
      setPhone('777000000');
      setPassword('123456');
    }
  };

  return (
    <div className="min-h-screen bg-green-700 flex flex-col items-center justify-center p-6 text-white relative animate-slide-down">
      {/* Close Button to return to guest mode */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors"
      >
        <X size={24} />
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">متجر القات</h1>
        <p className="text-green-100">سجل دخولك لإتمام الطلب والمتابعة</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
              placeholder="77xxxxxxx"
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
            {isRegister ? 'تسجيل حساب' : 'دخول'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
            <span
              onClick={() => setIsRegister(!isRegister)}
              className="text-green-600 font-bold cursor-pointer select-none"
            >
              {isRegister ? 'سجل دخولك' : 'سجل الآن'}
            </span>
          </p>
        </div>

        {!isRegister && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-3">خيارات التجربة السريعة:</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => fillCredentials('user')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                بيانات مستخدم
              </button>
              <button
                onClick={() => fillCredentials('admin')}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                بيانات مدير
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center opacity-60">
        <p className="text-[10px] text-green-200">تصميم وتطوير</p>
        <p className="text-xs font-bold text-white">الرياح للبرامج والتطبيقات</p>
        <p className="text-xs text-green-200 dir-ltr">772519054 / 718419380</p>
      </div>
    </div>
  );
};