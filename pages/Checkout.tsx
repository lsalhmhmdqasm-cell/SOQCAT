import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '../components/Button';
import { User, Address } from '../types';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { PaymentSelector } from '../components/PaymentSelector';

interface CheckoutProps {
  user: User;
  total: number;
  onBack: () => void;
  onSubmitOrder: (address: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ user, total, onBack, onSubmitOrder }) => {
  const { cart, clearCart, shopSettings } = useShop();
  const [step, setStep] = useState<'address' | 'confirm' | 'success'>('address');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapPinned, setMapPinned] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash_on_delivery');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Use shop settings from context
  const deliveryFee = shopSettings.deliveryFee;

  useEffect(() => {
    // Fetch addresses from API
    api.get('/addresses')
      .then(res => setSavedAddresses(res.data))
      .catch(err => console.error('Failed to load addresses:', err));
  }, []);

  const handleLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setAddress(`مأرب، سوق بن عبود للقات (موقع محدد: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
            setMapPinned(true);
            setLoading(false);
            setSelectedAddrId(null);
          }, 1000);
        },
        () => {
          alert('تعذر تحديد الموقع. يرجى إدخاله يدوياً.');
          setLoading(false);
        }
      );
    }
  };

  const handleSelectAddress = (addr: Address) => {
    setAddress(addr.details);
    setSelectedAddrId(addr.id);
  };

  const handlePaymentSelect = (method: string, details?: any) => {
    setSelectedPaymentMethod(method);
    setPaymentDetails(details);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData for file upload support
      const formData = new FormData();

      formData.append('shop_id', String(cart[0]?.shop_id || 1));
      formData.append('total', String(total + deliveryFee));
      formData.append('delivery_address', address);
      formData.append('payment_method', selectedPaymentMethod);

      if (paymentDetails) {
        if (paymentDetails.receipt) {
          formData.append('payment_receipt', paymentDetails.receipt);
        }
        if (paymentDetails.transactionId) {
          formData.append('payment_reference', paymentDetails.transactionId);
        }
        if (paymentDetails.methodId) {
          formData.append('payment_method_id', String(paymentDetails.methodId));
        }
      }

      // Append items array
      cart.forEach((item, index) => {
        formData.append(`items[${index}][product_id]`, String(item.id));
        formData.append(`items[${index}][quantity]`, String(item.quantity));
        formData.append(`items[${index}][price]`, String(item.price));
      });

      // We need to set Content-Type to multipart/form-data, but axios does it automatically when data is FormData
      await api.post('/orders', formData);

      clearCart();
      setStep('success');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = total + deliveryFee;

  // Validation before activating Submit button
  // If payment method is NOT cash, we need paymentDetails (receipt & txId)
  const isPaymentValid = selectedPaymentMethod === 'cash_on_delivery' || (paymentDetails && paymentDetails.receipt && paymentDetails.transactionId);
  const isAddressValid = !!address.trim();
  const canSubmit = isAddressValid && isPaymentValid;

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={56} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-500 mb-8">
          {selectedPaymentMethod === 'cash_on_delivery'
            ? 'سيتم التواصل معك قريباً لتأكيد الطلب.'
            : 'سيتم مراجعة إيصال الدفع وتجهيز طلبك فور التأكيد.'}
        </p>
        <Button fullWidth onClick={onBack}>العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold">الدفع وإتمام الطلب</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* User Info */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">بيانات العميل</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800">{user.name}</span>
              <span className="text-sm text-gray-500" dir="ltr">{user.phone}</span>
            </div>
          </div>
        </section>

        {/* Address Selection */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">موقع التوصيل</h2>

          {savedAddresses.length > 0 && (
            <div className="mb-4 space-y-2">
              {savedAddresses.map(addr => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedAddrId === addr.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}
                >
                  <MapPin size={18} className={selectedAddrId === addr.id ? 'text-green-600' : 'text-gray-400'} />
                  <div className="flex-1">
                    <span className="font-bold text-sm block">{addr.label}</span>
                    <span className="text-xs text-gray-500">{addr.details}</span>
                  </div>
                  {selectedAddrId === addr.id && <CheckCircle size={16} className="text-green-600" />}
                </div>
              ))}
            </div>
          )}

          {/* Manual / Map Area */}
          <div className="border-t pt-4">
            <div className="h-24 bg-gray-200 rounded-lg mb-3 relative overflow-hidden group cursor-pointer border-2 border-transparent hover:border-green-500 transition-all" onClick={handleLocation}>
              <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/000/153/589/original/vector-city-map-background.jpg')] bg-cover bg-center opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {mapPinned ? (
                  <div className="animate-bounce">
                    <MapPin size={32} className="text-red-500 drop-shadow-lg" fill="currentColor" />
                  </div>
                ) : (
                  <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-gray-700">
                    <Navigation size={14} className="text-blue-600" />
                    استخدم موقعي الحالي
                  </div>
                )}
              </div>
            </div>

            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50"
              rows={2}
              placeholder={selectedAddrId ? "ملاحظات إضافية..." : "أدخل العنوان يدوياً هنا..."}
              value={address}
              onChange={(e) => { setAddress(e.target.value); setSelectedAddrId(null); }}
            ></textarea>
          </div>
        </section>

        {/* Payment Method - New Integrated Component */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">طريقة الدفع</h2>
          <PaymentSelector
            shopId={cart[0]?.shop_id || 1}
            totalAmount={finalTotal}
            onPaymentSelect={handlePaymentSelect}
          />
        </section>

        {/* Summary */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">الفاتورة</h2>
          <div className="space-y-2 text-sm text-gray-600 border-b border-gray-100 pb-2 mb-2">
            <div className="flex justify-between">
              <span>قيمة المنتجات</span>
              <span>{total.toLocaleString()} ر.ي</span>
            </div>
            <div className="flex justify-between">
              <span>رسوم التوصيل</span>
              <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} ر.ي` : 'مجاني'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>الإجمالي النهائي</span>
            <span>{finalTotal.toLocaleString()} ر.ي</span>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20 pb-8">
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={loading}
          className="py-4 text-lg shadow-green-500/30"
        >
          {selectedPaymentMethod !== 'cash_on_delivery' && !isPaymentValid
            ? 'يرجى تأكيد الدفع أولاً'
            : `تأكيد الطلب (${finalTotal.toLocaleString()} ر.ي)`}
        </Button>
      </div>
    </div>
  );
};