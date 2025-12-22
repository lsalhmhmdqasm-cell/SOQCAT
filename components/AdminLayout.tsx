import React, { useState } from 'react';
import { LayoutDashboard, Package, Grid, Users, LogOut, ShoppingBag, Settings, Truck, Code, UserCircle, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'categories', label: 'التصنيفات', icon: Grid },
    { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
    { id: 'delivery', label: 'مندوبي التوصيل', icon: Truck },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
    { id: 'profile', label: 'ملفي الشخصي', icon: UserCircle },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-green-400">لوحة الإدارة</h1>
           <p className="text-xs text-gray-400 mt-1">متجر القات</p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
           <X size={24} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-col hidden md:flex">
         <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-bold">لوحة الإدارة</span>
        </div>
        <button onClick={onLogout}><LogOut size={20} /></button>
      </div>

      {/* Mobile Sidebar Drawer (Overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col shadow-2xl animate-fade-in">
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </div>
    </div>
  );
};