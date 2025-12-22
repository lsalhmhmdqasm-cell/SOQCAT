import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AlertCircle, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Pagination } from '../../components/Pagination';

interface Ticket {
    id: number;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    client: {
        shop_name: string;
        owner_name: string;
    };
    created_at: string;
}

interface TicketReply {
    id: number;
    user: {
        name: string;
    };
    message: string;
    is_internal: boolean;
    created_at: string;
}

export const SupportTickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        fetchTickets();
    }, [currentPage, statusFilter, priorityFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (priorityFilter !== 'all') params.priority = priorityFilter;

            const res = await api.get('/super-admin/tickets', { params });
            setTickets(res.data.data);
            setTotalPages(res.data.last_page);
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id: number) => {
        try {
            const res = await api.get(`/super-admin/tickets/${id}`);
            setSelectedTicket(res.data);
            setReplies(res.data.replies || []);
        } catch (error) {
            console.error('Failed to load ticket details:', error);
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !replyMessage.trim()) return;
        try {
            await api.post(`/super-admin/tickets/${selectedTicket.id}/reply`, {
                message: replyMessage,
                is_internal: false
            });
            setReplyMessage('');
            fetchTicketDetails(selectedTicket.id);
        } catch (error) {
            alert('فشل إرسال الرد');
        }
    };

    const handleStatusChange = async (ticketId: number, status: string) => {
        try {
            await api.put(`/super-admin/tickets/${ticketId}/status`, { status });
            fetchTickets();
            if (selectedTicket?.id === ticketId) {
                fetchTicketDetails(ticketId);
            }
        } catch (error) {
            alert('فشل تحديث الحالة');
        }
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            urgent: 'bg-red-100 text-red-700'
        };
        const labels = {
            low: 'منخفض',
            medium: 'متوسط',
            high: 'عالي',
            urgent: 'عاجل'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[priority as keyof typeof styles]}`}>
                {labels[priority as keyof typeof labels]}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            open: <Clock size={16} className="text-blue-500" />,
            in_progress: <AlertCircle size={16} className="text-orange-500" />,
            resolved: <CheckCircle size={16} className="text-green-500" />,
            closed: <XCircle size={16} className="text-gray-500" />
        };
        return icons[status as keyof typeof icons];
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">تذاكر الدعم الفني</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tickets List */}
                    <div className="lg:col-span-1">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg mb-2"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="open">مفتوح</option>
                                <option value="in_progress">قيد المعالجة</option>
                                <option value="resolved">محلول</option>
                                <option value="closed">مغلق</option>
                            </select>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="all">جميع الأولويات</option>
                                <option value="urgent">عاجل</option>
                                <option value="high">عالي</option>
                                <option value="medium">متوسط</option>
                                <option value="low">منخفض</option>
                            </select>
                        </div>

                        {/* Tickets */}
                        <div className="space-y-2">
                            {loading ? (
                                <div className="bg-white p-4 rounded-lg text-center">جاري التحميل...</div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => fetchTicketDetails(ticket.id)}
                                        className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition ${selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(ticket.status)}
                                                <h3 className="font-bold text-sm">{ticket.subject}</h3>
                                            </div>
                                            {getPriorityBadge(ticket.priority)}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{ticket.client.shop_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString('ar')}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    {/* Ticket Details */}
                    <div className="lg:col-span-2">
                        {selectedTicket ? (
                            <div className="bg-white rounded-lg shadow-sm">
                                {/* Header */}
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h2>
                                            <p className="text-sm text-gray-600">
                                                المحل: {selectedTicket.client.shop_name} - {selectedTicket.client.owner_name}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {getPriorityBadge(selectedTicket.priority)}
                                        </div>
                                    </div>

                                    {/* Status Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                                        >
                                            قيد المعالجة
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                        >
                                            محلول
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                                        >
                                            إغلاق
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="p-6 border-b bg-gray-50">
                                    <p className="text-gray-700">{selectedTicket.description}</p>
                                </div>

                                {/* Replies */}
                                <div className="p-6 max-h-96 overflow-y-auto">
                                    <h3 className="font-bold mb-4">المحادثة</h3>
                                    <div className="space-y-4">
                                        {replies.map((reply) => (
                                            <div key={reply.id} className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {reply.user.name[0]}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-gray-100 rounded-lg p-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-sm">{reply.user.name}</span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(reply.created_at).toLocaleString('ar')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{reply.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reply Form */}
                                <div className="p-6 border-t">
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="اكتب ردك هنا..."
                                        className="w-full px-4 py-2 border rounded-lg mb-2"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleReply}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        إرسال الرد
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                                اختر تذكرة لعرض التفاصيل
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
