import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { echo } from '../services/echo';

interface OrderStatus {
    id: string;
    status: string;
    note: string | null;
    created_at: string;
    updated_by: {
        name: string;
    } | null;
}

interface DeliveryPerson {
    id: string;
    name: string;
    phone: string;
    status: string;
}

interface Order {
    id: string;
    tracking_number: string;
    status: string;
    total: number;
    delivery_address: string;
    estimated_delivery_time: string | null;
    delivery_fee: number;
    created_at: string;
    status_history: OrderStatus[];
    delivery_person: DeliveryPerson | null;
    shop: {
        name: string;
    };
}

export const useOrderTracking = (trackingNumber: string) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!trackingNumber) return;

        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/track/${trackingNumber}`);
                setOrder(res.data);
                setError(null);
            } catch (err: any) {
                try {
                    const byId = await api.get(`/orders/${trackingNumber}`);
                    const tn = byId.data?.tracking_number;
                    if (tn) {
                        const res2 = await api.get(`/orders/track/${tn}`);
                        setOrder(res2.data);
                        setError(null);
                    } else {
                        setError(err.response?.data?.message || 'فشل تحميل الطلب');
                    }
                } catch (err2: any) {
                    console.error('Failed to fetch order:', err2);
                    setError(err2.response?.data?.message || 'فشل تحميل الطلب');
                }
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchOrder();

        // Poll every 10 seconds for updates
        const interval = setInterval(fetchOrder, 10000);

        return () => clearInterval(interval);
    }, [trackingNumber]);

    useEffect(() => {
        if (!order?.shop || !order?.tracking_number) return;
        const userChannelName = `orders.${(order as any).user_id || ''}`;
        if (!userChannelName) return;

        const channel = echo.channel(userChannelName);
        channel.listen('.order.status.updated', (e: any) => {
            if (e?.order?.tracking_number === order.tracking_number) {
                setOrder(e.order);
            }
        });

        return () => {
            echo.leaveChannel(userChannelName);
        };
    }, [order?.tracking_number, (order as any)?.user_id]);

    return { order, loading, error };
};
