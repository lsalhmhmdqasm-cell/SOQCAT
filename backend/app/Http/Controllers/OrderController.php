<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $receiptPath = null;
            if ($request->hasFile('payment_receipt')) {
                $file = $request->file('payment_receipt');
                $filename = 'receipt_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/receipts'), $filename);
                $receiptPath = '/uploads/receipts/' . $filename;
            }

            $order = Order::create([
                'shop_id' => $validated['shop_id'],
                'user_id' => $request->user()->id,
                'total' => $validated['total'],
                'status' => 'pending',
                'delivery_address' => $validated['delivery_address'],
                'payment_method' => $validated['payment_method'],
                'payment_receipt' => $receiptPath,
                'payment_reference' => $validated['payment_reference'] ?? null,
                'payment_status' => $validated['payment_method'] === 'cash_on_delivery' ? 'pending' : 'pending',
                // 'payment_method_id' => $validated['payment_method_id'] ?? null, // Removed as it was not in local migration schema but good to have conceptually
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
            
            $statusNote = 'تم إنشاء الطلب';
            if ($validated['payment_method'] !== 'cash_on_delivery') {
                $statusNote .= ' - بانتظار تأكيد الدفع';
            }
            
            // Create initial status history
            $order->updateStatus('pending', $statusNote, $request->user()->id);

            return response()->json([
                'message' => 'Order created',
                'order' => $order->load('items'),
                'tracking_number' => $order->tracking_number
            ], 201);
        });
    }

    public function index(Request $request)
    {
        return $request->user()->orders()->with('items.product')->latest()->get();
    }
    
    public function show(Request $request, $id)
    {
        return $request->user()->orders()->with('items.product')->findOrFail($id);
    }

    /**
     * Track order by tracking number
     */
    public function track($trackingNumber)
    {
        $order = Order::where('tracking_number', $trackingNumber)
            ->with(['statusHistory.updatedBy', 'deliveryPerson', 'shop'])
            ->firstOrFail();
        
        return response()->json($order);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled',
            'note' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // Check authorization
        if ($request->user()->role !== 'shop_admin' || $order->shop_id !== $request->user()->shop_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $order->updateStatus($request->status, $request->note, $request->user()->id);
        
        return response()->json($order->load('statusHistory'));
    }

    /**
     * Assign delivery person to order
     */
    public function assignDelivery(Request $request, $id)
    {
        $request->validate([
            'delivery_person_id' => 'required|exists:delivery_persons,id',
            'estimated_delivery_time' => 'nullable|date'
        ]);
        
        $order = Order::findOrFail($id);
        
        // Check authorization
        if ($request->user()->role !== 'shop_admin' || $order->shop_id !== $request->user()->shop_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $order->update([
            'delivery_person_id' => $request->delivery_person_id,
            'estimated_delivery_time' => $request->estimated_delivery_time,
            'status' => 'out_for_delivery'
        ]);
        
        $order->updateStatus('out_for_delivery', 'تم تعيين مندوب التوصيل', $request->user()->id);
        
        return response()->json($order->load(['deliveryPerson', 'statusHistory']));
    }

    // Shop Admin: View Orders for their shop
    public function shopOrders(Request $request)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return Order::where('shop_id', $request->user()->shop_id)
                    ->with(['items.product', 'user', 'deliveryPerson'])
                    ->latest()
                    ->get();
    }

    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $order = Order::where('shop_id', $request->user()->shop_id)->findOrFail($id);
        
        $request->validate(['status' => 'required|string']);
        
        $order->update(['status' => $request->status]);
        
        return response()->json($order);
    }
}
