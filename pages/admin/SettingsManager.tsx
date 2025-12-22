import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Save, DollarSign } from 'lucide-react';
import { AppSettings, Slider } from '../../types';
import { mockApi } from '../../services/mockApi';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useShop } from '../../context/ShopContext';

export const SettingsManager = () => {
  const [settings, setSettings] = useState<AppSettings>({ shopName: '', logo: '', deliveryFee: 0 });
  const [sliders, setSliders] = useState<Slider[]>([]);
  const { updateShopSettings } = useShop();
  
  // New Slider Form
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideImage, setNewSlideImage] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Theme and features
  const [primaryColor, setPrimaryColor] = useState<string>('#15803d');
  const [secondaryColor, setSecondaryColor] = useState<string>('#166534');
  const [enableReviews, setEnableReviews] = useState<boolean>(true);
  const [enableProductRecommendations, setEnableProductRecommendations] = useState<boolean>(true);
  const [categoryVisibility, setCategoryVisibility] = useState<'public' | 'registered' | 'shop_only'>('public');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  const [enableMultipleAddresses, setEnableMultipleAddresses] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      const [backendSettings, sl] = await Promise.all([
        api.get('/shop/settings').then(r => r.data).catch(async () => await mockApi.getSettings()),
        mockApi.getSliders()
      ]);
      setSettings(backendSettings);
      setSliders(sl);
    } catch {
      const [s, sl] = await Promise.all([mockApi.getSettings(), mockApi.getSliders()]);
      setSettings(s);
      setSliders(sl);
    }
  };

  useEffect(() => {
    refreshData();
    try {
      const configStr = localStorage.getItem('shopConfig');
      if (configStr) {
        const config = JSON.parse(configStr);
        setPrimaryColor(config.primaryColor || '#15803d');
        setSecondaryColor(config.secondaryColor || '#166534');
        setEnableReviews(!!config.features?.enableReviews);
        setEnableProductRecommendations(!!config.features?.enableProductRecommendations);
        setEnableNotifications(!!config.features?.enableNotifications);
        setEnableMultipleAddresses(!!config.features?.enableMultipleAddresses);
        const vis = config.features?.categoryPrivacy?.visibility;
        if (vis === 'registered' || vis === 'shop_only') {
          setCategoryVisibility(vis);
        } else {
          setCategoryVisibility('public');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/shop/settings', {
        shopName: settings.shopName,
        logo: settings.logo,
        primaryColor,
        secondaryColor,
        deliveryFee: settings.deliveryFee,
      });
    } catch {
      await mockApi.updateSettings(settings);
    }
    updateShopSettings({
      shopName: settings.shopName,
      logo: settings.logo,
      deliveryFee: settings.deliveryFee,
      primaryColor,
      secondaryColor,
      features: {
        enableReviews,
        enableProductRecommendations,
        enableNotifications,
        enableMultipleAddresses,
        categoryPrivacy: {
          visibility: categoryVisibility
        }
      }
    });
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const form = new FormData();
      form.append('image', file);
      try {
        const res = await api.post('/upload/shop-logo', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data?.url;
        if (url) {
          setSettings(prev => ({ ...prev, logo: url }));
          return;
        }
      } catch {
        // fallback to base64 for demo
      }
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اللون الأساسي (Hex)</label>
              <input 
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">مثال: #15803d</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اللون الثانوي (Hex)</label>
              <input 
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">مثال: #166534</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-bold mb-2">ميزات الواجهة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={enableReviews} onChange={e => setEnableReviews(e.target.checked)} />
                <span>تفعيل التقييمات</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={enableProductRecommendations} onChange={e => setEnableProductRecommendations(e.target.checked)} />
                <span>اقتراحات المنتجات</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={enableNotifications} onChange={e => setEnableNotifications(e.target.checked)} />
                <span>الإشعارات</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={enableMultipleAddresses} onChange={e => setEnableMultipleAddresses(e.target.checked)} />
                <span>عناوين متعددة</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">خصوصية التصنيفات</label>
                <select 
                  value={categoryVisibility}
                  onChange={e => setCategoryVisibility(e.target.value as any)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="public">عام</option>
                  <option value="registered">للمسجلين فقط</option>
                  <option value="shop_only">مخفي</option>
                </select>
              </div>
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
