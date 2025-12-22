import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, DollarSign, TrendingUp, Package, Clock } from 'lucide-react';
import { api } from '../../services/api';

interface DashboardStats {
  orders: {
    today: number;
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    today: number;
    total: number;
  };
  products: {
    total: number;
    active: number;
  };
  customers: {
    total: number;
  };
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
      </div>
    </div>
  );

  const statCards = [
    {
      title: 'طلبات اليوم',
      value: stats.orders.today,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.orders.total,
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'الإيرادات اليوم',
      value: `${stats.revenue.today.toLocaleString()} ر.ي`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.revenue.total.toLocaleString()} ر.ي`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'المنتجات النشطة',
      value: stats.products.active,
      icon: Package,
      color: 'bg-indigo-500'
    },
    {
      title: 'العملاء',
      value: stats.customers.total,
      icon: Users,
      color: 'bg-pink-500'
    },
    {
      title: 'طلبات قيد الانتظار',
      value: stats.orders.pending,
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">نظرة عامة</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden transition-transform hover:-translate-y-1 duration-200">
            <div className="relative z-10">
              <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
            <div className={`absolute top-4 left-4 p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};