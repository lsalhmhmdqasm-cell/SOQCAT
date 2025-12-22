import React, { useState, useEffect } from 'react';
import { ArrowRight, Bell, Check, Package, Gift, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    if (notif.type === 'order' && notif.related_id) {
      navigate(`/track/${notif.related_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold">الإشعارات</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-8">جاري التحميل...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${notif.is_read
                  ? 'bg-white border-gray-100'
                  : 'bg-green-50 border-green-200 shadow-sm'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${notif.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'promotion' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {notif.type === 'order' ? <Package size={18} /> :
                    notif.type === 'promotion' ? <Gift size={18} /> :
                      <AlertCircle size={18} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{notif.body}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleString('ar-YE')}
                  </span>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};