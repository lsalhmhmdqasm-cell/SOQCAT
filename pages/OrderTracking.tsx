import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowRight, Phone, MapPin } from 'lucide-react';

export const OrderTracking = () => {
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const { order, loading, error } = useOrderTracking(trackingNumber!);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل معلومات الطلب...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">الطلب غير موجود</h2>
                    <p className="text-gray-600 mb-4">{error || 'لم نتمكن من العثور على هذا الطلب'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    const statusSteps = [
        { key: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'text-gray-400' },
        { key: 'confirmed', label: 'تم التأكيد', icon: CheckCircle, color: 'text-blue-500' },
        { key: 'preparing', label: 'قيد التحضير', icon: Package, color: 'text-yellow-500' },
        { key: 'out_for_delivery', label: 'في الطريق', icon: Truck, color: 'text-purple-500' },
        { key: 'delivered', label: 'تم التوصيل', icon: CheckCircle, color: 'text-green-500' }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowRight size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">تتبع الطلب</h1>
                        <p className="text-sm text-gray-500">#{order.tracking_number}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Order Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500">إجمالي الطلب</p>
                            <p className="text-2xl font-bold text-green-600">{order.total.toLocaleString()} ر.ي</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${isCancelled ? 'bg-red-100 text-red-700' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                            }`}>
                            {isCancelled ? 'ملغي' : statusSteps.find(s => s.key === order.status)?.label}
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <p>{order.delivery_address}</p>
                    </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold mb-6">حالة الطلب</h3>
                        <div className="space-y-6">
                            {statusSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const historyItem = order.status_history?.find((h: any) => h.status === step.key);

                                return (
                                    <div key={step.key} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                                } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                                                <Icon size={24} />
                                            </div>
                                            {index < statusSteps.length - 1 && (
                                                <div className={`w-0.5 h-12 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <p className={`font-bold ${isCurrent ? 'text-green-600' : 'text-gray-600'}`}>
                                                {step.label}
                                            </p>
                                            {historyItem && (
                                                <>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(historyItem.created_at).toLocaleString('ar-YE')}
                                                    </p>
                                                    {historyItem.note && (
                                                        <p className="text-sm text-gray-600 mt-1">{historyItem.note}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cancelled Status */}
                {isCancelled && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="text-red-500" size={24} />
                            <h3 className="font-bold text-red-700">تم إلغاء الطلب</h3>
                        </div>
                        {order.status_history?.[0]?.note && (
                            <p className="text-sm text-red-600">{order.status_history[0].note}</p>
                        )}
                    </div>
                )}

                {/* Delivery Person Info */}
                {order.delivery_person && !isCancelled && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4">معلومات المندوب</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <Truck className="text-green-600" size={28} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{order.delivery_person.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1" dir="ltr">
                                    <Phone size={14} />
                                    <span>{order.delivery_person.phone}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${order.delivery_person.status === 'available'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                {order.delivery_person.status === 'available' ? 'متاح' : 'مشغول'}
                            </div>
                        </div>
                        {order.estimated_delivery_time && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-500">الوقت المتوقع للتوصيل</p>
                                <p className="font-bold text-gray-800">
                                    {new Date(order.estimated_delivery_time).toLocaleString('ar-YE')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Shop Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-2">المتجر</h3>
                    <p className="text-gray-600">{order.shop.name}</p>
                </div>
            </div>
        </div>
    );
};
