import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Send, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Pagination } from '../../components/Pagination';

interface SystemUpdate {
    id: number;
    version: string;
    title: string;
    description: string;
    changelog: string;
    release_date: string;
    is_critical: boolean;
    applied_to: number[];
}

interface UpdateStats {
    total_clients: number;
    applied_count: number;
    pending_count: number;
    percentage: number;
}

export const UpdatesManager = () => {
    const [updates, setUpdates] = useState<SystemUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUpdate, setSelectedUpdate] = useState<SystemUpdate | null>(null);
    const [stats, setStats] = useState<UpdateStats | null>(null);

    const [formData, setFormData] = useState({
        version: '',
        title: '',
        description: '',
        changelog: '',
        release_date: new Date().toISOString().split('T')[0],
        is_critical: false
    });

    useEffect(() => {
        fetchUpdates();
    }, [currentPage]);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super-admin/updates', { params: { page: currentPage } });
            setUpdates(res.data.data);
            setTotalPages(res.data.last_page);
        } catch (error) {
            console.error('Failed to load updates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (updateId: number) => {
        try {
            const res = await api.get(`/super-admin/updates/${updateId}/stats`);
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/super-admin/updates', formData);
            setShowCreateModal(false);
            fetchUpdates();
            setFormData({
                version: '',
                title: '',
                description: '',
                changelog: '',
                release_date: new Date().toISOString().split('T')[0],
                is_critical: false
            });
            alert('تم إنشاء التحديث بنجاح');
        } catch (error) {
            alert('فشل إنشاء التحديث');
        }
    };

    const handleDeploy = async (updateId: number, target: 'all' | number[]) => {
        if (!confirm('هل تريد نشر هذا التحديث؟')) return;
        try {
            await api.post(`/super-admin/updates/${updateId}/deploy`, {
                target_clients: target
            });
            alert('تم نشر التحديث بنجاح');
            fetchUpdates();
        } catch (error) {
            alert('فشل نشر التحديث');
        }
    };

    const viewDetails = (update: SystemUpdate) => {
        setSelectedUpdate(update);
        fetchStats(update.id);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">إدارة التحديثات</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        إنشاء تحديث جديد
                    </button>
                </div>

                {/* Updates List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="bg-white p-8 rounded-lg text-center">جاري التحميل...</div>
                    ) : (
                        updates.map((update) => (
                            <div key={update.id} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold">{update.version}</h3>
                                            {update.is_critical && (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                                                    حرج
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-lg text-gray-700">{update.title}</h4>
                                    </div>
                                    <span className="text-sm text-gray-500">{update.release_date}</span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{update.description}</p>

                                {update.changelog && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                        <h5 className="font-bold text-sm mb-2">التغييرات:</h5>
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{update.changelog}</pre>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => viewDetails(update)}
                                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
                                    >
                                        <TrendingUp size={16} />
                                        الإحصائيات
                                    </button>
                                    <button
                                        onClick={() => handleDeploy(update.id, 'all')}
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        نشر للجميع
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">إنشاء تحديث جديد</h2>
                            <form onSubmit={handleCreate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">رقم الإصدار</label>
                                        <input
                                            type="text"
                                            value={formData.version}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                            placeholder="v1.2.0"
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">العنوان</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">الوصف</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Changelog</label>
                                        <textarea
                                            value={formData.changelog}
                                            onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            rows={5}
                                            placeholder="- إصلاح مشكلة X&#10;- إضافة ميزة Y"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">تاريخ الإصدار</label>
                                        <input
                                            type="date"
                                            value={formData.release_date}
                                            onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_critical}
                                            onChange={(e) => setFormData({ ...formData, is_critical: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm font-bold">تحديث حرج (أمني)</label>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                                    >
                                        إنشاء
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stats Modal */}
                {selectedUpdate && stats && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4">إحصائيات التحديث</h2>
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">إجمالي المحلات</span>
                                        <span className="text-2xl font-bold text-blue-600">{stats.total_clients}</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">طُبّق على</span>
                                        <span className="text-2xl font-bold text-green-600">{stats.applied_count}</span>
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">معلق</span>
                                        <span className="text-2xl font-bold text-orange-600">{stats.pending_count}</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">النسبة</span>
                                        <span className="text-2xl font-bold text-purple-600">{stats.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${stats.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUpdate(null)}
                                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 mt-4"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
