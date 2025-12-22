import { Product, Category, Order, User, OrderStatus, AppSettings, Slider, DeliveryPerson, Address, AppNotification } from '../types';

// Initial Data - Images selected to resemble Qat bundles (Greenery/Herbs/Tea leaves)
const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'قات أرحبي (فاخر)', 
    price: 10000, 
    description: 'أجود أنواع القات الأرحبي، قطفة أولى، أوراق طرية وطعم حالي.', 
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=400&auto=format&fit=crop', 
    category: 'أرحبي' 
  },
  { 
    id: '2', 
    name: 'قات بلوط (طويل)', 
    price: 6000, 
    description: 'قات بلوط بأغصان طويلة، خيار ممتاز للمقيل الطويل.', 
    image: 'https://images.unsplash.com/photo-1615485925694-a035aa0042dd?q=80&w=400&auto=format&fit=crop', 
    category: 'بلوط' 
  },
  { 
    id: '3', 
    name: 'قات صعدي (مخصص)', 
    price: 8000, 
    description: 'قات صعدي خامة نظيفة ومختارة بعناية.', 
    image: 'https://images.unsplash.com/photo-1627918536120-d46b7441584b?q=80&w=400&auto=format&fit=crop', 
    category: 'صعدي' 
  },
  { 
    id: '4', 
    name: 'قات قيفي (ممتاز)', 
    price: 5000, 
    description: 'قات قيفي جودة ممتازة وسعر مناسب.', 
    image: 'https://images.unsplash.com/photo-1565553580554-d89481b49f57?q=80&w=400&auto=format&fit=crop', 
    category: 'قيفي' 
  },
  { 
    id: '5', 
    name: 'قات عنسي (رأس)', 
    price: 3500, 
    description: 'قات عنسي للاستخدام اليومي، جودة جيدة.', 
    image: 'https://images.unsplash.com/photo-1564858882885-4848d799d63f?q=80&w=400&auto=format&fit=crop', 
    category: 'عنسي' 
  },
  { 
    id: '6', 
    name: 'أرحبي (رقم 1)', 
    price: 15000, 
    description: 'القمة في الجودة، أرحبي درجة أولى خاص للضيوف والمناسبات.', 
    image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=400&auto=format&fit=crop', 
    category: 'أرحبي' 
  },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'أرحبي', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=200&auto=format&fit=crop' },
  { id: '2', name: 'بلوط', image: 'https://images.unsplash.com/photo-1615485925694-a035aa0042dd?q=80&w=200&auto=format&fit=crop' },
  { id: '3', name: 'صعدي', image: 'https://images.unsplash.com/photo-1627918536120-d46b7441584b?q=80&w=200&auto=format&fit=crop' },
  { id: '4', name: 'قيفي', image: 'https://images.unsplash.com/photo-1565553580554-d89481b49f57?q=80&w=200&auto=format&fit=crop' },
  { id: '5', name: 'عنسي', image: 'https://images.unsplash.com/photo-1564858882885-4848d799d63f?q=80&w=200&auto=format&fit=crop' },
];

const INITIAL_SLIDERS: Slider[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop', title: 'سوق بن عبود - مأرب' },
  { id: '2', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop', title: 'أجود أنواع الأرحبي والبلوط' },
];

const INITIAL_DELIVERY_PERSONS: DeliveryPerson[] = [
  { id: 'd1', name: 'صالح المأربي', phone: '711222333', status: 'available' },
  { id: 'd2', name: 'ناجي السائق', phone: '777888999', status: 'busy' },
];

const INITIAL_SETTINGS: AppSettings = {
  shopName: 'سوق بن عبود للقات',
  logo: 'https://cdn-icons-png.flaticon.com/512/743/743007.png', // Leaf icon
  deliveryFee: 1000,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: '1', title: 'مرحباً بكم في بن عبود', body: 'نرحب بكم في تطبيقنا الجديد. التوصيل متوفر لجميع مناطق مأرب.', date: new Date().toISOString(), isRead: false, type: 'system' },
];

// Mutable Admin Object for Mocking
let MOCK_ADMIN: User = {
  id: 'admin1',
  name: 'المدير (بن عبود)',
  phone: 'admin',
  isAdmin: true,
  joinedAt: new Date().toISOString()
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to manage LS
const getLS = (key: string, initial: any) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

const setLS = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockApi = {
  // --- AUTH ---
  login: async (phone: string, password: string): Promise<User> => {
    await delay(800);
    // Check Admin
    if (phone === MOCK_ADMIN.phone && password === 'admin') return MOCK_ADMIN;
    
    const users: User[] = getLS('users', []);
    const user = users.find(u => u.phone === phone);
    
    if (user) return user;
    
    if (phone === '777000000' && password === '123456') {
        return { id: 'u1', name: 'أحمد اليمني', phone: '777000000', isAdmin: false, joinedAt: new Date().toISOString() };
    }
    
    throw new Error('Invalid credentials');
  },

  register: async (name: string, phone: string, password: string): Promise<User> => {
    await delay(800);
    const users: User[] = getLS('users', []);
    if (users.find(u => u.phone === phone)) {
      throw new Error('User already exists');
    }
    const newUser: User = { 
      id: Date.now().toString(), 
      name, 
      phone, 
      isAdmin: false, 
      joinedAt: new Date().toISOString() 
    };
    users.push(newUser);
    setLS('users', users);
    return newUser;
  },

  updateProfile: async (user: User, newPassword?: string): Promise<User> => {
    await delay(500);
    
    // Update Admin Logic
    if (user.isAdmin) {
      MOCK_ADMIN = { ...MOCK_ADMIN, ...user };
      if (newPassword) {
         // In a real app, update password in DB
         console.log("Admin password updated to:", newPassword);
      }
      return MOCK_ADMIN;
    }

    // Update Normal User Logic
    const users: User[] = getLS('users', []);
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    setLS('users', updatedUsers);
    
    if (newPassword) {
       console.log("User password updated for", user.id);
       // Logic to update password in storage would go here
    }
    
    return user;
  },

  getUsers: async (): Promise<User[]> => {
    await delay(500);
    return getLS('users', []);
  },

  // --- ADDRESS BOOK ---
  getAddresses: async (): Promise<Address[]> => {
    await delay(300);
    return getLS('addresses', []);
  },

  addAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
    await delay(400);
    const addresses = getLS('addresses', []);
    const newAddr = { ...address, id: Date.now().toString() };
    setLS('addresses', [...addresses, newAddr]);
    return newAddr;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await delay(300);
    const addresses: Address[] = getLS('addresses', []);
    setLS('addresses', addresses.filter(a => a.id !== id));
  },

  // --- WISHLIST ---
  getWishlist: async (): Promise<string[]> => {
    await delay(200);
    return getLS('wishlist', []); // returns product IDs
  },

  toggleWishlist: async (productId: string): Promise<boolean> => {
    await delay(200);
    const list: string[] = getLS('wishlist', []);
    let newList;
    let isAdded = false;
    if (list.includes(productId)) {
      newList = list.filter(id => id !== productId);
    } else {
      newList = [...list, productId];
      isAdded = true;
    }
    setLS('wishlist', newList);
    return isAdded;
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (): Promise<AppNotification[]> => {
    await delay(400);
    return getLS('notifications', INITIAL_NOTIFICATIONS);
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await delay(200);
    const notifs: AppNotification[] = getLS('notifications', INITIAL_NOTIFICATIONS);
    setLS('notifications', notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    const products = getLS('products', INITIAL_PRODUCTS);
    const wishlist = getLS('wishlist', []);
    return products.map((p: Product) => ({ ...p, isFavorite: wishlist.includes(p.id) }));
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const products = getLS('products', INITIAL_PRODUCTS);
    const newProduct = { ...product, id: Date.now().toString() };
    setLS('products', [newProduct, ...products]);
    return newProduct;
  },

  updateProduct: async (product: Product): Promise<Product> => {
    await delay(500);
    const products: Product[] = getLS('products', INITIAL_PRODUCTS);
    const updated = products.map(p => p.id === product.id ? product : p);
    setLS('products', updated);
    return product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(300);
    const products: Product[] = getLS('products', INITIAL_PRODUCTS);
    setLS('products', products.filter(p => p.id !== id));
  },

  // --- CATEGORIES ---
  getCategories: async (): Promise<Category[]> => {
    await delay(300);
    return getLS('categories', INITIAL_CATEGORIES);
  },

  addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    await delay(300);
    const categories = getLS('categories', INITIAL_CATEGORIES);
    const newCat = { ...category, id: Date.now().toString() };
    setLS('categories', [...categories, newCat]);
    return newCat;
  },

  deleteCategory: async (id: string): Promise<void> => {
     await delay(300);
     const categories: Category[] = getLS('categories', INITIAL_CATEGORIES);
     setLS('categories', categories.filter(c => c.id !== id));
  },

  // --- ORDERS ---
  submitOrder: async (order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> => {
    await delay(1000);
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      status: OrderStatus.PENDING,
      estimatedTime: 45 // 45 minutes default
    };
    const currentOrders = getLS('orders', []);
    setLS('orders', [newOrder, ...currentOrders]);
    
    // Add Notification for order
    const notifs = getLS('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
       id: Date.now().toString(),
       title: 'تم استلام طلبك',
       body: `تم استلام الطلب رقم ${newOrder.id} بنجاح`,
       date: new Date().toISOString(),
       isRead: false,
       type: 'order',
       relatedId: newOrder.id
    };
    setLS('notifications', [newNotif, ...notifs]);

    return newOrder;
  },

  getOrders: async (userId?: string): Promise<Order[]> => {
    await delay(300);
    const allOrders = getLS('orders', []);
    if (!userId) return allOrders;
    return allOrders.filter((o: Order) => o.userId === userId);
  },
  
  getOrderById: async (id: string): Promise<Order | null> => {
    await delay(300);
    const allOrders = getLS('orders', []);
    return allOrders.find((o: Order) => o.id === id) || null;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await delay(300);
    const allOrders = getLS('orders', []);
    const updatedOrders = allOrders.map((o: Order) => o.id === orderId ? { ...o, status } : o);
    setLS('orders', updatedOrders);
  },

  assignDriver: async (orderId: string, driverId: string): Promise<void> => {
    await delay(300);
    const allOrders = getLS('orders', []);
    const updatedOrders = allOrders.map((o: Order) => o.id === orderId ? { ...o, deliveryPersonId: driverId } : o);
    setLS('orders', updatedOrders);
  },

  // --- DELIVERY PERSONS ---
  getDeliveryPersons: async (): Promise<DeliveryPerson[]> => {
    await delay(300);
    return getLS('delivery_persons', INITIAL_DELIVERY_PERSONS);
  },

  addDeliveryPerson: async (person: Omit<DeliveryPerson, 'id' | 'status'>): Promise<DeliveryPerson> => {
    await delay(300);
    const persons = getLS('delivery_persons', INITIAL_DELIVERY_PERSONS);
    const newPerson: DeliveryPerson = { ...person, id: Date.now().toString(), status: 'available' };
    setLS('delivery_persons', [...persons, newPerson]);
    return newPerson;
  },

  deleteDeliveryPerson: async (id: string): Promise<void> => {
    await delay(300);
    const persons: DeliveryPerson[] = getLS('delivery_persons', INITIAL_DELIVERY_PERSONS);
    setLS('delivery_persons', persons.filter(p => p.id !== id));
  },

  // --- SETTINGS & SLIDERS ---
  getSettings: async (): Promise<AppSettings> => {
    await delay(200);
    return getLS('settings', INITIAL_SETTINGS);
  },

  updateSettings: async (settings: AppSettings): Promise<AppSettings> => {
    await delay(400);
    setLS('settings', settings);
    return settings;
  },

  getSliders: async (): Promise<Slider[]> => {
    await delay(200);
    return getLS('sliders', INITIAL_SLIDERS);
  },

  addSlider: async (slider: Omit<Slider, 'id'>): Promise<Slider> => {
    await delay(300);
    const sliders = getLS('sliders', INITIAL_SLIDERS);
    const newSlider = { ...slider, id: Date.now().toString() };
    setLS('sliders', [...sliders, newSlider]);
    return newSlider;
  },

  deleteSlider: async (id: string): Promise<void> => {
    await delay(300);
    const sliders: Slider[] = getLS('sliders', INITIAL_SLIDERS);
    setLS('sliders', sliders.filter(s => s.id !== id));
  },

  // --- STATS ---
  getDashboardStats: async () => {
    await delay(300);
    const orders: Order[] = getLS('orders', []);
    const products: Product[] = getLS('products', INITIAL_PRODUCTS);
    const users: User[] = getLS('users', []);
    
    const today = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(o => o.date.startsWith(today)).length;
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Calculate Best Selling
    const productSales: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
      });
    });

    const bestSelling = Object.entries(productSales)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id);
        return product ? { name: product.name, sales: qty, image: product.image, price: product.price } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.sales - a!.sales)
      .slice(0, 5);

    // Calculate Sales History (Last 7 days)
    const chartData = [];
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const sales = orders
        .filter(o => o.date.startsWith(dayStr))
        .reduce((sum, o) => sum + o.total, 0);
      
      // Randomize fake data if no orders for demo purposes
      const finalSales = sales > 0 ? sales : Math.floor(Math.random() * 5000) + 1000;

      chartData.push({ name: dayName, sales: finalSales });
    }

    return {
      ordersToday,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length + 1, 
      totalRevenue,
      bestSelling,
      chartData
    };
  }
};