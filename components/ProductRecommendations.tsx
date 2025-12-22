import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { ChevronLeft } from 'lucide-react';

interface ProductRecommendationsProps {
    productId: string;
    onProductClick: (product: Product) => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
    productId,
    onProductClick
}) => {
    const [related, setRelated] = useState<Product[]>([]);
    const [popular, setPopular] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get(`/products/${productId}/recommendations`);
                setRelated(res.data.related);
                setPopular(res.data.popular);
            } catch (error) {
                console.error('Failed to load recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [productId]);

    if (loading) return null;

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
        <div
            onClick={() => onProductClick(product)}
            className="flex-shrink-0 w-32 cursor-pointer"
        >
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                />
                <div className="p-2">
                    <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm font-bold text-green-600">{product.price.toLocaleString()} ر.ي</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 mt-6">
            {/* Related Products */}
            {related.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">منتجات مشابهة</h3>
                        <ChevronLeft size={20} className="text-gray-400" />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {related.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Products */}
            {popular.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">الأكثر مبيعاً</h3>
                        <ChevronLeft size={20} className="text-gray-400" />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {popular.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
