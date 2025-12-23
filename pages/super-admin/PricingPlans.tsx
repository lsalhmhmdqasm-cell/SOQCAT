import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Check, Zap, Shield, Crown, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: number;
  name: string;
  description?: string;
  monthly_price?: number;
  yearly_price?: number;
  lifetime_price?: number;
  features: Record<string, any>;
  web_enabled?: boolean;
  android_enabled?: boolean;
  ios_enabled?: boolean;
  is_active: boolean;
  sort_order: number;
}

export const PricingPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [onlyActive, setOnlyActive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<{ name: string; description?: string; monthly_price?: string; yearly_price?: string; lifetime_price?: string; featuresRaw: string; sort_order?: string; is_active: boolean; web_enabled: boolean; android_enabled: boolean; ios_enabled: boolean }>({ name: '', description: '', monthly_price: '', yearly_price: '', lifetime_price: '', featuresRaw: '{ }', sort_order: '0', is_active: true, web_enabled: true, android_enabled: true, ios_enabled: true });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ description?: string; monthly_price?: string; yearly_price?: string; lifetime_price?: string; sort_order?: string; is_active?: boolean; web_enabled?: boolean; android_enabled?: boolean; ios_enabled?: boolean }>({ description: '', monthly_price: '', yearly_price: '', lifetime_price: '', sort_order: undefined, is_active: undefined, web_enabled: undefined, android_enabled: undefined, ios_enabled: undefined });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await api.get('/super_admin/pricing-plans');
        setPlans((res.data || []).sort((a: Plan, b: Plan) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super_admin/pricing-plans');
      setPlans((res.data || []).sort((a: Plan, b: Plan) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    let features: any = {};
    try {
      features = JSON.parse(createForm.featuresRaw || '{}');
      if (typeof features !== 'object' || Array.isArray(features)) throw new Error();
    } catch {
      return;
    }
    setCreating(true);
    try {
      await api.post('/super_admin/pricing-plans', {
        name: createForm.name,
        description: createForm.description || null,
        monthly_price: createForm.monthly_price ? Number(createForm.monthly_price) : null,
        yearly_price: createForm.yearly_price ? Number(createForm.yearly_price) : null,
        lifetime_price: createForm.lifetime_price ? Number(createForm.lifetime_price) : null,
        features,
        sort_order: createForm.sort_order ? Number(createForm.sort_order) : 0,
        is_active: createForm.is_active,
        web_enabled: createForm.web_enabled,
        android_enabled: createForm.android_enabled,
        ios_enabled: createForm.ios_enabled,
      });
      setCreateForm({ name: '', description: '', monthly_price: '', yearly_price: '', lifetime_price: '', featuresRaw: '{ }', sort_order: '0', is_active: true, web_enabled: true, android_enabled: true, ios_enabled: true });
      await reload();
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    const payload: any = {};
    if (editForm.description !== undefined) payload.description = editForm.description;
    if (editForm.monthly_price !== undefined && editForm.monthly_price !== '') payload.monthly_price = Number(editForm.monthly_price);
    if (editForm.yearly_price !== undefined && editForm.yearly_price !== '') payload.yearly_price = Number(editForm.yearly_price);
    if (editForm.lifetime_price !== undefined && editForm.lifetime_price !== '') payload.lifetime_price = Number(editForm.lifetime_price);
    if (editForm.sort_order !== undefined && editForm.sort_order !== '') payload.sort_order = Number(editForm.sort_order);
    if (typeof editForm.is_active === 'boolean') payload.is_active = editForm.is_active;
    if (typeof editForm.web_enabled === 'boolean') payload.web_enabled = editForm.web_enabled;
    if (typeof editForm.android_enabled === 'boolean') payload.android_enabled = editForm.android_enabled;
    if (typeof editForm.ios_enabled === 'boolean') payload.ios_enabled = editForm.ios_enabled;
    await api.put(`/super_admin/pricing-plans/${id}`, payload);
    setEditId(null);
    setEditForm({ description: '', monthly_price: '', yearly_price: '', lifetime_price: '', sort_order: undefined, is_active: undefined, web_enabled: undefined, android_enabled: undefined, ios_enabled: undefined });
    await reload();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/super_admin/pricing-plans/${id}`);
    await reload();
  };

  const handleToggle = async (id: number) => {
    await api.post(`/super_admin/pricing-plans/${id}/toggle`);
    await reload();
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(p => (onlyActive ? p.is_active : true));
  }, [plans, onlyActive]);

  const priceForCycle = (p: Plan) => {
    if (cycle === 'monthly') return p.monthly_price ?? null;
    if (cycle === 'yearly') return p.yearly_price ?? null;
    return p.lifetime_price ?? null;
  };

  const yearlySavingsPct = (p: Plan) => {
    if (!p.monthly_price || !p.yearly_price) return 0;
    const yearAsMonthly = p.monthly_price * 12;
    const savings = yearAsMonthly - p.yearly_price;
    if (savings <= 0) return 0;
    return Math.round((savings / yearAsMonthly) * 100);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">الباقات والاشتراكات</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/super-admin/clients')}>
              إدارة إسناد الباقات
            </Button>
            <Button onClick={reload} variant="outline" className="border-gray-300">تحديث</Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-600">اسم الباقة</label>
              <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-gray-600">سعر شهري</label>
              <input value={createForm.monthly_price} onChange={(e) => setCreateForm({ ...createForm, monthly_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-gray-600">سعر سنوي</label>
              <input value={createForm.yearly_price} onChange={(e) => setCreateForm({ ...createForm, yearly_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-gray-600">مدى الحياة</label>
              <input value={createForm.lifetime_price} onChange={(e) => setCreateForm({ ...createForm, lifetime_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-gray-600">الترتيب</label>
              <input value={createForm.sort_order} onChange={(e) => setCreateForm({ ...createForm, sort_order: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Web</label>
              <button onClick={() => setCreateForm({ ...createForm, web_enabled: !createForm.web_enabled })} className={`px-4 py-2 rounded-lg text-sm ${createForm.web_enabled ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{createForm.web_enabled ? 'مفعّل' : 'معطّل'}</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Android</label>
              <button onClick={() => setCreateForm({ ...createForm, android_enabled: !createForm.android_enabled })} className={`px-4 py-2 rounded-lg text-sm ${createForm.android_enabled ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{createForm.android_enabled ? 'مفعّل' : 'معطّل'}</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">iOS</label>
              <button onClick={() => setCreateForm({ ...createForm, ios_enabled: !createForm.ios_enabled })} className={`px-4 py-2 rounded-lg text-sm ${createForm.ios_enabled ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{createForm.ios_enabled ? 'مفعّل' : 'معطّل'}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">الميزات JSON</label>
              <textarea value={createForm.featuresRaw} onChange={(e) => setCreateForm({ ...createForm, featuresRaw: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg font-mono text-xs" rows={3} />
            </div>
            <div className="flex items-end gap-2">
              <label className="text-xs text-gray-600 me-2">نشطة</label>
              <button onClick={() => setCreateForm({ ...createForm, is_active: !createForm.is_active })} className={`px-4 py-2 rounded-lg text-sm ${createForm.is_active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{createForm.is_active ? 'نعم' : 'لا'}</button>
              <Button onClick={handleCreate} disabled={creating}>{creating ? 'جاري الإضافة...' : 'إضافة'}</Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">عرض فقط الباقات النشطة</label>
              <div className="mt-2">
                <button
                  onClick={() => setOnlyActive(v => !v)}
                  className={`px-4 py-2 rounded-lg text-sm ${onlyActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {onlyActive ? 'نعم' : 'الكل'}
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">الدورة</label>
              <div className="mt-2 inline-flex bg-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCycle('monthly')}
                  className={`px-4 py-2 text-sm ${cycle === 'monthly' ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                >
                  شهري
                </button>
                <button
                  onClick={() => setCycle('yearly')}
                  className={`px-4 py-2 text-sm ${cycle === 'yearly' ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                >
                  سنوي
                </button>
                <button
                  onClick={() => setCycle('lifetime')}
                  className={`px-4 py-2 text-sm ${cycle === 'lifetime' ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                >
                  مدى الحياة
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">إدارة كاملة للباقات</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">جاري التحميل...</div>
        )}

        {!loading && filteredPlans.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-600">لا توجد باقات مطابقة</div>
        )}

        {!loading && filteredPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((p) => {
              const price = priceForCycle(p);
              const badgeIcon =
                p.name.toLowerCase() === 'basic' ? <Package size={18} /> :
                p.name.toLowerCase() === 'pro' ? <Zap size={18} /> :
                <Crown size={18} />;
              return (
                <div key={p.id} className={`relative p-6 rounded-2xl border shadow-sm ${p.name.toLowerCase() === 'pro' ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white border-emerald-500' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.name.toLowerCase() === 'pro' ? 'bg-white text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {badgeIcon}
                    </div>
                    <h3 className={`text-xl font-bold ${p.name.toLowerCase() === 'pro' ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                    {!p.is_active && (
                      <span className={`ms-auto px-2 py-1 rounded-full text-xs ${p.name.toLowerCase() === 'pro' ? 'bg-white text-green-700' : 'bg-gray-100 text-gray-700'}`}>غير نشطة</span>
                    )}
                  </div>
                  {p.description && (
                    <div className={`text-sm mb-4 ${p.name.toLowerCase() === 'pro' ? 'text-green-100' : 'text-gray-600'}`}>{p.description}</div>
                  )}
                  <div className="mb-4">
                    <div className="flex items-end gap-2">
                      <div className={`text-3xl font-extrabold ${p.name.toLowerCase() === 'pro' ? 'text-white' : 'text-gray-900'}`}>
                        {price ? `${price}` : '—'}
                        {(cycle === 'monthly' || cycle === 'yearly') && <span className={`text-sm font-normal ms-1 ${p.name.toLowerCase() === 'pro' ? 'text-green-200' : 'text-gray-500'}`}>{cycle === 'monthly' ? '/ شهرياً' : '/ سنوياً'}</span>}
                      </div>
                      {cycle === 'yearly' && yearlySavingsPct(p) > 0 && (
                        <span className={`text-xs font-bold ${p.name.toLowerCase() === 'pro' ? 'text-white' : 'text-yellow-600'}`}>وفر {yearlySavingsPct(p)}%</span>
                      )}
                    </div>
                  </div>
                  <ul className={`space-y-2 mb-6 text-sm ${p.name.toLowerCase() === 'pro' ? 'text-green-50' : 'text-gray-700'}`}>
                    {Object.entries(p.features || {}).slice(0, 8).map(([k, v], idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check size={18} className={`${p.name.toLowerCase() === 'pro' ? 'text-white' : 'text-green-600'}`} />
                        <span>{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={p.name.toLowerCase() === 'pro' ? 'primary' : 'outline'}
                      onClick={() => navigate('/super-admin/clients')}
                      className={p.name.toLowerCase() === 'pro' ? '' : 'border-gray-300'}
                    >
                      <Shield size={16} />
                      إسناد لعميل
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : cycle === 'yearly' ? 'lifetime' : 'monthly')}
                    >
                      <DollarSign size={16} />
                      تبديل الدورة
                    </Button>
                    <Button variant="outline" className="border-gray-300" onClick={() => { setEditId(p.id); setEditForm({ description: p.description || '', monthly_price: String(p.monthly_price ?? ''), yearly_price: String(p.yearly_price ?? ''), lifetime_price: String(p.lifetime_price ?? ''), sort_order: String(p.sort_order ?? ''), is_active: p.is_active }); }}>
                      تعديل
                    </Button>
                    <Button variant="outline" className="border-gray-300" onClick={() => handleToggle(p.id)}>
                      تبديل الحالة
                    </Button>
                    <Button variant="outline" className="border-red-300 text-red-700" onClick={() => handleDelete(p.id)}>
                      حذف
                    </Button>
                  </div>
                  {editId === p.id && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">وصف</label>
                          <input value={editForm.description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">شهري</label>
                          <input value={editForm.monthly_price ?? ''} onChange={(e) => setEditForm({ ...editForm, monthly_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">سنوي</label>
                          <input value={editForm.yearly_price ?? ''} onChange={(e) => setEditForm({ ...editForm, yearly_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">مدى الحياة</label>
                          <input value={editForm.lifetime_price ?? ''} onChange={(e) => setEditForm({ ...editForm, lifetime_price: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">ترتيب</label>
                          <input value={editForm.sort_order ?? ''} onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Web</label>
                          <button onClick={() => setEditForm({ ...editForm, web_enabled: !(editForm.web_enabled ?? !!p.web_enabled) })} className={`px-4 py-2 rounded-lg text-sm ${(editForm.web_enabled ?? !!p.web_enabled) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{(editForm.web_enabled ?? !!p.web_enabled) ? 'مفعّل' : 'معطّل'}</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Android</label>
                          <button onClick={() => setEditForm({ ...editForm, android_enabled: !(editForm.android_enabled ?? !!p.android_enabled) })} className={`px-4 py-2 rounded-lg text-sm ${(editForm.android_enabled ?? !!p.android_enabled) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{(editForm.android_enabled ?? !!p.android_enabled) ? 'مفعّل' : 'معطّل'}</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">iOS</label>
                          <button onClick={() => setEditForm({ ...editForm, ios_enabled: !(editForm.ios_enabled ?? !!p.ios_enabled) })} className={`px-4 py-2 rounded-lg text-sm ${(editForm.ios_enabled ?? !!p.ios_enabled) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{(editForm.ios_enabled ?? !!p.ios_enabled) ? 'مفعّل' : 'معطّل'}</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button onClick={() => handleUpdate(p.id)}>حفظ</Button>
                        <Button variant="outline" className="border-gray-300" onClick={() => { setEditId(null); setEditForm({ description: '', monthly_price: '', yearly_price: '', lifetime_price: '', sort_order: undefined, is_active: undefined, web_enabled: undefined, android_enabled: undefined, ios_enabled: undefined }); }}>إلغاء</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
