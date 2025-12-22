# إعداد WebSocket - دليل سريع

## الحالة الحالية

✅ الملفات جاهزة:
- `backend/app/Events/OrderStatusUpdated.php`
- `services/echo.ts` (معطل مؤقتاً)

⚠️ المكتبات غير مثبتة بعد

---

## خطوات التفعيل

### 1. تثبيت المكتبات (5 دقائق)

```bash
# Backend
cd backend
composer require pusher/pusher-php-server

# Frontend
cd ..
npm install laravel-echo pusher-js
```

### 2. إنشاء Pusher Account (مجاني)

1. اذهب إلى: https://pusher.com/
2. سجل حساب مجاني
3. أنشئ App جديد
4. احصل على:
   - App ID
   - App Key
   - App Secret
   - Cluster

### 3. تحديث Backend .env

```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

### 4. تحديث Frontend .env

```env
VITE_PUSHER_APP_KEY=your-app-key
VITE_PUSHER_APP_CLUSTER=mt1
```

### 5. تفعيل الكود في echo.ts

افتح `services/echo.ts` وأزل التعليقات من الكود الرئيسي واحذف الـ placeholder.

### 6. تحديث useOrderTracking

```typescript
// hooks/useOrderTracking.ts
import { echo } from '../services/echo';

export const useOrderTracking = (trackingNumber: string) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchOrder();

    // Listen for real-time updates
    if (order?.user_id) {
      echo.channel(`orders.${order.user_id}`)
        .listen('.order.status.updated', (e: any) => {
          if (e.order.tracking_number === trackingNumber) {
            setOrder(e.order);
          }
        });
    }

    return () => {
      if (order?.user_id) {
        echo.leaveChannel(`orders.${order.user_id}`);
      }
    };
  }, [trackingNumber, order?.user_id]);

  return { order, loading, error };
};
```

---

## الفوائد

### قبل (Polling):
- ⏱️ تحديث كل 10 ثوان
- 📡 طلب API مستمر
- 🔋 استهلاك موارد أكثر

### بعد (WebSocket):
- ⚡ تحديثات فورية
- 📡 اتصال واحد فقط
- 🔋 استهلاك أقل

---

## ملاحظات

- **مجاني:** Pusher مجاني حتى 200,000 رسالة/يوم
- **اختياري:** التطبيق يعمل بدون WebSocket (polling)
- **سهل:** التفعيل يأخذ 10 دقائق فقط

---

**الحالة:** جاهز للتفعيل عند الحاجة! ✅
