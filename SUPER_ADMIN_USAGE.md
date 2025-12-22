# نظام Super Admin - دليل الاستخدام

## ✅ ما تم إنشاؤه

### Backend (كامل)

**Migrations (5):**
- ✅ `clients` - جدول المحلات
- ✅ `subscriptions` - الاشتراكات
- ✅ `system_updates` - التحديثات
- ✅ `support_tickets` - تذاكر الدعم
- ✅ `ticket_replies` - ردود التذاكر

**Models (5):**
- ✅ Client
- ✅ Subscription
- ✅ SupportTicket
- ✅ TicketReply
- ✅ SystemUpdate

**Controllers (4):**
- ✅ DashboardController - الإحصائيات
- ✅ ClientController - إدارة المحلات
- ✅ SupportController - الدعم الفني
- ✅ UpdateController - التحديثات

**Routes:**
- ✅ جميع الـ API endpoints جاهزة

### Frontend

**Components:**
- ✅ SuperAdminDashboard - لوحة التحكم

---

## 🚀 خطوات التفعيل

### 1. تشغيل Migrations

```bash
cd backend
php artisan migrate
```

### 2. إنشاء Super Admin User

```bash
php artisan tinker
```

```php
$user = new App\Models\User();
$user->name = 'Super Admin';
$user->email = 'admin@qatshop.com';
$user->password = bcrypt('your-secure-password');
$user->role = 'super_admin';
$user->save();
```

### 3. تسجيل الدخول

```
URL: http://localhost:8000/api/login
Email: admin@qatshop.com
Password: your-secure-password
```

---

## 📊 API Endpoints

### Dashboard
```
GET /api/super-admin/dashboard
```

### إدارة المحلات
```
GET    /api/super-admin/clients
POST   /api/super-admin/clients
PUT    /api/super-admin/clients/{id}
DELETE /api/super-admin/clients/{id}
PUT    /api/super-admin/clients/{id}/suspend
PUT    /api/super-admin/clients/{id}/activate
PUT    /api/super-admin/clients/{id}/extend
```

### الدعم الفني
```
GET  /api/super-admin/tickets
GET  /api/super-admin/tickets/{id}
POST /api/super-admin/tickets/{id}/reply
PUT  /api/super-admin/tickets/{id}/status
PUT  /api/super-admin/tickets/{id}/assign
```

### التحديثات
```
GET  /api/super-admin/updates
POST /api/super-admin/updates
POST /api/super-admin/updates/{id}/deploy
GET  /api/super-admin/updates/{id}/stats
```

---

## 💡 أمثلة الاستخدام

### إضافة محل جديد

```bash
POST /api/super-admin/clients
```

```json
{
  "shop_name": "متجر القات الممتاز",
  "owner_name": "أحمد محمد",
  "email": "shop1@example.com",
  "phone": "777123456",
  "domain": "shop1.qatshop.com",
  "subscription_type": "monthly",
  "plan_name": "Pro",
  "price": 5000
}
```

### تعليق محل

```bash
PUT /api/super-admin/clients/1/suspend
```

### تمديد اشتراك

```bash
PUT /api/super-admin/clients/1/extend
```

```json
{
  "months": 3
}
```

### إنشاء تحديث

```bash
POST /api/super-admin/updates
```

```json
{
  "version": "v1.2.0",
  "title": "تحديث أمني مهم",
  "description": "إصلاح ثغرة أمنية",
  "changelog": "- إصلاح XSS\n- تحسين الأداء",
  "release_date": "2025-12-22",
  "is_critical": true
}
```

### نشر تحديث

```bash
POST /api/super-admin/updates/1/deploy
```

```json
{
  "target_clients": "all"
}
```

أو لمحلات محددة:

```json
{
  "target_clients": [1, 2, 3]
}
```

---

## 🎨 الشاشات المتوفرة

### 1. Dashboard ✅
- إحصائيات شاملة
- حالة المحلات
- التذاكر العاجلة
- إجراءات سريعة

### 2. إدارة المحلات (قريباً)
- قائمة المحلات
- إضافة/تعديل/حذف
- تعليق/تفعيل
- تمديد اشتراك

### 3. الدعم الفني (قريباً)
- قائمة التذاكر
- عرض التفاصيل
- الرد والإغلاق

### 4. التحديثات (قريباً)
- قائمة التحديثات
- إنشاء جديد
- نشر وتتبع

---

## 🔐 الصلاحيات

### Super Admin
- الوصول الكامل
- إدارة المحلات
- التحديثات
- الدعم الفني

### Support Admin (مستقبلي)
- الدعم الفني فقط
- عرض المحلات

---

## ✅ الحالة الحالية

**Backend:** 100% جاهز ✅
- Database schema
- Models
- Controllers
- Routes

**Frontend:** 25% جاهز
- ✅ Dashboard
- ⏳ Client Manager
- ⏳ Support Tickets
- ⏳ Updates Manager

---

## 📝 الخطوات التالية

1. ✅ تشغيل migrations
2. ✅ إنشاء Super Admin user
3. ⏳ إكمال Frontend components
4. ⏳ إضافة Charts/Graphs
5. ⏳ نظام الإشعارات

---

**الحالة:** Backend جاهز 100%، Frontend Dashboard جاهز! 🚀
