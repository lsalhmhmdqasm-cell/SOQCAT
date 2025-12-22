import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, AppSettings } from '../types';
import { api } from '../services/api';

interface ShopContextType {
    shopSettings: AppSettings;
    user: User | null;
    cart: CartItem[];
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    addToCart: (product: Product) => void;
    updateCartQuantity: (productId: string, delta: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState<AppSettings>({
        shopName: 'سوق بن عبود للقات',
        logo: 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
        deliveryFee: 1000,
    });

    // Load shop configuration from shops-config.json
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
                    shopName: config?.shopName || 'سوق بن عبود للقات',
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

                // Update page title
                document.title = config?.shopName || 'متاجر بن عبود للقات';
            })
            .catch(err => console.error('Failed to load shop config:', err));
    }, []);

    // Init
    useEffect(() => {
        const initApp = async () => {
            // 1. Load User
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user'); // Basic persistence

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                // Optional: Verify token with /me endpoint
                try {
                    const res = await api.get('/me');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (e) {
                    console.error('Session expired');
                    logout();
                }
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
    const login = (userData: User, token: string) => {
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
            clearCart
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
