import React, { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, Map, ChevronRight } from 'lucide-react';
import { Order, OrderStatus, User, DeliveryPerson } from '../types';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface OrderHistoryProps {
  user: User;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let orderRes;
        // Determine endpoint based on role
        // Note user.role might be mapped to isAdmin in context
        if (user.role === 'shop_admin' || user.isAdmin) {
          orderRes = await api.get('/shop/orders');
        } else {
          orderRes = await api.get('/orders');
        }

        setOrders(orderRes.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

      } catch (e) {
        console.error("Failed to fetch orders", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.id, user.role, user.isAdmin]);

  // Order Timeline Component
  const OrderTimeline = ({ status }: { status: OrderStatus }) => {
    const steps = [
      { id: OrderStatus.PENDING, label: 'انتظار', icon: Clock },
      { id: OrderStatus.PREPARING, label: 'تجهيز', icon: Package },
      { id: OrderStatus.DELIVERING, label: 'توصيل', icon: Truck },
      { id: OrderStatus.COMPLETED, label: 'مكتمل', icon: CheckCircle },
    ];

    const currentIdx = steps.findIndex(s => s.id === status);
    if (status === OrderStatus.CANCELLED) return <div className="text-red-500 font-bold p-2 bg-red-50 rounded text-center text-sm">تم إلغاء الطلب</div>;

    return (
      <div className="relative flex justify-between items-center mt-6 mb-4 px-2">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-green-500 -z-10 transition-all duration-500"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 bg-white px-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                <step.icon size={14} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!user.isAdmin) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      alert("فشل تحديث الحالة");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-green-600 rounded-full border-t-transparent mb-4"></div>جاري تحميل الطلبات...</div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-4">
        <h1 className="text-xl font-bold">{user.isAdmin ? 'طلبات المتجر' : 'طلباتي'}</h1>
      </div>

      <div className="px-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <Package size={48} className="text-gray-300 mb-4" />
            <p>لا توجد طلبات سابقة.</p>
          </div>
        ) : (
          orders.map(order => {
            return (
              <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">طلب #{order.id}</h3>
                    <span className="text-xs text-gray-400">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="text-green-700 font-bold">{Number(order.total).toLocaleString()} ر.ي</div>
                </div>

                <OrderTimeline status={order.status} />

                {/* Track Order Button */}
                {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                  <button
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-green-100 transition-colors"
                  >
                    <Map size={18} />
                    تتبع الطلب مباشرة
                    <ChevronRight size={16} />
                  </button>
                )}

                <div className="space-y-1 mt-2 bg-gray-50 p-3 rounded-lg text-sm">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{item.quantity}x {item.product?.name || 'منتج'}</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {user.isAdmin && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 overflow-x-auto">
                    <button onClick={() => handleStatusChange(order.id, OrderStatus.PREPARING)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">تجهيز</button>
                    <button onClick={() => handleStatusChange(order.id, OrderStatus.DELIVERING)} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold">توصيل</button>
                    <button onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold">اكتمل</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};