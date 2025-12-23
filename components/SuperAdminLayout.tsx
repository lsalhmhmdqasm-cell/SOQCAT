import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { path: '/super-admin/dashboard', label: 'لوحة التحكم' },
    { path: '/super-admin/clients', label: 'المحلات' },
    { path: '/super-admin/tickets', label: 'التذاكر' },
    { path: '/super-admin/updates', label: 'التحديثات' },
    { path: '/super-admin/plans', label: 'الباقات والاشتراكات' },
    { path: '/super-admin/leads', label: 'طلبات التواصل' },
    { path: '/super-admin/landing', label: 'صفحة الهبوط' },
  ];

  const isActive = (p: string) => location.pathname === p;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-green-700">لوحة المشرف العام</span>
            <nav className="hidden md:flex items-center gap-2 ms-4">
              {links.map(l => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${isActive(l.path) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {l.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${isActive(l.path) ? 'bg-green-600 text-white' : 'text-gray-700 bg-gray-100'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {children}
      </div>
    </div>
  );
}
