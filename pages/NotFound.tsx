import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">الصفحة غير موجودة</h2>
      <p className="text-gray-500 mb-8">عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم حذفه.</p>
      <Button onClick={() => navigate('/')}>
        <Home size={20} />
        العودة للرئيسية
      </Button>
    </div>
  );
};