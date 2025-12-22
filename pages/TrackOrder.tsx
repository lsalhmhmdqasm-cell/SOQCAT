import React, { useEffect, useState } from 'react';
import { ArrowRight, Phone, MessageCircle, MapPin, Truck } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { mockApi } from '../services/mockApi';
import { useParams, useNavigate } from 'react-router-dom';

export const TrackOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    mockApi.getOrderById(id).then(o => {
       setOrder(o);
       setLoading(false);
       
       // Simulate movement if delivering
       if (o?.status === OrderStatus.DELIVERING) {
         const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 1));
         }, 200);
         return () => clearInterval(interval);
       } else {
         setProgress(100);
       }
    });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  if (!order) return <div className="flex justify-center items-center h-screen">الطلب غير موجود</div>;

  const isDelivering = order.status === OrderStatus.DELIVERING;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Map Simulation Layer */}
      <div className="relative h-[60vh] bg-gray-200 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/000/153/589/original/vector-city-map-background.jpg')] bg-cover bg-center opacity-50"></div>
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-lg">
          <ArrowRight size={20} />
        </button>

        {/* Path Line */}
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-300 rounded-full z-0 overflow-hidden">
           <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Shop Marker */}
        <div className="absolute top-1/2 left-10 transform -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
           <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-white"></div>
           <span className="text-xs font-bold bg-white px-1 rounded mt-1">المتجر</span>
        </div>

        {/* User Marker */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 translate-x-1/2 z-10 flex flex-col items-center">
           <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
             <MapPin size={16} fill="currentColor" />
           </div>
           <span className="text-xs font-bold bg-white px-1 rounded mt-1 shadow-sm">أنت</span>
        </div>

        {/* Moving Driver */}
        {isDelivering && (
          <div 
             className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-linear"
             style={{ left: `calc(10% + ${progress * 0.8}%)` }}
          >
             <div className="bg-white p-1.5 rounded-full shadow-xl border-2 border-green-500">
               <Truck size={20} className="text-green-600" />
             </div>
             <div className="bg-black text-white text-[10px] px-1.5 rounded absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
               15 دقيقة
             </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Info */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] relative z-10 p-6 flex flex-col">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
         
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-xl font-bold text-gray-900 mb-1">
                 {isDelivering ? 'الطلب في الطريق إليك' : order.status}
               </h2>
               <p className="text-gray-500 text-sm">وقت الوصول المتوقع: {new Date(new Date().getTime() + 45*60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="text-right">
               <span className="block text-xs text-gray-400">رقم الطلب</span>
               <span className="font-mono font-bold text-gray-800">#{order.id}</span>
            </div>
         </div>

         {/* Driver Info */}
         {order.deliveryPersonId && (
           <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
               م
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900">محمد السائق</h3>
               <div className="flex text-yellow-500 text-xs">★★★★★ (4.9)</div>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-600 shadow-sm hover:bg-green-50">
                  <Phone size={20} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-50">
                  <MessageCircle size={20} />
                </button>
             </div>
           </div>
         )}

         <div className="mt-auto">
            <h4 className="font-bold text-sm mb-3">تفاصيل الطلب</h4>
            <div className="space-y-2 mb-4 max-h-24 overflow-y-auto">
               {order.items.map((item, i) => (
                 <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} ر.ي</span>
                 </div>
               ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
               <span>الإجمالي</span>
               <span className="text-green-700">{order.total.toLocaleString()} ر.ي</span>
            </div>
         </div>
      </div>
    </div>
  );
};