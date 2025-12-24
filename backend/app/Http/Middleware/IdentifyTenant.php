<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Identify Host
        $host = $request->getHost();
        
        // Remove port if exists
        $host = preg_replace('/:\d+$/', '', $host);

        // 2. Check for Custom Domain or Subdomain
        // Assuming our main domain is qatshop.com (or localhost for dev)
        // If host is 'shop-1.qatshop.com', we extract shop-1
        // For production readiness, we look up the 'domain' field in 'clients' table linked to 'shops'
        // But for now, let's assume we store the full domain in the shop or client record, OR use the subdomain convention.

        // Let's look for the shop by domain mapping
        // We need to add a 'domain' column to shops or use the Client model. 
        // Based on previous file reads, Client has 'domain'. Let's link Shop -> Client -> Domain
        
        $shop = null;

        // Dev Mode / Localhost Fallback:
        // If X-Shop-Id is present AND we are in local environment, strictly validate it exists.
        // BUT for Production, we MUST prefer Domain.
        
        if (app()->environment('local') && $request->hasHeader('X-Shop-Id')) {
             $shop = Shop::find($request->header('X-Shop-Id'));
        } else {
             // Production Logic: Find Shop by Domain
             // Join with clients table to find the shop by domain
             $shop = Shop::whereHas('client', function($q) use ($host) {
                 $q->where('domain', $host);
             })->first();
             
             // Fallback for subdomains during dev/testing (e.g. shop-1.localhost)
             if (!$shop) {
                 // Try to parse subdomain
                 $parts = explode('.', $host);
                 if (count($parts) > 0) {
                     $subdomain = $parts[0];
                     if (str_starts_with($subdomain, 'shop-')) {
                         $id = str_replace('shop-', '', $subdomain);
                         if (is_numeric($id)) {
                             $shop = Shop::find($id);
                         }
                     }
                 }
             }
        }

        // 3. Bind to Request
        if ($shop) {
            // Check if shop is active
            if ($shop->status !== 'active') {
                return response()->json(['message' => 'This shop is currently unavailable.'], 503);
            }

            $request->merge(['shop' => $shop]);
            $request->attributes->add(['shop' => $shop]);
            
            // Set Shop ID for global usage if needed
            app()->instance('current_shop', $shop);
        }

        return $next($request);
    }
}
