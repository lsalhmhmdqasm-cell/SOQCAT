import React from 'react';
import { LogIn, Lock } from 'lucide-react';
import { Button } from './Button';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginRequired = ({ message = "يرجى تسجيل الدخول للمتابعة" }: { message?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Lock size={32} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">مطلوب تسجيل الدخول</h2>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        {message}. يمكنك التسجيل بسهولة أو الدخول إذا كان لديك حساب.
      </p>
      <Button 
        onClick={() => navigate('/login', { state: { from: location.pathname } })} 
        className="w-full max-w-xs py-3"
      >
        <LogIn size={20} className="ml-2" />
        تسجيل الدخول / إنشاء حساب
      </Button>
    </div>
  );
};