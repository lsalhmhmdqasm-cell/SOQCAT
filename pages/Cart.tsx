import React from 'react';
import { ArrowRight, Trash2, Plus, Minus, LogIn } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from '../components/Button';

interface CartProps {
  cart: CartItem[];
  isGuest: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onBack: () => void;
}

export const Cart: React.FC<CartProps> = ({ cart, isGuest, onUpdateQuantity, onRemove, onCheckout, onBack }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div className="text-gray-400" >
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
             </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">السلة فارغة</h2>
        <p className="text-gray-500 mb-6 text-center">يبدو أنك لم تقم بإضافة أي منتجات بعد.</p>
        <Button onClick={onBack} variant="outline">ابدأ التسوق</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold">سلة المشتريات</h1>
      </div>

      <div className="p-4 space-y-4">
        {cart.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <button onClick={() => onRemove(item.id)} className="text-red-500 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-green-600 font-medium text-sm">{item.price.toLocaleString()} ر.ي</p>
              
              <div className="flex items-center gap-3 mt-2">
                <button 
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
                >
                  <Minus size={14} />
                </button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 active:bg-green-200"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 rounded-t-3xl shadow-[0_-4px_15px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">الإجمالي</span>
            <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()} ر.ي</span>
          </div>
          
          {isGuest && (
            <div className="mb-3 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <LogIn size={14} />
              سيتم توجيهك لتسجيل الدخول قبل إتمام الطلب
            </div>
          )}

          <Button fullWidth onClick={onCheckout} className="py-3 text-lg shadow-green-600/30">
            {isGuest ? 'تسجيل الدخول وإتمام الشراء' : 'إتمام الشراء'}
          </Button>
        </div>
      </div>
    </div>
  );
};