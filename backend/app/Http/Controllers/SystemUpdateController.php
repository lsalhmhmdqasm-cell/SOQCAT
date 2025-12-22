<?php

namespace App\Http\Controllers;

use App\Models\SystemUpdate;
use Illuminate\Http\Request;

class SystemUpdateController extends Controller
{
    public function index()
    {
        return SystemUpdate::latest()->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'version' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
            'type' => 'required|in:feature,bugfix,security,maintenance',
            'release_date' => 'required|date',
        ]);

        $update = SystemUpdate::create($validated);

        return response()->json($update, 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $update = SystemUpdate::findOrFail($id);
        $update->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
