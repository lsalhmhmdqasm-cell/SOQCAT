<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusUpdated;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $receiptPath = null;
            if ($request->hasFile('payment_receipt')) {
                $file = $request->file('payment_receipt');
                $filename = 'receipt_'.time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
                $receiptsDir = public_path('uploads/receipts');
                if (! File::exists($receiptsDir)) {
                    File::makeDirectory($receiptsDir, 0775, true, true);
                }
                $file->move($receiptsDir, $filename);
                $receiptPath = '/uploads/receipts/'.$filename;
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

            NotificationController::create(
                $request->user()->id,
                'تم إنشاء طلبك',
                'رقم التتبع: '.$order->tracking_number,
                'order',
                $order->tracking_number
            );

            return response()->json([
                'message' => 'Order created',
                'order' => $order->load('items'),
                'tracking_number' => $order->tracking_number,
            ], 201);
        });
    }

    public function index(Request $request)
    {
        return $request->user()->orders()->with('items.product')->latest()->get();
    }

    public function show(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $this->authorize('view', $order);

        return $order->load('items.product');
    }

    /**
     * Track order by tracking number
     */
    public function track(Request $request, $trackingNumber)
    {
        $shop = $request->shop;
        
        $query = Order::where('tracking_number', $trackingNumber)
            ->with(['statusHistory.updatedBy', 'deliveryPerson', 'shop']);
            
        // If accessed via shop domain, restrict to that shop
        if ($shop) {
            $query->where('shop_id', $shop->id);
        }

        $order = $query->firstOrFail();

        $this->authorize('view', $order);

        return response()->json($order);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled',
            'note' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);

        $this->authorize('update', $order);

        $order->updateStatus($request->status, $request->note, $request->user()->id);

        event(new OrderStatusUpdated($order));

        $statusLabel = match ($request->status) {
            'pending' => 'قيد الانتظار',
            'confirmed' => 'تم التأكيد',
            'preparing' => 'قيد التحضير',
            'out_for_delivery' => 'في الطريق',
            'delivered' => 'تم التوصيل',
            'cancelled' => 'ملغي',
        };

        NotificationController::create(
            $order->user_id,
            'تم تحديث حالة طلبك',
            'الحالة الحالية: '.$statusLabel.' - رقم التتبع: '.$order->tracking_number,
            'order',
            $order->tracking_number
        );

        return response()->json($order->load('statusHistory'));
    }

    /**
     * Assign delivery person to order
     */
    public function assignDelivery(Request $request, $id)
    {
        $request->validate([
            'delivery_person_id' => [
                'required',
                'integer',
                Rule::exists('delivery_persons', 'id')->where(fn ($q) => $q->where('shop_id', $request->user()->shop_id)),
            ],
            'estimated_delivery_time' => 'nullable|date',
        ]);

        $order = Order::findOrFail($id);

        $this->authorize('update', $order);

        $order->update([
            'delivery_person_id' => $request->delivery_person_id,
            'estimated_delivery_time' => $request->estimated_delivery_time,
            'status' => 'out_for_delivery',
        ]);

        $order->updateStatus('out_for_delivery', 'تم تعيين مندوب التوصيل', $request->user()->id);

        event(new OrderStatusUpdated($order));

        $driverName = optional($order->deliveryPerson)->name;
        $message = $driverName ? ('مندوبك: '.$driverName) : 'تم تعيين مندوب التوصيل';
        if ($request->estimated_delivery_time) {
            $message .= ' | وقت متوقع: '.$request->estimated_delivery_time;
        }
        NotificationController::create(
            $order->user_id,
            'طلبك في الطريق',
            $message.' - رقم التتبع: '.$order->tracking_number,
            'order',
            $order->tracking_number
        );

        return response()->json($order->load(['deliveryPerson', 'statusHistory']));
    }

    // Shop Admin: View Orders for their shop
    public function shopOrders(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return Order::where('shop_id', $request->user()->shop_id)
            ->with(['items.product', 'user', 'deliveryPerson'])
            ->latest()
            ->get();
    }
}
