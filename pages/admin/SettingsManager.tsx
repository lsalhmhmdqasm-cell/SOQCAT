import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Save, DollarSign } from 'lucide-react';
import { AppSettings, Slider } from '../../types';
import { mockApi } from '../../services/mockApi';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const SettingsManager = () => {
  const [settings, setSettings] = useState<AppSettings>({ shopName: '', logo: '', deliveryFee: 0 });
  const [sliders, setSliders] = useState<Slider[]>([]);
  
  // New Slider Form
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideImage, setNewSlideImage] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    const [s, sl] = await Promise.all([mockApi.getSettings(), mockApi.getSliders()]);
    setSettings(s);
    setSliders(sl);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.updateSettings(settings);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle) return;
    await mockApi.addSlider({ 
      title: newSlideTitle, 
      image: newSlideImage || 'https://picsum.photos/800/400?random=' + Math.random() 
    });
    setNewSlideTitle('');
    setNewSlideImage('');
    refreshData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await mockApi.deleteSlider(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    refreshData();
  };

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold text-gray-800">إعدادات المتجر</h2>

      {/* General Settings */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">الإعدادات العامة</h3>
        <form onSubmit={handleSettingsSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المتجر</label>
            <input 
              value={settings.shopName} 
              onChange={e => setSettings({...settings, shopName: e.target.value})} 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">رسوم التوصيل (ر.ي)</label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input 
                 type="number"
                 value={settings.deliveryFee} 
                 onChange={e => setSettings({...settings, deliveryFee: Number(e.target.value)})} 
                 className="w-full border rounded-lg pr-10 pl-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">القيمة 0 تعني توصيل مجاني.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">شعار المتجر (Logo)</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">لا يوجد شعار</span>}
              </div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <Upload size={16} />
                رفع صورة
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
          <Button type="submit">
            <Save size={18} />
            حفظ الإعدادات
          </Button>
        </form>
      </section>

      {/* Sliders Management */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">إدارة البانرات الإعلانية (Home Slider)</h3>
        
        {/* Add New */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-sm mb-2">إضافة بانر جديد</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input 
              placeholder="عنوان البانر" 
              value={newSlideTitle}
              onChange={e => setNewSlideTitle(e.target.value)}
              className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
             <input 
              placeholder="رابط الصورة (اختياري)" 
              value={newSlideImage}
              onChange={e => setNewSlideImage(e.target.value)}
              className="border rounded-lg p-2 text-sm text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
              dir="ltr"
            />
            <Button onClick={handleAddSlider} className="text-sm">
              <Plus size={16} />
              إضافة
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">* إذا لم تضع رابط صورة، سيتم وضع صورة عشوائية للتجربة.</p>
        </div>

        {/* List */}
        <div className="space-y-3">
          {sliders.map(slide => (
            <div key={slide.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <img src={slide.image} className="w-24 h-12 object-cover rounded bg-gray-200" />
              <span className="font-medium flex-1">{slide.title}</span>
              <button onClick={() => setDeleteId(slide.id)} className="text-red-500 p-2 hover:bg-red-50 rounded transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="حذف البانر"
        message="هل أنت متأكد من حذف هذا البانر؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};