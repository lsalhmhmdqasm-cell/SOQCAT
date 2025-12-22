<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product
     */
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user:id,name')
            ->latest()
            ->get();
        
        $avgRating = $reviews->avg('rating');
        $ratingCounts = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];
        
        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($avgRating, 1),
            'total_reviews' => $reviews->count(),
            'rating_counts' => $ratingCounts
        ]);
    }

    /**
     * Store or update a review
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500'
        ]);
        
        $review = Review::updateOrCreate(
            [
                'product_id' => $request->product_id,
                'user_id' => $request->user()->id
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment
            ]
        );
        
        return response()->json([
            'message' => 'تم إضافة التقييم بنجاح',
            'review' => $review->load('user:id,name')
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy($id)
    {
        $review = Review::where('id', $id)
            ->where('user_id', request()->user()->id)
            ->firstOrFail();
        
        $review->delete();
        
        return response()->json(['message' => 'تم حذف التقييم']);
    }
}
