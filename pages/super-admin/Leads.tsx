import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Search, Phone, ClipboardList, Edit3 } from 'lucide-react';
import { Button } from '../../components/Button';

interface Lead {
  id: number;
  shop_name: string;
  phone: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  status: 'new' | 'contacted' | 'qualified' | 'rejected';
  notes?: string;
  created_at: string;
}

export const Leads: React.FC = () => {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | Lead['status']>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editing, setEditing] = useState<{ id: number | null; status: Lead['status']; notes: string }>({ id: null, status: 'new', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (status !== 'all') params.status = status;
      if (q) params.q = q;
      const res = await api.get('/super-admin/leads', { params });
      setItems(res.data.data || []);
      setLastPage(res.data.last_page || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, status]);

  const openEdit = (lead: Lead) => {
    setEditing({ id: lead.id, status: lead.status, notes: lead.notes || '' });
  };

  const saveEdit = async () => {
    if (!editing.id) return;
    try {
      await api.put(`/super-admin/leads/${editing.id}`, { status: editing.status, notes: editing.notes });
      setEditing({ id: null, status: 'new', notes: '' });
      fetchData();
    } catch {}
  };

  const statusLabel = (s: Lead['status']) => {
    const m: Record<Lead['status'], string> = {
      new: 'جديد',
      contacted: 'تم التواصل',
      qualified: 'مهتم',
      rejected: 'مرفوض',
    };
    return m[s];
  };

  const statusClass = (s: Lead['status']) => {
    const m: Record<Lead['status'], string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-emerald-100 text-emerald-700',
      qualified: 'bg-purple-100 text-purple-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return m[s];
  };

  const planLabel = (p: Lead['plan_type']) => {
    const m: Record<Lead['plan_type'], string> = {
      basic: 'الباقة الأساسية',
      premium: 'الباقة المتقدمة',
      enterprise: 'باقة الشركات',
    };
    return m[p];
  };

  const rows = useMemo(() => items, [items]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">طلبات التواصل</h1>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="بحث بالاسم أو الهاتف"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
                className="w-full pr-10 pl-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">الكل</option>
                <option value="new">جديد</option>
                <option value="contacted">تم التواصل</option>
                <option value="qualified">مهتم</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setPage(1); fetchData(); }}>بحث</Button>
              <Button variant="secondary" onClick={() => { setQ(''); setStatus('all'); setPage(1); fetchData(); }}>إعادة تعيين</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-gray-600">لا توجد طلبات مطابقة</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الباقة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الملاحظات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{l.shop_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone size={16} className="text-gray-500" />
                        <span dir="ltr">{l.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{planLabel(l.plan_type)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(l.status)}`}>{statusLabel(l.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="line-clamp-2">{l.notes || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => openEdit(l)} className="border-gray-300">
                          <Edit3 size={16} />
                          تحديث
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">صفحة {page} من {lastPage}</div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</Button>
            <Button disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>التالي</Button>
          </div>
        </div>
      </div>

      {editing.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">تحديث الحالة والملاحظات</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">الحالة</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Lead['status'] })}
                >
                  <option value="new">جديد</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="qualified">مهتم</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ملاحظات</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={saveEdit} className="flex-1">حفظ</Button>
              <Button variant="secondary" onClick={() => setEditing({ id: null, status: 'new', notes: '' })} className="flex-1">إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

