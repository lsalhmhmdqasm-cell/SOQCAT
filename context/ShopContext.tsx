import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, AppSettings } from '../types';
import { api } from '../services/api';

interface ShopContextType {
    shopSettings: AppSettings;
    user: User | null;
    cart: CartItem[];
    isLoading: boolean;
    login: (user: User, token?: string) => void;
    logout: () => void;
    addToCart: (product: Product) => void;
    updateCartQuantity: (productId: string, delta: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateShopSettings: (patch: Partial<AppSettings> & { primaryColor?: string; secondaryColor?: string; features?: Record<string, any> }) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState<AppSettings>({
        shopName: 'منصة قات شوب',
        logo: 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
        deliveryFee: 1000,
    });

    // SaaS Loading: Fetch config from backend based on current domain
    useEffect(() => {
        const loadSaaSConfig = async () => {
            try {
                // If we are on localhost and VITE_SHOP_ID is set, we might send it as hint or rely on IdentifyTenant fallback
                // But generally, we just call the endpoint.
                
                // Skip if we are explicitly on the main platform domain (e.g. www.qatshop.com)
                // For now, let's assume the backend handles the "Not Found" case for the landing page.

                const res = await api.get('/shop/config');
                const config = res.data;
                
                // Update Settings
                setShopSettings({
                    shopName: config?.shopName || 'منصة قات شوب',
                    logo: config?.logo || 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
                    deliveryFee: typeof config?.deliveryFee === 'number' ? config.deliveryFee : 1000,
                });

                // Persist minimal config for API calls if needed (though backend handles it)
                localStorage.setItem('shopConfig', JSON.stringify(config));

                // Apply Theme
                if (config.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
                }
                if (config.secondaryColor) {
                    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
                }
                if (config.shopName) {
                    document.title = config.shopName;
                }

            } catch (err) {
                console.log('Running in Platform Mode or Shop Not Found', err);
                // We might be on the landing page, so we keep default settings
            }
        };

        loadSaaSConfig();
    }, []);

    // Init User & Cart
    useEffect(() => {
        const initApp = async () => {
            try {
                const savedToken = localStorage.getItem('accessToken');
                if (savedToken) {
                    (api.defaults.headers as any).common = { ...(api.defaults.headers as any).common, Authorization: `Bearer ${savedToken}` };
                }
                const res = await api.get('/me');
                const mapped = { 
                    ...res.data, 
                    isAdmin: res.data?.isAdmin ?? (res.data?.role === 'shop_admin' || res.data?.role === 'super_admin')
                };
                setUser(mapped);
                localStorage.setItem('user', JSON.stringify(mapped));
            } catch (e) {
                setUser(null);
            }

            // Load Cart
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }

            setIsLoading(false);
        };

        initApp();
    }, []);

    // Sync Cart
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Actions
    const login = (userData: User, token?: string) => {
        const mapped = { 
            ...userData, 
            isAdmin: userData?.isAdmin ?? (userData?.role === 'shop_admin' || userData?.role === 'super_admin')
        };
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
        if (token) {
            localStorage.setItem('accessToken', token);
            (api.defaults.headers as any).common = { ...(api.defaults.headers as any).common, Authorization: `Bearer ${token}` };
        }
    };

    const logout = () => {
        api.post('/logout').catch(() => {});
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        if ((api.defaults.headers as any).common) {
            delete (api.defaults.headers as any).common['Authorization'];
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => setCart([]);

    const updateShopSettings = (patch: Partial<AppSettings> & { primaryColor?: string; secondaryColor?: string; features?: Record<string, any> }) => {
        // Optimistic UI update only - Real update happens via Admin API
        setShopSettings(prev => ({ ...prev, ...patch }));
    };

    return (
        <ShopContext.Provider value={{
            user,
            cart,
            shopSettings,
            isLoading,
            login,
            logout,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            clearCart,
            updateShopSettings
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error('useShop must be used within a ShopProvider');
    return context;
};
