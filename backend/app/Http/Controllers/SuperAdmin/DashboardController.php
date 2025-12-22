<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\SupportTicket;
use App\Models\SystemUpdate;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Check if user is super admin
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_clients' => Client::count(),
            'active_clients' => Client::where('status', 'active')->count(),
            'trial_clients' => Client::where('status', 'trial')->count(),
            'suspended_clients' => Client::where('status', 'suspended')->count(),
            'expired_clients' => Client::where('status', 'expired')->count(),
            
            'open_tickets' => SupportTicket::whereIn('status', ['open', 'in_progress'])->count(),
            'urgent_tickets' => SupportTicket::where('priority', 'urgent')->where('status', '!=', 'closed')->count(),
            
            'pending_updates' => SystemUpdate::whereDate('release_date', '<=', now())->count(),
            
            'monthly_revenue' => $this->calculateMonthlyRevenue(),
            'total_orders_today' => Order::whereDate('created_at', today())->count(),
        ];

        // Recent activity
        $recent_clients = Client::latest()->take(5)->get();
        $recent_tickets = SupportTicket::with('client')->latest()->take(5)->get();

        return response()->json([
            'stats' => $stats,
            'recent_clients' => $recent_clients,
            'recent_tickets' => $recent_tickets
        ]);
    }

    private function calculateMonthlyRevenue()
    {
        // Calculate from subscriptions
        return Client::where('status', 'active')
            ->join('subscriptions', 'clients.id', '=', 'subscriptions.client_id')
            ->where('subscriptions.status', 'active')
            ->sum('subscriptions.price');
    }
}
