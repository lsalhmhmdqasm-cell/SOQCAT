import React, { useEffect, useState } from 'react';
import { Eye, Printer, Filter, Truck } from 'lucide-react';
import { Order, OrderStatus, DeliveryPerson, CartItem } from '../../types';
import { api } from '../../services/api';

// Map Backend Status (English) to Frontend Enum (Arabic)
const STATUS_FROM_BACKEND: Record<string, OrderStatus> = {
  'pending': OrderStatus.PENDING,
  'confirmed': OrderStatus.PENDING,
  'preparing': OrderStatus.PREPARING,
  'out_for_delivery': OrderStatus.DELIVERING,
  'delivered': OrderStatus.COMPLETED,
  'completed': OrderStatus.COMPLETED,
  'cancelled': OrderStatus.CANCELLED
};

// Map Frontend Enum (Arabic) to Backend Status (English)
const STATUS_TO_BACKEND: Record<string, string> = {
  [OrderStatus.PENDING]: 'pending',
  [OrderStatus.PREPARING]: 'preparing',
  [OrderStatus.DELIVERING]: 'out_for_delivery',
  [OrderStatus.COMPLETED]: 'delivered',
  [OrderStatus.CANCELLED]: 'cancelled'
};

export const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DeliveryPerson[]>([]);
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, driversRes] = await Promise.all([
        api.get('/shop/orders'),
        api.get('/delivery-persons')
      ]);

      // Map Backend Order to Frontend Order Interface
      const mappedOrders: Order[] = ordersRes.data.map((o: any) => ({
        id: o.id.toString(),
        userId: o.user ? o.user.name : `عميل #${o.user_id}`, // Show Name
        items: o.items.map((item: any) => ({
          id: item.product.id.toString(),
          name: item.product.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.product.image || '',
          category: item.product.category_id?.toString() || '',
          description: '' // Optional
        })),
        total: parseFloat(o.total),
        status: STATUS_FROM_BACKEND[o.status] || OrderStatus.PENDING,
        date: o.created_at,
        deliveryAddress: o.delivery_address,
        deliveryPersonId: o.delivery_person_id?.toString(),
        // optional fields
        location: undefined,
        estimatedTime: o.estimated_delivery_time ? 45 : undefined
      }));

      setOrders(mappedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // Map Drivers
      setDrivers(driversRes.data.map((d: any) => ({
        ...d,
        id: d.id.toString()
      })));

    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    const backendStatus = STATUS_TO_BACKEND[newStatus];
    try {
      await api.put(`/orders/${id}/status`, { status: backendStatus });

      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('فشل تحديث الحالة');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      await api.put(`/orders/${orderId}/assign-delivery`, { delivery_person_id: driverId });

      setOrders(orders.map(o => o.id === orderId ? { ...o, deliveryPersonId: driverId } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, deliveryPersonId: driverId });
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert('فشل تعيين المندوب');
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">جاري تحميل الطلبات...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h2>
        <div className="flex bg-white rounded-lg border p-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-sm rounded-md ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'text-gray-600'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter(OrderStatus.PENDING)}
            className={`px-3 py-1 text-sm rounded-md ${filter === OrderStatus.PENDING ? 'bg-yellow-500 text-white' : 'text-gray-600'}`}
          >
            انتظار
          </button>
          <button
            onClick={() => setFilter(OrderStatus.COMPLETED)}
            className={`px-3 py-1 text-sm rounded-md ${filter === OrderStatus.COMPLETED ? 'bg-green-600 text-white' : 'text-gray-600'}`}
          >
            مكتمل
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">العميل / العنوان</th>
              <th className="p-4">الإجمالي</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">المندوب</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد طلبات</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">#{order.id}</td>
                  <td className="p-4 text-sm">
                    <div className="font-bold text-gray-700 mb-1">{order.userId}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.deliveryAddress}</div>
                  </td>
                  <td className="p-4 font-bold text-green-700">{order.total.toLocaleString()}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-white border text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-green-500 w-32"
                    >
                      {Object.values(OrderStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.deliveryPersonId || ''}
                      onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                      className="bg-white border text-sm rounded-md px-2 py-1 text-gray-600 w-32"
                    >
                      <option value="">تعيين...</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setSelectedOrder(order); setShowInvoice(false); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showInvoice && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-xl">تفاصيل الطلب #{selectedOrder.id}</h3>
                <p className="text-gray-500 text-sm">{new Date(selectedOrder.date).toLocaleString('ar-YE')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">معلومات التوصيل</h4>
                  <p className="text-gray-800 mb-1">العميل: {selectedOrder.userId}</p>
                  <p className="text-sm text-gray-600 mb-2">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.deliveryPersonId && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-lg text-sm">
                      <Truck size={14} />
                      <span>مندوب: {drivers.find(d => d.id === selectedOrder.deliveryPersonId)?.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 border rounded-xl">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">حالة الطلب</h4>
                  <p className="font-bold text-lg text-green-700">{selectedOrder.status}</p>
                  <div className="mt-2 text-xs text-gray-500">طريقة الدفع: كاش (عند الاستلام)</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">المنتجات المطلوبة</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3">المنتج</th>
                        <th className="p-3">الكمية</th>
                        <th className="p-3">السعر</th>
                        <th className="p-3">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.price.toLocaleString()}</td>
                          <td className="p-3 font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={3} className="p-3">الإجمالي النهائي</td>
                        <td className="p-3 text-lg text-green-700">{selectedOrder.total.toLocaleString()} ر.ي</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowInvoice(true)} className="flex items-center gap-2 px-4 py-2 border bg-white rounded-lg hover:bg-gray-50 text-gray-700">
                <Printer size={16} />
                عرض الفاتورة
              </button>
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden relative">
            {/* Toolbar */}
            <div className="bg-gray-800 p-2 flex justify-between items-center text-white no-print">
              <span className="text-sm font-bold px-2">معاينة الفاتورة</span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-500">طباعة</button>
                <button onClick={() => setShowInvoice(false)} className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500">إغلاق</button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 bg-white text-gray-900" id="invoice-area">
              <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">متجر القات</h1>
                <p className="text-sm text-gray-500">فاتورة ضريبية مبسطة</p>
              </div>

              <div className="flex justify-between mb-6 text-sm">
                <div>
                  <p className="text-gray-500">رقم الفاتورة:</p>
                  <p className="font-bold">INV-{selectedOrder.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">التاريخ:</p>
                  <p className="font-bold">{new Date(selectedOrder.date).toLocaleDateString('ar-YE')}</p>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg text-sm">
                <p className="font-bold mb-1">العميل:</p>
                <p>{selectedOrder.userId}</p>
                <p className="text-gray-500 mt-1">{selectedOrder.deliveryAddress}</p>
              </div>

              <table className="w-full text-right text-sm mb-6 border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-2">المنتج</th>
                    <th className="py-2 text-center">الكمية</th>
                    <th className="py-2 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-left">{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center border-t-2 border-gray-800 pt-4">
                <span className="font-bold text-xl">الإجمالي</span>
                <span className="font-bold text-xl">{selectedOrder.total.toLocaleString()} ر.ي</span>
              </div>

              <div className="mt-12 text-center text-xs text-gray-400">
                شكراً لتعاملكم معنا!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};