import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

export const LandingSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const parsed = useMemo(() => {
    try {
      if (!raw.trim()) return null;
      return JSON.parse(raw);
    } catch (e: any) {
      return { __parseError: e?.message || 'invalid json' };
    }
  }, [raw]);

  const loadFromServer = async (opts?: { useDefault?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/super-admin/platform/landing', { params: opts?.useDefault ? { default: 1 } : undefined });
      setRaw(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveToServer = async () => {
    setError(null);
    if (!raw.trim()) {
      setError('لا يمكن حفظ إعدادات فارغة');
      return;
    }
    if (parsed && typeof parsed === 'object' && '__parseError' in parsed) {
      setError('صيغة JSON غير صحيحة');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/super-admin/platform/landing', { config: parsed });
      setRaw(JSON.stringify(res.data, null, 2));
      setLastSavedAt(new Date().toLocaleString());
    } catch (e: any) {
      setError(e?.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadFromServer();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">إعدادات صفحة الهبوط</h1>
            <div className="text-sm text-gray-600 mt-1">يتم تطبيق التغييرات فور الحفظ بدون تعديل الكود</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => loadFromServer()} disabled={loading || saving}>تحديث</Button>
            <Button variant="outline" onClick={() => loadFromServer({ useDefault: true })} disabled={loading || saving} className="border-gray-300">
              تحميل الافتراضي
            </Button>
            <Button onClick={saveToServer} disabled={loading || saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {lastSavedAt && (
          <div className="text-xs text-gray-500 mb-3">آخر حفظ: {lastSavedAt}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="font-bold text-gray-800">JSON</div>
            <div className="text-xs text-gray-500">المسار: `GET/PUT /api/super-admin/platform/landing`</div>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center text-gray-600 py-10">جاري التحميل...</div>
            ) : (
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                spellCheck={false}
                className="w-full h-[70vh] font-mono text-sm border rounded-lg p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                dir="ltr"
              />
            )}
            {!loading && parsed && typeof parsed === 'object' && '__parseError' in (parsed as any) && (
              <div className="mt-3 text-sm text-red-700">
                خطأ JSON: {(parsed as any).__parseError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

