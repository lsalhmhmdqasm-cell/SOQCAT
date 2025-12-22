import React, { useState, useEffect } from 'react';
import { Search, Heart, Bell } from 'lucide-react';
import { Product, Category, Slider } from '../types';
import { api } from '../services/api'; // Use Real API
import { useFeatures } from '../hooks/useFeatures';
import { ProductSkeleton, Skeleton } from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

interface HomeProps {
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onProductClick, addToCart }) => {
  const navigate = useNavigate();
  const { user } = useShop();
  const { filterCategories, filterProductsByCategoryPrivacy } = useFeatures();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedProdsStr = localStorage.getItem('cache:products');
        const cachedCatsStr = localStorage.getItem('cache:categories');
        const now = Date.now();
        if (cachedProdsStr) {
          const cached = JSON.parse(cachedProdsStr);
          if (cached && cached.ts && (now - cached.ts) < 120000 && Array.isArray(cached.data)) {
            setProducts(cached.data);
            setLoading(false);
          }
        }
        if (cachedCatsStr) {
          const cached = JSON.parse(cachedCatsStr);
          if (cached && cached.ts && (now - cached.ts) < 120000 && Array.isArray(cached.data)) {
            setCategories(cached.data);
          }
        }
        const [prodsRes, catsRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories') // ✅ استخدام Categories API الحقيقي
        ]);

        setProducts(prodsRes.data);
        setCategories(catsRes.data);
        localStorage.setItem('cache:products', JSON.stringify({ data: prodsRes.data, ts: Date.now() }));
        localStorage.setItem('cache:categories', JSON.stringify({ data: catsRes.data, ts: Date.now() }));

        // Mock Sliders for now until backend endpoint exists
        setSliders([
          { id: '1', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop', title: 'أجود أنواع القات' }
        ]);

        // Get unread notifications count
        if (user) {
          try {
            const notifRes = await api.get('/notifications');
            setUnreadCount(notifRes.data.unread_count || 0);
          } catch (e) {
            setUnreadCount(0);
          }
        }
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Auto-scroll slider
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders]);

  const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/wishlist/${productId}`);
      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isFavorite: res.data.is_favorite } : p
      ));
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const filteredProductsBase = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'الكل' || p.category === activeCategory || (activeCategory !== 'الكل' && p.category?.includes(activeCategory));
    return matchesSearch && matchesCategory;
  });
  const filteredProducts = filterProductsByCategoryPrivacy(filteredProductsBase, !!user);

  return (
    <div className="pb-24">
      {/* Header / Search */}
      <div className="bg-green-700 p-4 sticky top-0 z-40 rounded-b-2xl shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-white text-xl font-bold">متجر القات</h1>
          <button onClick={() => navigate('/notifications')} className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-green-700"></span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner text-right"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Banner Slider */}
      <div className="mt-4 px-4">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : sliders.length > 0 ? (
          <div className="h-40 rounded-2xl overflow-hidden relative shadow-lg">
            {sliders.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" loading="lazy" decoding="async" fetchPriority="low" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h2 className="text-white font-bold text-lg">{slide.title}</h2>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
              {sliders.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Categories */}
      <div className="mt-6 px-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-800">التصنيفات</h3>
          <span className="text-xs text-green-600 cursor-pointer">عرض الكل</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('الكل')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'الكل' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            الكل
          </button>
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} width={80} height={36} className="rounded-full flex-shrink-0" />)
          ) : (
            filterCategories(categories, !!user).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.name ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="mt-6 px-4">
        <h3 className="font-bold text-gray-800 mb-3">الأكثر طلباً</h3>
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            [1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer relative group" onClick={() => onProductClick(product)}>
                <button
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm z-10 ${product.isFavorite ? 'bg-red-50 text-red-500' : 'bg-white text-gray-300'}`}
                  onClick={(e) => toggleFavorite(e, product.id)}
                >
                  <Heart size={16} fill={product.isFavorite ? "currentColor" : "none"} />
                </button>
                <div className="h-32 rounded-xl overflow-hidden mb-3 bg-gray-100">
                  <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" fetchPriority="low" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.category}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-green-700 font-bold text-sm">{Number(product.price).toLocaleString()} ر.ي</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-gray-400">
              لا توجد منتجات مطابقة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
