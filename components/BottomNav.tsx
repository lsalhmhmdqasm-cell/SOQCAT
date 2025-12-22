import React from 'react';
import { Home, ShoppingCart, User, List } from 'lucide-react';

interface BottomNavProps {
  cartCount: number;
  onNavigate: (path: string) => void;
  isAdmin: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ cartCount, onNavigate, isAdmin }) => {
  const activeClass = "text-green-600";
  const inactiveClass = "text-gray-400";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 shadow-lg">
      <button onClick={() => onNavigate('/')} className={`flex flex-col items-center gap-1 ${inactiveClass} hover:${activeClass}`}>
        <Home size={24} />
        <span className="text-xs">الرئيسية</span>
      </button>
      
      {!isAdmin && (
        <button onClick={() => onNavigate('/cart')} className={`flex flex-col items-center gap-1 ${inactiveClass} relative hover:${activeClass}`}>
          <div className="relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs">السلة</span>
        </button>
      )}

      <button onClick={() => onNavigate('/orders')} className={`flex flex-col items-center gap-1 ${inactiveClass} hover:${activeClass}`}>
        <List size={24} />
        <span className="text-xs">{isAdmin ? 'الطلبات' : 'طلباتي'}</span>
      </button>

      <button onClick={() => onNavigate('/profile')} className={`flex flex-col items-center gap-1 ${inactiveClass} hover:${activeClass}`}>
        <User size={24} />
        <span className="text-xs">حسابي</span>
      </button>
    </div>
  );
};