<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()?->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Shop::query()
            ->select(['id', 'name'])
            ->orderByDesc('id')
            ->get();
    }

    public function config(Request $request)
    {
        $shop = $request->shop; // Injected by IdentifyTenant middleware

        if (! $shop) {
            return response()->json([
                'mode' => 'platform',
                'shopId' => null,
                'shopName' => 'منصة قات شوب',
                'logo' => 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
                'primaryColor' => '#10b981',
                'secondaryColor' => '#059669',
                'deliveryFee' => 1000,
                'features' => [
                    'web' => true,
                    'android' => false,
                    'ios' => false,
                ],
            ]);
        }

        $client = Client::where('shop_id', $shop->id)->first();

        return response()->json([
            'shopId' => $shop->id, // Important for Frontend Context
            'shopName' => $client?->shop_name ?? $shop->name,
            'logo' => $client?->logo_url ?? $shop->logo ?? '',
            'primaryColor' => $client?->primary_color ?? '#10b981',
            'secondaryColor' => $client?->secondary_color ?? '#059669',
            'deliveryFee' => (int) ($shop->delivery_fee ?? 1000),
            'features' => [
                'web' => $shop->enable_web,
                'android' => $shop->enable_android,
                'ios' => $shop->enable_ios,
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Only Super Admin should do this
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|string', // URL or path
        ]);

        $shop = Shop::create($validated);

        return response()->json($shop, 201);
    }

    public function show($id)
    {
        return Shop::with(['products' => fn ($q) => $q->where('is_active', true)])->findOrFail($id);
    }

    public function settings(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $shopId = $request->user()->shop_id;
        $shop = Shop::findOrFail($shopId);
        $client = Client::where('shop_id', $shopId)->first();

        return response()->json([
            'shopName' => $client?->shop_name ?? $shop->name,
            'logo' => $client?->logo_url ?? $shop->logo ?? '',
            'primaryColor' => $client?->primary_color ?? '#10b981',
            'secondaryColor' => $client?->secondary_color ?? '#059669',
            'deliveryFee' => (int) ($shop->delivery_fee ?? 1000),
        ]);
    }

    public function updateSettings(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shopId = $request->user()->shop_id;
        $validated = $request->validate([
            'shopName' => 'sometimes|string|max:255',
            'logo' => 'sometimes|nullable|string|max:500',
            'primaryColor' => ['sometimes', 'string', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'secondaryColor' => ['sometimes', 'string', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'deliveryFee' => 'sometimes|integer|min:0|max:100000',
        ]);

        $shop = Shop::findOrFail($shopId);
        $client = Client::where('shop_id', $shopId)->first();

        if (array_key_exists('shopName', $validated)) {
            $shop->name = $validated['shopName'];
            if ($client) {
                $client->shop_name = $validated['shopName'];
            }
        }
        if (array_key_exists('logo', $validated)) {
            $shop->logo = $validated['logo'];
            if ($client) {
                $client->logo_url = $validated['logo'];
            }
        }
        if ($client) {
            if (array_key_exists('primaryColor', $validated)) {
                $client->primary_color = $validated['primaryColor'];
            }
            if (array_key_exists('secondaryColor', $validated)) {
                $client->secondary_color = $validated['secondaryColor'];
            }
            $client->save();
        }
        if (array_key_exists('deliveryFee', $validated)) {
            $shop->delivery_fee = (int) $validated['deliveryFee'];
        }
        $shop->save();

        return $this->settings($request);
    }

    public function settingsPublic($id)
    {
        $shop = Shop::findOrFail($id);
        $client = Client::where('shop_id', $shop->id)->first();

        return response()->json([
            'shopName' => $client?->shop_name ?? $shop->name,
            'logo' => $client?->logo_url ?? $shop->logo ?? '',
            'primaryColor' => $client?->primary_color ?? '#10b981',
            'secondaryColor' => $client?->secondary_color ?? '#059669',
            'deliveryFee' => (int) ($shop->delivery_fee ?? 1000),
        ]);
    }
}
