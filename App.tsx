import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Product, CartItem, User } from './types';
import { AdminLayout } from './components/AdminLayout';
import { SuperAdminLayout } from './components/SuperAdminLayout';
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

const SuperAdminDashboard = React.lazy(() => import('./pages/super-admin/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));
const SuperAdminClientManager = React.lazy(() => import('./pages/super-admin/ClientManager').then(module => ({ default: module.ClientManager })));
const SuperAdminSupportTickets = React.lazy(() => import('./pages/super-admin/SupportTickets').then(module => ({ default: module.SupportTickets })));
const SuperAdminUpdatesManager = React.lazy(() => import('./pages/super-admin/UpdatesManager').then(module => ({ default: module.UpdatesManager })));
const SuperAdminPlans = React.lazy(() => import('./pages/super-admin/PricingPlans').then(module => ({ default: module.PricingPlans })));
const SuperAdminLeads = React.lazy(() => import('./pages/super-admin/Leads').then(module => ({ default: module.Leads })));
const SuperAdminLandingSettings = React.lazy(() => import('./pages/super-admin/LandingSettings').then(module => ({ default: module.LandingSettings })));

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
      <h1 className="text-3xl font-bold mb-2">منصة قات شوب</h1>
      <p className="text-green-100 text-sm">منصة التطبيقات والباقات لأصحاب المحلات</p>

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

    const state = location.state as { from?: string };
    if (loggedInUser.role === 'super_admin') {
      navigate('/super-admin/dashboard');
      return;
    }
    if (loggedInUser.role === 'shop_admin' || loggedInUser.isAdmin) {
      navigate('/admin/dashboard');
      return;
    }
    if (state?.from) {
      navigate(state.from);
    } else {
      navigate('/');
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

  // ... imports
  const PlatformLanding = React.lazy(() => import('./pages/PlatformLanding').then(module => ({ default: module.PlatformLanding })));

  // ... (in AppContent)

  // Define routes where BottomNav should be hidden to avoid overlap
  const hideNavRoutes = [
    '/cart',
    '/checkout',
    '/login',
    '/product', // Matches /product/:id
    '/track',    // Matches /track/:id
    '/order-tracking', // Matches /order-tracking/:trackingNumber
    '/notifications',
    '/support',
    '/super-admin',
    '/' // Hide Nav on Landing Page
  ];
  // Ensure we check exact match for '/' or prefix for others
  const shouldShowNav = !hideNavRoutes.some(route => {
    if (route === '/') return location.pathname === '/';
    return location.pathname.startsWith(route);
  });

  // ... (Admin View logic remains same)

  // --- MOBILE USER / GUEST VIEW ---
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isWideLayout = location.pathname === '/' || location.pathname.startsWith('/super-admin');
  return (
    <div className={`${isWideLayout ? 'mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden' : 'max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden'}`}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* SaaS Landing Page is now Home */}
          <Route path="/" element={<PlatformLanding />} />

          {/* Login for Admin */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Super Admin Routes */}
          <Route path="/super-admin/dashboard" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/clients" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminClientManager />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/tickets" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminSupportTickets />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/updates" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminUpdatesManager />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/plans" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminPlans />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/leads" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminLeads />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/super-admin/landing" element={
            user && user.role === 'super_admin' ? (
              <SuperAdminLayout onLogout={handleLogout}>
                <SuperAdminLandingSettings />
              </SuperAdminLayout>
            ) : <Navigate to="/login" />
          } />

          {/* Shop Admin Routes */}
          <Route path="/admin/dashboard" element={
            user && (user.role === 'shop_admin' || user.isAdmin) ? (
              <AdminLayout activeTab={activeAdminTab} onNavigate={(id) => navigate(`/admin/${id}`)} onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            ) : <Navigate to="/login" />
          } />

          {/* Demo Store Routes (Optional: moved to /demo if needed, or kept accessible via direct link for testing) 
              For now, we keep them accessible but deeper, or just remove Home route. 
              Let's Keep 'Home' accessible via /store for demo purposes? 
              User asked specifically for Main Page to be Landing. 
          */}
          <Route path="/store" element={<Home onProductClick={(p) => navigate(`/product/${p.id}`)} addToCart={(p) => { addToCart(p); showToast('تمت الإضافة للسلة'); }} />} />

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
              onBack={() => navigate('/store')} // Back to Store
              onCheckout={() => {
                if (user) {
                  navigate('/checkout');
                } else {
                  showToast('هذا متجر تجريبي. الشراء يتم داخل تطبيق كل محل.', 'info');
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
            user ? <OrderTracking /> : <Navigate to="/login" />
          } />
          <Route path="/order-tracking/:trackingNumber" element={
            user ? <OrderTracking /> : <Navigate to="/login" />
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

      {/* Only show BottomNav if inside the Store part (e.g. /store, /orders) AND not in hidden routes */}
      {shouldShowNav && location.pathname !== '/' && (
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
