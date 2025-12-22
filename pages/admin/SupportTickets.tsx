import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { MessageSquare, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface Ticket {
    id: number;
    subject: string;
    message: string;
    status: 'open' | 'answered' | 'customer-reply' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    shop?: { name: string };
    replies: Reply[];
}

interface Reply {
    id: number;
    user_id: string; // or number depending on backend
    message: string;
    is_admin_reply: boolean;
    created_at: string;
}

export const SupportTickets = () => {
    const { user } = useShop();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Ticket Form (for Shop Admin)
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('medium');

    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tickets', { subject, message, priority });
            setIsCreateModalOpen(false);
            setSubject('');
            setMessage('');
            fetchTickets();
        } catch (error) {
            console.error(error);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !replyMessage.trim()) return;

        try {
            await api.post(`/tickets/${selectedTicket.id}/reply`, { message: replyMessage });
            setReplyMessage('');
            // Refresh tickets to show new reply
            fetchTickets();
            // Also update selected ticket view ideally, but refetch serves purpose
            // A better way is to append reply locally
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            await api.put(`/tickets/${selectedTicket.id}/close`);
            fetchTickets();
            setSelectedTicket(null);
        } catch (error) {
            console.error(error);
        }
    };

    // Update selected ticket from list when tickets change
    useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [tickets]);

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800">تذاكر الدعم</h2>
                    {!isSuperAdmin && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark">
                            <MessageSquare size={18} />
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">جاري التحميل...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">لا توجد تذاكر دعم</div>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                            ticket.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString('ar-YE')}</span>
                                </div>
                                <h3 className="font-bold text-sm text-gray-800 mb-1 truncate">{ticket.subject}</h3>
                                <p className="text-xs text-gray-500 truncate">{ticket.message}</p>
                                {isSuperAdmin && ticket.shop && (
                                    <p className="text-xs text-blue-600 mt-2 font-medium">{ticket.shop.name}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content (Conversation) */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>#{selectedTicket.id}</span>
                                    <span>•</span>
                                    <span className={`font-bold ${selectedTicket.priority === 'urgent' ? 'text-red-500' :
                                            selectedTicket.priority === 'high' ? 'text-orange-500' : 'text-blue-500'
                                        }`}>{selectedTicket.priority.toUpperCase()}</span>
                                </div>
                            </div>
                            {selectedTicket.status !== 'closed' && (
                                <button onClick={handleCloseTicket} className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                                    إغلاق التذكرة
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Original Message */}
                            <div className={`flex ${false ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[80%] bg-white border border-gray-200 p-4 rounded-xl rounded-tl-none shadow-sm">
                                    <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">{new Date(selectedTicket.created_at).toLocaleString('ar-YE')}</span>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((reply) => (
                                <div key={reply.id} className={`flex ${reply.is_admin_reply === isSuperAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-xl shadow-sm ${reply.is_admin_reply === isSuperAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{reply.message}</p>
                                        <span className={`text-xs mt-2 block ${reply.is_admin_reply === isSuperAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(reply.created_at).toLocaleString('ar-YE')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Input */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="bg-white p-4 border-t">
                                <form onSubmit={handleReply} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="اكتب ردك هنا..."
                                        className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={replyMessage}
                                        onChange={e => setReplyMessage(e.target.value)}
                                    />
                                    <Button type="submit" disabled={!replyMessage.trim()}>
                                        <Send size={18} className="ltr:ml-2 rtl:mr-2" />
                                        إرسال
                                    </Button>
                                </form>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={64} className="mb-4 opacity-20" />
                        <p>اختر تذكرة لعرض التفاصيل</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-bold text-xl mb-4">فتح تذكرة جديدة</h3>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الموضوع</label>
                                <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الأولوية</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية</option>
                                    <option value="urgent">طارئة</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الرسالة</label>
                                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 border rounded-lg"></textarea>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button type="button" variant="outline" fullWidth onClick={() => setIsCreateModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" fullWidth>إرسال التذكرة</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
