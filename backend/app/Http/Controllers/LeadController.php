<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lead;

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
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'plan_type' => 'required|string|in:basic,premium,enterprise',
        ]);

        $lead = Lead::create([
            'shop_name' => $validated['shop_name'],
            'phone' => $validated['phone'],
            'plan_type' => $validated['plan_type'],
            'status' => 'new',
        ]);

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
