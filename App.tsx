import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Product, CartItem, User } from './types';
import { mockApi } from './services/mockApi';
import { AdminLayout } from './components/AdminLayout';
import { Toast, ToastType } from './components/Toast';
import { LoginRequired } from './components/LoginRequired';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails').then(module => ({ default: module.ProductDetails })));
const Cart = React.lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory').then(module => ({ default: module.OrderHistory })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder').then(module => ({ default: module.TrackOrder })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking').then(module => ({ default: module.OrderTracking })));
const Support = React.lazy(() => import('./pages/Support').then(module => ({ default: module.Support })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Admin Pages Lazy Load
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const ProductManager = React.lazy(() => import('./pages/admin/ProductManager').then(module => ({ default: module.ProductManager })));
const CategoryManager = React.lazy(() => import('./pages/admin/CategoryManager').then(module => ({ default: module.CategoryManager })));
const OrderManager = React.lazy(() => import('./pages/admin/OrderManager').then(module => ({ default: module.OrderManager })));
const UserManager = React.lazy(() => import('./pages/admin/UserManager').then(module => ({ default: module.UserManager })));
const SettingsManager = React.lazy(() => import('./pages/admin/SettingsManager').then(module => ({ default: module.SettingsManager })));
const DeliveryManager = React.lazy(() => import('./pages/admin/DeliveryManager').then(module => ({ default: module.DeliveryManager })));
const PaymentSettings = React.lazy(() => import('./pages/admin/PaymentSettings').then(module => ({ default: module.default })));
const StockManagement = React.lazy(() => import('./pages/admin/StockManagement').then(module => ({ default: module.StockManagement })));
const CouponManager = React.lazy(() => import('./pages/admin/CouponManager').then(module => ({ default: module.CouponManager })));
const LoyaltyPage = React.lazy(() => import('./pages/LoyaltyPage').then(module => ({ default: module.LoyaltyPage })));
const ClientManager = React.lazy(() => import('./pages/admin/ClientManager').then(module => ({ default: module.ClientManager })));
const SupportTickets = React.lazy(() => import('./pages/admin/SupportTickets').then(module => ({ default: module.SupportTickets })));
const UpdatesManager = React.lazy(() => import('./pages/admin/UpdatesManager').then(module => ({ default: module.UpdatesManager })));
// const ApiDocs = React.lazy(() => import('./pages/admin/ApiDocs').then(module => ({ default: module.ApiDocs })));


// Loading Spinner for Lazy Components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Splash Screen Component
const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinished, 2000);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 bg-green-700 flex flex-col items-center justify-center z-[100] text-white animate-fade-out">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
        <span className="text-4xl">🍃</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">سوق بن عبود للقات</h1>
      <p className="text-green-100 text-sm">مأرب - أجود أنواع القات</p>

      <div className="absolute bottom-6 text-center opacity-80">
        <p className="text-[10px] text-green-200">تطوير وبرمجة</p>
        <p className="text-xs font-bold text-white">الرياح للبرامج والتطبيقات</p>
        <p className="text-[10px] text-green-200 dir-ltr">772519054 / 718419380</p>
      </div>
    </div>
  );
};

import { App as CapacitorApp } from '@capacitor/app';

// Wrapper for logic inside Router
const AppContent = () => {
  const [loadingSplash, setLoadingSplash] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cart, shopSettings, isLoading: isContextLoading, addToCart, updateCartQuantity, removeFromCart, login, logout } = useShop();

  // Handle Android Back Button
  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || location.pathname === '/admin/dashboard') {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  // Toast State (kept local for now, could be in context)
  const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  // Sync active admin tab with URL
  useEffect(() => {
    if (user?.isAdmin) {
      const pathParts = location.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'admin' && lastPart !== '') {
        setActiveAdminTab(lastPart);
      } else if (location.pathname === '/admin/dashboard') {
        setActiveAdminTab('dashboard');
      }
    }
  }, [location, user]);

  const handleLogin = (loggedInUser: User) => {
    // Context login handles state update
    // Just show toast and navigate
    showToast(`مرحباً بك ${loggedInUser.name}`, 'success');

    if (loggedInUser.isAdmin) {
      navigate('/admin/dashboard');
    } else {
      const state = location.state as { from?: string };
      if (state?.from) {
        navigate(state.from);
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    logout();
    showToast('تم تسجيل الخروج بنجاح', 'info');
    navigate('/');
  };

  const handleUpdateUser = (updatedUser: User) => {
    // In real app, we would update API then refresh context
    showToast('تم تحديث الملف الشخصي', 'success');
  };

  const handleCheckoutSubmit = async (address: string) => {
    // Moved to Checkout page logic ideally, but keeping structure for now
    showToast('سيتم نقل هذا المنطق إلى صفحة الدفع', 'info');
  };

  if (loadingSplash || isContextLoading) {
    return <SplashScreen onFinished={() => setLoadingSplash(false)} />;
  }

  // Define routes where BottomNav should be hidden to avoid overlap
  const hideNavRoutes = [
    '/cart',
    '/checkout',
    '/login',
    '/product', // Matches /product/:id
    '/track',    // Matches /track/:id
    '/notifications',
    '/support'
  ];
  const shouldShowNav = !hideNavRoutes.some(route => location.pathname.startsWith(route));

  // --- ADMIN VIEW ---
  if (user?.isAdmin) {
    return (
      <>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        <AdminLayout
          activeTab={activeAdminTab}
          onNavigate={(path) => {
            setActiveAdminTab(path);
            navigate(`/admin/${path}`);
          }}
          onLogout={handleLogout}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/admin/dashboard" />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManager />} />
              <Route path="/admin/categories" element={<CategoryManager />} />
              <Route path="/admin/orders" element={<OrderManager />} />
              <Route path="/admin/delivery" element={<DeliveryManager />} />
              <Route path="/admin/users" element={<UserManager />} />
              <Route path="/admin/clients" element={<ClientManager />} />
              <Route path="/admin/tickets" element={<SupportTickets />} />
              <Route path="/admin/updates" element={<UpdatesManager />} />
              <Route path="/admin/settings" element={<SettingsManager />} />
              <Route path="/admin/payments" element={<PaymentSettings />} />
              <Route path="/admin/stocks" element={<StockManagement />} />
              <Route path="/admin/coupons" element={<CouponManager />} />
              <Route path="/admin/profile" element={
                <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
              } />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </Suspense>
        </AdminLayout>
      </>
    );
  }

  // --- MOBILE USER / GUEST VIEW ---
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          <Route path="/" element={<Home onProductClick={(p) => navigate(`/product/${p.id}`)} addToCart={(p) => { addToCart(p); showToast('تمت الإضافة للسلة'); }} />} />

          <Route path="/product/:id" element={
            <ProductDetails
              onBack={() => navigate(-1)}
              onAddToCart={(p) => { addToCart(p); showToast('تمت الإضافة للسلة'); navigate('/cart'); }}
            />
          } />

          <Route path="/cart" element={
            <Cart
              cart={cart}
              isGuest={!user}
              onUpdateQuantity={updateCartQuantity}
              onRemove={(id) => { removeFromCart(id); showToast('تم الحذف', 'warning'); }}
              onBack={() => navigate('/')}
              onCheckout={() => {
                if (user) {
                  navigate('/checkout');
                } else {
                  navigate('/login', { state: { from: '/checkout' } });
                  showToast('يرجى تسجيل الدخول لإتمام الطلب', 'info');
                }
              }}
            />
          } />

          <Route path="/checkout" element={
            user ? (
              <Checkout
                user={user}
                total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                onBack={() => navigate('/cart')}
                onSubmitOrder={handleCheckoutSubmit}
              />
            ) : <Navigate to="/login" state={{ from: '/checkout' }} />
          } />

          <Route path="/orders" element={
            user ? <OrderHistory user={user} /> : <LoginRequired message="لمتابعة طلباتك السابقة وتتبع حالتها" />
          } />

          <Route path="/track/:id" element={
            user ? <TrackOrder /> : <Navigate to="/login" />
          } />

          <Route path="/loyalty" element={
            user ? <LoyaltyPage /> : <LoginRequired message="لمعرفة نقاطك ودعوة أصدقائك" />
          } />

          <Route path="/profile" element={
            user ? (
              <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
            ) : <LoginRequired message="لإدارة حسابك وعناوينك المسجلة" />
          } />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<Support />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {shouldShowNav && (
        <BottomNav cartCount={cartCount} onNavigate={navigate} isAdmin={false} />
      )}
    </div>
  );
};

import { ShopProvider, useShop } from './context/ShopContext';

export default function App() {
  return (
    <ShopProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ShopProvider>
  );
}
