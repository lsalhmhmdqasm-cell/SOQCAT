import { useShop } from '../context/ShopContext';

/**
 * Hook للتحقق من الميزات المفعلة للمحل
 * 
 * الاستخدام:
 * const { hasFeature, getFeatureValue } = useFeatures();
 * 
 * if (hasFeature('enableReviews')) {
 *   // عرض نظام التقييمات
 * }
 */

export interface ShopFeatures {
    enableDelivery: boolean;
    enablePaymentOnline: boolean;
    enablePaymentCash: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNotifications: boolean;
    enableChat: boolean;
    enableLoyaltyPoints: boolean;
    enableCoupons: boolean;
    enableMultipleAddresses: boolean;
    enableOrderTracking: boolean;
    enableScheduledDelivery: boolean;
    enableProductRecommendations: boolean;
    enableSocialShare: boolean;
    enableReferralProgram: boolean;
    maxProductsPerOrder: number;
    maxOrdersPerDay: number;
    enableCustomCategories: boolean;
    enableFlashSales: boolean;
    enableBulkOrders: boolean;
}

const DEFAULT_FEATURES: ShopFeatures = {
    enableDelivery: true,
    enablePaymentOnline: false,
    enablePaymentCash: true,
    enableReviews: false,
    enableWishlist: true,
    enableNotifications: false,
    enableChat: false,
    enableLoyaltyPoints: false,
    enableCoupons: false,
    enableMultipleAddresses: false,
    enableOrderTracking: true,
    enableScheduledDelivery: false,
    enableProductRecommendations: false,
    enableSocialShare: false,
    enableReferralProgram: false,
    maxProductsPerOrder: 20,
    maxOrdersPerDay: 50,
    enableCustomCategories: false,
    enableFlashSales: false,
    enableBulkOrders: false
};

export const useFeatures = () => {
    const { shopSettings } = useShop();

    // تحميل الميزات من localStorage أو استخدام الافتراضية
    const loadFeatures = (): ShopFeatures => {
        try {
            const configStr = localStorage.getItem('shopConfig');
            if (configStr) {
                const config = JSON.parse(configStr);
                return { ...DEFAULT_FEATURES, ...config.features };
            }
        } catch (error) {
            console.error('Failed to load features:', error);
        }
        return DEFAULT_FEATURES;
    };

    const features = loadFeatures();

    /**
     * التحقق من تفعيل ميزة معينة
     */
    const hasFeature = (featureName: keyof ShopFeatures): boolean => {
        const value = features[featureName];
        return typeof value === 'boolean' ? value : false;
    };

    /**
     * الحصول على قيمة ميزة (للميزات الرقمية)
     */
    const getFeatureValue = (featureName: keyof ShopFeatures): any => {
        return features[featureName];
    };

    /**
     * التحقق من تجاوز الحد الأقصى
     */
    const canAddMoreProducts = (currentCount: number): boolean => {
        return currentCount < features.maxProductsPerOrder;
    };

    const canPlaceMoreOrders = (todayOrdersCount: number): boolean => {
        return todayOrdersCount < features.maxOrdersPerDay;
    };

    return {
        features,
        hasFeature,
        getFeatureValue,
        canAddMoreProducts,
        canPlaceMoreOrders
    };
};
