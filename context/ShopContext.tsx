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

    // Load shop configuration from shops-config.json, then override from backend if available
    useEffect(() => {
        fetch('/shops-config.json')
            .then(res => res.json())
            .then(rawConfig => {
                const envShopId = import.meta.env.VITE_SHOP_ID;
                const config = (() => {
                    if (rawConfig && typeof rawConfig === 'object' && 'shopId' in rawConfig) {
                        return rawConfig;
                    }
                    if (envShopId && rawConfig && typeof rawConfig === 'object' && envShopId in rawConfig) {
                        return rawConfig[envShopId];
                    }
                    if (rawConfig && typeof rawConfig === 'object' && 'default' in rawConfig) {
                        return rawConfig.default;
                    }
                    if (rawConfig && typeof rawConfig === 'object') {
                        const values = Object.values(rawConfig);
                        const firstShopLike = values.find(v => v && typeof v === 'object' && 'shopId' in (v as any));
                        if (firstShopLike) return firstShopLike;
                    }
                    return rawConfig;
                })();

                setShopSettings({
                    shopName: config?.shopName || 'منصة قات شوب',
                    logo: config?.logo || 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
                    deliveryFee: config?.deliveryFee || 1000,
                });

                // Save full config to localStorage for features access
                localStorage.setItem('shopConfig', JSON.stringify(config));

                // Apply theme colors
                if (config.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
                }
                if (config.secondaryColor) {
                    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
                }

                document.title = config?.shopName || 'منصة قات شوب';
            })
            .catch(err => console.error('Failed to load shop config:', err));
    }, []);

    // Try to load dynamic settings from backend
    useEffect(() => {
        const envShopId = import.meta.env.VITE_SHOP_ID;
        const tryLoad = async () => {
            try {
                if (envShopId) {
                    const res = await api.get(`/shops/${envShopId}/settings`);
                    const cfg = res.data;
                    localStorage.setItem('shopConfig', JSON.stringify({ ...(JSON.parse(localStorage.getItem('shopConfig') || '{}')), ...cfg }));
                    setShopSettings({
                        shopName: cfg.shopName || shopSettings.shopName,
                        logo: cfg.logo || shopSettings.logo,
                        deliveryFee: typeof cfg.deliveryFee === 'number' ? cfg.deliveryFee : shopSettings.deliveryFee,
                    });
                    if (cfg.primaryColor) {
                        document.documentElement.style.setProperty('--primary-color', cfg.primaryColor);
                    }
                    if (cfg.secondaryColor) {
                        document.documentElement.style.setProperty('--secondary-color', cfg.secondaryColor);
                    }
                    if (cfg.shopName) {
                        document.title = cfg.shopName;
                    }
                }
            } catch (e) {
                // ignore if backend not available
            }
        };
        tryLoad();
    }, []);

    // Init
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

            // 2. Load Cart
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
        try {
            const currentStr = localStorage.getItem('shopConfig');
            const current = currentStr ? JSON.parse(currentStr) : {};
            const next = {
                ...current,
                shopName: patch.shopName ?? current.shopName,
                logo: patch.logo ?? current.logo,
                deliveryFee: patch.deliveryFee ?? current.deliveryFee,
                primaryColor: patch.primaryColor ?? current.primaryColor,
                secondaryColor: patch.secondaryColor ?? current.secondaryColor,
                features: { ...(current.features || {}), ...(patch.features || {}) },
            };
            localStorage.setItem('shopConfig', JSON.stringify(next));

            setShopSettings({
                shopName: next.shopName || shopSettings.shopName,
                logo: next.logo || shopSettings.logo,
                deliveryFee: typeof next.deliveryFee === 'number' ? next.deliveryFee : shopSettings.deliveryFee,
            });

            if (next.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', next.primaryColor);
            }
            if (next.secondaryColor) {
                document.documentElement.style.setProperty('--secondary-color', next.secondaryColor);
            }
            if (next.shopName) {
                document.title = next.shopName;
            }
        } catch (e) {
            console.error('Failed to update shop settings', e);
        }
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
