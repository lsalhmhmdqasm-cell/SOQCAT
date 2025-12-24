import React, { useMemo, useState } from 'react';
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
  const { login, shopSettings } = useShop();
  const isPlatformMode = useMemo(() => shopSettings?.shopName === 'منصة قات شوب' && !import.meta.env.VITE_SHOP_ID, [shopSettings]);
  const [mode, setMode] = useState<'admin' | 'customer-login' | 'customer-register'>(isPlatformMode ? 'admin' : 'customer-login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (!phone || !password) return;
    } else if (mode === 'customer-login') {
      if ((!phone && !email) || !password) return;
    } else {
      if (!name || (!phone && !email) || !password) return;
    }
    setLoading(true);
    try {
      if (mode === 'admin') {
        const adminEmail = phone.includes('@') ? phone : `${phone}@qatshop.com`;
        const response = await api.post('/login', { email: adminEmail, password });
        const { data, access_token } = response.data;
        if (data?.role !== 'super_admin') {
          alert('هذه الصفحة مخصصة لدخول المشرف العام فقط');
          return;
        }
        login(data, access_token);
        onLogin(data);
      } else if (mode === 'customer-login') {
        const finalEmail = (email && email.includes('@')) ? email : (phone ? `${phone}@qatshop.com` : '');
        const response = await api.post('/login', { email: finalEmail, password });
        const { data, access_token } = response.data;
        if (data?.role === 'super_admin') {
          alert('هذه الصفحة مخصصة لعملاء ومديري المحلات. دخول المشرف العام من واجهة المنصة.');
          return;
        }
        login(data, access_token);
        onLogin(data);
      } else {
        const finalEmail = (email && email.includes('@')) ? email : `${phone}@qatshop.com`;
        const response = await api.post('/register', { name, email: finalEmail, password, phone });
        const { data, access_token } = response.data;
        login(data, access_token);
        onLogin(data);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || (mode === 'customer-register' ? 'فشل إنشاء الحساب' : 'فشل تسجيل الدخول'));
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    if (mode !== 'admin') return;
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
        {mode === 'admin' ? (
          <>
            <h1 className="text-4xl font-bold mb-2">دخول المشرف العام</h1>
            <p className="text-green-100">هذه الصفحة مخصصة لمالك المنصة فقط</p>
          </>
        ) : mode === 'customer-login' ? (
          <>
            <h1 className="text-4xl font-bold mb-2">تسجيل دخول العميل</h1>
            <p className="text-green-100">ادخل بريدك أو رقم هاتفك وكلمة المرور</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-2">إنشاء حساب عميل</h1>
            <p className="text-green-100">سجّل كعميل للشراء ومتابعة الطلبات</p>
          </>
        )}
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {mode === 'admin' ? 'تسجيل الدخول' : (mode === 'customer-login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'customer-register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
                placeholder="اكتب اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'admin' ? 'رقم الهاتف' : 'البريد الإلكتروني (اختياري)'}
              </label>
              <input
                type={mode === 'admin' ? 'tel' : 'email'}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
                placeholder={mode === 'admin' ? 'admin' : 'example@mail.com'}
                dir="ltr"
                value={mode === 'admin' ? phone : email}
                onChange={(e) => mode === 'admin' ? setPhone(e.target.value) : setEmail(e.target.value)}
              />
            </div>
            {(mode !== 'admin') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف {mode === 'customer-login' ? '(اختياري إذا كتبت البريد)' : ''}</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
                  placeholder="77xxxxxxx"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
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
            {mode === 'customer-register' ? 'إنشاء حساب' : 'دخول'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          {mode === 'admin' ? (
            <>
              <p className="text-xs text-center text-gray-400 mb-3">تجربة سريعة:</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={fillAdmin}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  بيانات المشرف العام
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-gray-500">
              {mode === 'customer-login' ? (
                <>
                  <span>ليس لديك حساب؟</span>{' '}
                  <button className="text-green-600 underline" onClick={() => setMode('customer-register')}>
                    سجل الآن
                  </button>
                </>
              ) : (
                <>
                  <span>لديك حساب بالفعل؟</span>{' '}
                  <button className="text-green-600 underline" onClick={() => setMode('customer-login')}>
                    تسجيل الدخول
                  </button>
                </>
              )}
              {isPlatformMode && (
                <div className="mt-3">
                  <button className="text-gray-400 underline" onClick={() => setMode('admin')}>
                    دخول المشرف العام
                  </button>
                </div>
              )}
            </div>
          )}
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
