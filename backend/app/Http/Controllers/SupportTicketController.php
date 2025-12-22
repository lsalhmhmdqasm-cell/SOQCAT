<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\TicketReply;

class SupportTicketController extends Controller
{
    // Super Admin: Get all tickets
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
             // If shop admin, get their own tickets
             if ($request->user()->role === 'shop_admin') {
                 return SupportTicket::where('shop_id', $request->user()->shop_id)->with('replies')->latest()->get();
             }
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        return SupportTicket::with(['shop', 'replies'])->latest()->get();
    }

    public function store(Request $request)
    {
        // Shop Admin creates a ticket
        $validated = $request->validate([
            'subject' => 'required|string',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent'
        ]);

        $ticket = SupportTicket::create([
            'shop_id' => $request->user()->shop_id,
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'priority' => $validated['priority'],
            'status' => 'open'
        ]);

        return response()->json($ticket, 201);
    }

    public function reply(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        
        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_admin_reply' => $request->user()->role === 'super_admin'
        ]);

        if ($request->user()->role === 'super_admin') {
            $ticket->update(['status' => 'answered']);
        } else {
             $ticket->update(['status' => 'customer-reply']);
        }

        return response()->json($reply);
    }
    
    public function close(Request $request, $id)
    {
         $ticket = SupportTicket::findOrFail($id);
         $ticket->update(['status' => 'closed']);
         return response()->json($ticket);
    }
}
