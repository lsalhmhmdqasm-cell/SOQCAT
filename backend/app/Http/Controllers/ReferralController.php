<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    // Get my referral info
    public function index(Request $request)
    {
        $user = $request->user();

        // Find existing referral record where I am the referrer (to get my code if stored there)
        // Actually, referral code usually belongs to the user or is generated on fly
        // Let's assume user.id is the code or we store it.
        // Simplified: User ID is the code for now, or we generate a hash.
        $referralCode = strtoupper(Str::slug($user->name).'-'.$user->id);

        $referrals = $user->sentReferrals()->with('referred')->latest()->get();

        return response()->json([
            'referral_code' => $referralCode,
            'referrals' => $referrals,
            'total_earned' => $referrals->where('status', 'rewarded')->sum('referrer_reward'),
        ]);
    }

    // Process a referral code (when new user signs up or enters code)
    // This might be called during registration or separately
    public function store(Request $request)
    {
        $request->validate([
            'referral_code' => 'required|string',
        ]);

        // Logic to parse code and find referrer
        // Assuming format NAME-ID
        $parts = explode('-', $request->referral_code);
        $referrerId = end($parts);

        if (! is_numeric($referrerId)) {
            return response()->json(['message' => 'Invalid code'], 422);
        }

        $referrer = User::find($referrerId);
        if (! $referrer || $referrer->id === $request->user()->id) {
            return response()->json(['message' => 'Invalid referrer'], 422);
        }

        // Check if already referred
        if (Referral::where('referred_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Already referred'], 422);
        }

        $referral = Referral::create([
            'shop_id' => $request->user()->shop_id,
            'referrer_id' => $referrer->id,
            'referred_id' => $request->user()->id,
            'referral_code' => $request->referral_code,
            'status' => 'pending',
            'referrer_reward' => 50, // Default 50 points
            'referred_reward' => 20,  // Default 20 points
        ]);

        return response()->json(['message' => 'Referral applied successfully', 'referral' => $referral]);
    }
}
