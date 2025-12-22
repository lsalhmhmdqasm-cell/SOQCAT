import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { api } from '../services/api';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: {
        name: string;
    };
}

interface ReviewSectionProps {
    productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);

    const [showAddReview, setShowAddReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/products/${productId}/reviews`);
            setReviews(res.data.reviews);
            setAverageRating(res.data.average_rating);
            setTotalReviews(res.data.total_reviews);
            setRatingCounts(res.data.rating_counts);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/reviews', {
                product_id: productId,
                rating: newRating,
                comment: newComment
            });

            setShowAddReview(false);
            setNewComment('');
            setNewRating(5);
            fetchReviews();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('فشل إضافة التقييم. يرجى المحاولة مرة أخرى.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, size: number = 16) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-400">جاري التحميل...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg">التقييمات والمراجعات</h3>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            {renderStars(Math.round(averageRating), 20)}
                            <span className="font-bold text-lg">{averageRating}</span>
                            <span className="text-sm text-gray-500">({totalReviews} تقييم)</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowAddReview(!showAddReview)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                >
                    {showAddReview ? 'إلغاء' : 'أضف تقييم'}
                </button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">التقييم</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        size={32}
                                        className={star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">التعليق (اختياري)</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            rows={3}
                            maxLength={500}
                            placeholder="شاركنا رأيك في المنتج..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                        {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-sm">{review.user.name}</p>
                                    {renderStars(review.rating)}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString('ar-YE')}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
