import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { Button } from '../components/Button';
import { ReviewSection } from '../components/ReviewSection';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Skeleton } from '../components/Skeleton';

interface ProductDetailsProps {
  // product prop is removed, we fetch by ID
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onBack, onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error("Failed to load product", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-6 pt-20"><Skeleton className="h-64 rounded-3xl mb-4" /><Skeleton className="h-8 w-2/3 mb-2" /><Skeleton className="h-4 w-1/3" /></div>;
  }

  if (!product) {
    return <div className="text-center pt-20">المنتج غير موجود</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col relative pb-32">
      {/* Image Header */}
      <div className="relative h-72">
        <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" fetchPriority="low" />
        <button onClick={onBack} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-md z-10">
          <ArrowRight size={24} className="text-gray-800" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-6 bg-white rounded-t-3xl p-6 shadow-xl z-0 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md mt-1 inline-block">
              {product.category}
            </span>
          </div>
          <span className="text-xl font-bold text-green-600">{Number(product.price).toLocaleString()} ر.ي</span>
        </div>

        <h3 className="font-bold text-gray-800 mb-2 mt-4">الوصف</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* Recommendations */}
        <ProductRecommendations
          productId={product.id}
          onProductClick={(p) => navigate(`/product/${p.id}`)}
        />
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <Button fullWidth onClick={() => onAddToCart(product)} className="py-4 text-lg shadow-green-600/30">
            <ShoppingCart size={20} className="ml-2" />
            أضف إلى السلة
          </Button>
        </div>
      </div>
    </div>
  );
};
