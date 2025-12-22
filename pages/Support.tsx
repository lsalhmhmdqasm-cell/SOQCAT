import React from 'react';
import { ArrowRight, Phone, MessageCircle, MapPin, Mail, HelpCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold">مركز المساعدة</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner */}
        <div className="bg-green-600 rounded-2xl p-6 text-white text-center shadow-lg">
           <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
           <h2 className="text-2xl font-bold mb-2">كيف يمكننا مساعدتك؟</h2>
           <p className="text-green-100 text-sm">فريق الدعم متواجد لخدمتكم يومياً من 8 صباحاً حتى 12 ليلاً</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
           <a href="tel:777000000" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <span className="font-bold text-gray-700">اتصل بنا</span>
           </a>
           <a href="https://wa.me/967777000000" target="_blank" rel="noreferrer" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <span className="font-bold text-gray-700">واتساب</span>
           </a>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-4 border-b flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <MapPin size={20} className="text-gray-400" />
              <div className="flex-1">
                 <h3 className="font-bold text-gray-800 text-sm">موقعنا على الخريطة</h3>
                 <p className="text-xs text-gray-500">مأرب، سوق بن عبود للقات</p>
              </div>
              <ChevronLeft size={16} className="text-gray-400" />
           </div>
           <div className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <Mail size={20} className="text-gray-400" />
              <div className="flex-1">
                 <h3 className="font-bold text-gray-800 text-sm">البريد الإلكتروني</h3>
                 <p className="text-xs text-gray-500">support@qatshop.com</p>
              </div>
              <ChevronLeft size={16} className="text-gray-400" />
           </div>
        </div>

        {/* FAQ Preview */}
        <div>
           <h3 className="font-bold text-gray-800 mb-3">الأسئلة الشائعة</h3>
           <div className="space-y-2">
              <details className="bg-white p-3 rounded-lg border border-gray-100 group">
                 <summary className="font-bold text-sm cursor-pointer list-none flex justify-between items-center">
                    ما هي مناطق التوصيل؟
                    <span className="group-open:rotate-90 transition-transform transform rotate-180 group-open:rotate-0">
                      <ChevronLeft size={16} />
                    </span>
                 </summary>
                 <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    نقوم بالتوصيل حالياً داخل مدينة مأرب وضواحيها.
                 </p>
              </details>
              <details className="bg-white p-3 rounded-lg border border-gray-100 group">
                 <summary className="font-bold text-sm cursor-pointer list-none flex justify-between items-center">
                    كم يستغرق التوصيل؟
                    <span className="group-open:rotate-90 transition-transform transform rotate-180 group-open:rotate-0">
                       <ChevronLeft size={16} />
                    </span>
                 </summary>
                 <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    متوسط وقت التوصيل هو 30-45 دقيقة حسب موقعك والازدحام.
                 </p>
              </details>
           </div>
        </div>
      </div>
    </div>
  );
};