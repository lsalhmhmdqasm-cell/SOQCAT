import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Bell, Trash2, Clock, CheckCircle } from 'lucide-react';
import { TableRowSkeleton } from '../../components/Skeleton';

interface SystemUpdate {
    id: number;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'bugfix' | 'security' | 'maintenance';
    release_date: string;
}

export const UpdatesManager = () => {
    const [updates, setUpdates] = useState<SystemUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        version: '',
        title: '',
        description: '',
        type: 'feature',
        release_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/system-updates');
            setUpdates(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/system-updates', formData);
            setIsModalOpen(false);
            setFormData({
                version: '',
                title: '',
                description: '',
                type: 'feature',
                release_date: new Date().toISOString().split('T')[0]
            });
            fetchUpdates();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التحديث؟')) return;
        try {
            await api.delete(`/system-updates/${id}`);
            fetchUpdates();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة التحديثات والإشعارات</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Bell size={20} className="ml-2" />
                    نشر تحديث جديد
                </Button>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <TableRowSkeleton key={i} />)
                ) : updates.length === 0 ? (
                    <div className="text-center text-gray-400 p-8">لا توجد تحديثات منشورة</div>
                ) : (
                    updates.map(update => (
                        <div key={update.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${update.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                                    update.type === 'bugfix' ? 'bg-blue-100 text-blue-600' :
                                        update.type === 'security' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                <CheckCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-800">{update.title}</h3>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">v{update.version}</span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{update.description}</p>
                                    </div>
                                    <button onClick={() => handleDelete(update.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(update.release_date).toLocaleDateString('ar-YE')}
                                    </span>
                                    <span className="uppercase tracking-wider font-bold text-gray-300">{update.type}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h3 className="font-bold text-xl mb-4">نشر تحديث جديد</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">رقم الإصدار</label>
                                    <input required placeholder="1.2.0" value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} className="w-full p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">نوع التحديث</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border rounded-lg">
                                        <option value="feature">ميزة جديدة</option>
                                        <option value="bugfix">إصلاح أخطاء</option>
                                        <option value="security">أمني</option>
                                        <option value="maintenance">صيانة</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">عنوان التحديث</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">التفاصيل</label>
                                <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ النشر</label>
                                <input type="date" required value={formData.release_date} onChange={e => setFormData({ ...formData, release_date: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" fullWidth>نشر التحديث</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
