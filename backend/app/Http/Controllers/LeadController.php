<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user() || $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $query = Lead::query()->orderByDesc('created_at');
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('q') && $request->q) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('shop_name', 'like', '%'.$q.'%')
                    ->orWhere('phone', 'like', '%'.$q.'%');
            });
        }
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = $perPage > 50 ? 50 : ($perPage < 5 ? 10 : $perPage);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        if ($request->filled('honeypot')) {
            return response()->json(['message' => 'Spam detected'], 400);
        }

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^(?:\\+?967)?(7\\d{8}|05\\d{7})$/',
            ],
            'plan_type' => 'required|string|in:basic,premium,enterprise',
            'honeypot' => 'nullable|string',
            'recaptcha_token' => 'nullable|string',
        ]);

        $recaptchaSecret = config('services.recaptcha.secret');
        if ($recaptchaSecret && ! empty($validated['recaptcha_token'])) {
            try {
                $resp = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $recaptchaSecret,
                    'response' => $validated['recaptcha_token'],
                    'remoteip' => $request->ip(),
                ])->json();
                if (! ($resp['success'] ?? false)) {
                    return response()->json(['message' => 'recaptcha_failed'], 422);
                }
            } catch (\Throwable $e) {
            }
        }

        $lead = Lead::create([
            'shop_name' => $validated['shop_name'],
            'phone' => $validated['phone'],
            'plan_type' => $validated['plan_type'],
            'status' => 'new',
        ]);

        try {
            $superAdmins = User::where('role', 'super_admin')->get(['id', 'name']);
            foreach ($superAdmins as $admin) {
                \App\Http\Controllers\NotificationController::create(
                    $admin->id,
                    'طلب تواصل جديد',
                    "متجر: {$lead->shop_name} | هاتف: {$lead->phone} | باقة: {$lead->plan_type}",
                    'lead',
                    (string) $lead->id
                );
            }
        } catch (\Throwable $e) {
        }

        return response()->json($lead, 201);
    }

    public function update(Request $request, $id)
    {
        if (! $request->user() || $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'status' => 'nullable|string|in:new,contacted,qualified,rejected',
            'notes' => 'nullable|string',
        ]);
        $lead = Lead::findOrFail($id);
        if (array_key_exists('status', $validated)) {
            $lead->status = $validated['status'] ?? $lead->status;
        }
        if (array_key_exists('notes', $validated)) {
            $lead->notes = $validated['notes'] ?? $lead->notes;
        }
        $lead->save();

        return response()->json($lead);
    }
}
