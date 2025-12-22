# 🎯 دليل إدارة الميزات (Features Management)

## نظرة عامة

كل محل يمكن أن يكون له **ميزات مختلفة** حسب:
- 💰 الباقة المشتراة (Basic / Premium / Enterprise)
- 🎁 طلبات خاصة من المستثمر
- 🌍 المنطقة الجغرافية
- 📊 حجم العمل

---

## 📋 الميزات المتاحة

### 1. ميزات الدفع
```json
{
  "enablePaymentOnline": false,    // دفع إلكتروني
  "enablePaymentCash": true         // دفع عند الاستلام
}
```

**الاستخدام في الكود:**
```typescript
import { useFeatures } from '../hooks/useFeatures';

const Checkout = () => {
  const { hasFeature } = useFeatures();
  
  return (
    <div>
      {hasFeature('enablePaymentCash') && (
        <button>الدفع عند الاستلام</button>
      )}
      
      {hasFeature('enablePaymentOnline') && (
        <button>الدفع الإلكتروني</button>
      )}
    </div>
  );
};
```

---

### 2. ميزات التوصيل
```json
{
  "enableDelivery": true,              // خدمة التوصيل
  "enableOrderTracking": true,         // تتبع الطلب
  "enableScheduledDelivery": false     // توصيل مجدول
}
```

---

### 3. ميزات التفاعل
```json
{
  "enableReviews": true,          // التقييمات والمراجعات
  "enableWishlist": true,         // قائمة المفضلة
  "enableChat": false,            // الدردشة المباشرة
  "enableSocialShare": true       // المشاركة على السوشيال ميديا
}
```

**مثال:**
```typescript
const ProductDetails = ({ product }) => {
  const { hasFeature } = useFeatures();
  
  return (
    <div>
      <h1>{product.name}</h1>
      
      {hasFeature('enableReviews') && (
        <ReviewsSection productId={product.id} />
      )}
      
      {hasFeature('enableWishlist') && (
        <button onClick={addToWishlist}>
          ❤️ إضافة للمفضلة
        </button>
      )}
      
      {hasFeature('enableSocialShare') && (
        <ShareButtons product={product} />
      )}
    </div>
  );
};
```

---

### 4. ميزات الولاء والمكافآت
```json
{
  "enableLoyaltyPoints": false,    // نقاط الولاء
  "enableCoupons": false,          // الكوبونات والخصومات
  "enableReferralProgram": false   // برنامج الإحالة
}
```

---

### 5. ميزات الإشعارات
```json
{
  "enableNotifications": true      // الإشعارات الفورية
}
```

---

### 6. حدود الاستخدام
```json
{
  "maxProductsPerOrder": 50,       // أقصى عدد منتجات في الطلب
  "maxOrdersPerDay": 100           // أقصى عدد طلبات يومياً
}
```

**الاستخدام:**
```typescript
const Cart = ({ items }) => {
  const { canAddMoreProducts, getFeatureValue } = useFeatures();
  
  const maxProducts = getFeatureValue('maxProductsPerOrder');
  const currentCount = items.length;
  
  const handleAddToCart = (product) => {
    if (!canAddMoreProducts(currentCount)) {
      alert(`الحد الأقصى ${maxProducts} منتج في الطلب`);
      return;
    }
    
    // إضافة للسلة
  };
  
  return (
    <div>
      <p>المنتجات: {currentCount} / {maxProducts}</p>
      {/* ... */}
    </div>
  );
};
```

---

### 7. ميزات متقدمة
```json
{
  "enableMultipleAddresses": true,        // عناوين متعددة
  "enableProductRecommendations": true,   // اقتراحات المنتجات
  "enableCustomCategories": true,         // تصنيفات مخصصة
  "enableFlashSales": false,              // عروض فلاش
  "enableBulkOrders": false               // طلبات جملة
}
```

---

## 🎨 أمثلة عملية

### مثال 1: محل بسيط (Basic Plan)

```json
{
  "shopId": "shop_basic",
  "shopName": "محل الحي",
  "plan": "basic",
  "features": {
    "enableDelivery": true,
    "enablePaymentCash": true,
    "enablePaymentOnline": false,
    "enableReviews": false,
    "enableWishlist": true,
    "enableNotifications": false,
    "enableChat": false,
    "enableLoyaltyPoints": false,
    "enableCoupons": false,
    "maxProductsPerOrder": 20,
    "maxOrdersPerDay": 50
  }
}
```

**الميزات:**
- ✅ توصيل أساسي
- ✅ دفع نقدي فقط
- ✅ قائمة مفضلة
- ❌ بدون تقييمات
- ❌ بدون إشعارات
- ❌ بدون برامج ولاء

---

### مثال 2: محل متقدم (Premium Plan)

```json
{
  "shopId": "shop_premium",
  "shopName": "سوق الفخامة",
  "plan": "premium",
  "features": {
    "enableDelivery": true,
    "enablePaymentCash": true,
    "enablePaymentOnline": true,
    "enableReviews": true,
    "enableWishlist": true,
    "enableNotifications": true,
    "enableChat": true,
    "enableLoyaltyPoints": true,
    "enableCoupons": true,
    "enableOrderTracking": true,
    "enableScheduledDelivery": true,
    "enableProductRecommendations": true,
    "enableSocialShare": true,
    "maxProductsPerOrder": 100,
    "maxOrdersPerDay": 500
  }
}
```

**الميزات:**
- ✅ كل شيء مفعل!
- ✅ دفع إلكتروني
- ✅ دردشة مباشرة
- ✅ نقاط ولاء
- ✅ كوبونات
- ✅ توصيل مجدول

---

## 🔧 كيفية إضافة ميزة جديدة

### الخطوة 1: أضف الميزة في التكوين

```json
// config/shops/shop_XXX.json
{
  "features": {
    // ... الميزات الموجودة
    "enableNewFeature": true  // ← ميزة جديدة
  }
}
```

### الخطوة 2: أضف التعريف في useFeatures.ts

```typescript
export interface ShopFeatures {
  // ... الميزات الموجودة
  enableNewFeature: boolean;  // ← أضف هنا
}

const DEFAULT_FEATURES: ShopFeatures = {
  // ... الميزات الموجودة
  enableNewFeature: false  // ← القيمة الافتراضية
};
```

### الخطوة 3: استخدمها في الكود

```typescript
const MyComponent = () => {
  const { hasFeature } = useFeatures();
  
  if (hasFeature('enableNewFeature')) {
    return <NewFeatureComponent />;
  }
  
  return <StandardComponent />;
};
```

---

## 📊 الباقات المقترحة

### 🥉 Basic - 300$ لمرة واحدة
```json
{
  "plan": "basic",
  "features": {
    "enableDelivery": true,
    "enablePaymentCash": true,
    "enableWishlist": true,
    "enableOrderTracking": true,
    "maxProductsPerOrder": 20,
    "maxOrdersPerDay": 50
  }
}
```

### 🥈 Premium - 600$ لمرة واحدة
```json
{
  "plan": "premium",
  "features": {
    // كل ميزات Basic +
    "enablePaymentOnline": true,
    "enableReviews": true,
    "enableNotifications": true,
    "enableCoupons": true,
    "enableProductRecommendations": true,
    "maxProductsPerOrder": 50,
    "maxOrdersPerDay": 200
  }
}
```

### 🥇 Enterprise - 1000$ لمرة واحدة
```json
{
  "plan": "enterprise",
  "features": {
    // كل الميزات مفعلة!
    "enableChat": true,
    "enableLoyaltyPoints": true,
    "enableScheduledDelivery": true,
    "enableReferralProgram": true,
    "enableFlashSales": true,
    "enableBulkOrders": true,
    "maxProductsPerOrder": 200,
    "maxOrdersPerDay": 1000
  }
}
```

---

## 🎯 نصائح مهمة

### 1. التخصيص حسب الطلب
```json
// عميل يريد ميزات مخصصة
{
  "plan": "custom",
  "features": {
    "enableDelivery": true,
    "enablePaymentCash": true,
    "enableReviews": true,      // طلب خاص
    "enableChat": true,          // طلب خاص
    "enableCoupons": false,      // لا يريدها
    "maxProductsPerOrder": 30    // حد مخصص
  }
}
```

### 2. الميزات الموسمية
```json
{
  "features": {
    "enableFlashSales": true,  // فقط في رمضان
    "enableBulkOrders": true   // فقط في المواسم
  }
}
```

### 3. الترقية التدريجية
```javascript
// يمكنك ترقية العميل لاحقاً
// فقط عدل ملف التكوين وأعد البناء
{
  "plan": "premium",  // كان basic
  "features": {
    "enablePaymentOnline": true  // ميزة جديدة
  }
}
```

---

## 🔒 الأمان

**مهم:** الميزات يتم التحقق منها في:
1. ✅ Frontend (لإخفاء/إظهار الواجهة)
2. ✅ Backend (للتحقق الفعلي)

```php
// في Laravel Backend
public function placeOrder(Request $request) {
    $shop = Shop::find($request->shop_id);
    
    // التحقق من الميزات
    if (!$shop->features['enableDelivery']) {
        return response()->json(['error' => 'Delivery not available'], 403);
    }
    
    // التحقق من الحدود
    if ($request->items_count > $shop->features['maxProductsPerOrder']) {
        return response()->json(['error' => 'Too many items'], 400);
    }
    
    // ... باقي الكود
}
```

---

## 📝 الخلاصة

نظام الميزات يسمح لك بـ:
- ✅ تخصيص كل تطبيق حسب المستثمر
- ✅ إنشاء باقات مختلفة
- ✅ الترقية/التخفيض بسهولة
- ✅ إضافة ميزات جديدة بسرعة
- ✅ التحكم في الحدود والقيود

**كل محل = تكوين فريد = تطبيق مخصص!** 🎯
