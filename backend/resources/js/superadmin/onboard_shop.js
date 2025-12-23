import axios from 'axios';

const state = {
    step: 1,
    shop: { shop_name: '', description: '', logo: '', phone: '' },
    admin: { admin_name: '', admin_email: '', admin_password: '' },
    plans: [],
    selectedPlan: null,
    loading: false,
    errors: {},
};

function setAuthHeader() {
    const token = localStorage.getItem('access_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

function switchStep(to) {
    state.step = to;
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`step-${i}`);
        if (el) el.style.display = i === to ? 'block' : 'none';
        const pill = document.querySelector(`.step-pill[data-step="${i}"]`);
        if (pill) {
            pill.classList.toggle('bg-blue-600', i === to);
            pill.classList.toggle('text-white', i === to);
            pill.classList.toggle('bg-gray-200', i !== to);
        }
    }
}

function validateStep1() {
    const e = {};
    if (!state.shop.shop_name || state.shop.shop_name.trim().length < 2) e.shop_name = 'اسم المتجر مطلوب';
    if (state.shop.logo && !/^https?:\/\//.test(state.shop.logo)) e.logo = 'رابط شعار غير صحيح';
    state.errors = e;
    const el = document.getElementById('error-1');
    if (el) el.textContent = Object.values(e)[0] || '';
    return Object.keys(e).length === 0;
}

function validateStep2() {
    const e = {};
    if (!state.admin.admin_name || state.admin.admin_name.trim().length < 2) e.admin_name = 'اسم المدير مطلوب';
    const email = state.admin.admin_email || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.admin_email = 'بريد إلكتروني غير صحيح';
    const pwd = state.admin.admin_password || '';
    if (pwd.length < 8) e.admin_password = 'كلمة المرور لا تقل عن 8 أحرف';
    state.errors = e;
    const el = document.getElementById('error-2');
    if (el) el.textContent = Object.values(e)[0] || '';
    return Object.keys(e).length === 0;
}

function validateStep3() {
    const e = {};
    if (!state.selectedPlan) e.plan = 'يجب اختيار باقة';
    else {
        const web = !!state.selectedPlan.web_enabled;
        const android = !!state.selectedPlan.android_enabled;
        const ios = !!state.selectedPlan.ios_enabled;
        if (!(web || android || ios)) e.plan = 'يجب أن تحتوي الباقة على خدمة واحدة مفعلة على الأقل';
    }
    state.errors = e;
    const el = document.getElementById('error-3');
    if (el) el.textContent = Object.values(e)[0] || '';
    return Object.keys(e).length === 0;
}

async function loadPlans() {
    setAuthHeader();
    try {
        const resp = await axios.get('/api/super_admin/pricing-plans');
        state.plans = resp.data;
        renderPlans();
    } catch {
        try {
            const resp = await axios.get('/api/platform/pricing-plans');
            state.plans = resp.data;
            renderPlans();
        } catch (err) {
            const el = document.getElementById('error-3');
            if (el) el.textContent = 'تعذر تحميل الباقات';
        }
    }
}

function renderPlans() {
    const list = document.getElementById('plans-list');
    if (!list) return;
    list.innerHTML = '';
    state.plans.forEach((p) => {
        const web = !!p.web_enabled;
        const android = !!p.android_enabled;
        const ios = !!p.ios_enabled;
        const div = document.createElement('div');
        div.className = 'border rounded p-3 flex items-center justify-between';
        const info = document.createElement('div');
        info.innerHTML = `<div class="font-semibold">${p.name}</div><div class="text-sm">Web: ${web ? 'مفعّل' : 'غير مفعّل'} | Android: ${android ? 'مفعّل' : 'غير مفعّل'} | iOS: ${ios ? 'مفعّل' : 'غير مفعّل'}</div>`;
        const btn = document.createElement('button');
        btn.className = 'px-3 py-1 bg-blue-600 text-white rounded';
        btn.textContent = 'اختيار';
        btn.onclick = () => {
            state.selectedPlan = p;
            Array.from(list.children).forEach((c) => c.classList.remove('ring', 'ring-blue-400'));
            div.classList.add('ring', 'ring-blue-400');
        };
        div.appendChild(info);
        div.appendChild(btn);
        list.appendChild(div);
    });
}

function renderReview() {
    const r = document.getElementById('review');
    if (!r) return;
    const web = !!(state.selectedPlan && state.selectedPlan.web_enabled);
    const android = !!(state.selectedPlan && state.selectedPlan.android_enabled);
    const ios = !!(state.selectedPlan && state.selectedPlan.ios_enabled);
    const s = `
        <div><strong>المتجر:</strong> ${state.shop.shop_name}</div>
        <div><strong>الوصف:</strong> ${state.shop.description || '—'}</div>
        <div><strong>الشعار:</strong> ${state.shop.logo || '—'}</div>
        <div><strong>الهاتف:</strong> ${state.shop.phone || '—'}</div>
        <hr class="my-2"/>
        <div><strong>المدير:</strong> ${state.admin.admin_name}</div>
        <div><strong>البريد:</strong> ${state.admin.admin_email}</div>
        <hr class="my-2"/>
        <div><strong>الباقة:</strong> ${state.selectedPlan ? state.selectedPlan.name : '—'}</div>
        <div><strong>الخدمات:</strong> Web: ${web ? 'مفعّل' : 'غير مفعّل'} | Android: ${android ? 'مفعّل' : 'غير مفعّل'} | iOS: ${ios ? 'مفعّل' : 'غير مفعّل'}</div>
    `;
    r.innerHTML = s;
}

async function submit() {
    const errEl = document.getElementById('error-4');
    const okEl = document.getElementById('success');
    errEl.textContent = '';
    okEl.textContent = '';
    setAuthHeader();
    state.loading = true;
    const btn = document.getElementById('submit');
    btn.disabled = true;
    btn.textContent = 'جاري الإنشاء...';
    try {
        const payload = {
            shop_name: state.shop.shop_name,
            description: state.shop.description || null,
            logo: state.shop.logo || null,
            phone: state.shop.phone || null,
            admin_name: state.admin.admin_name,
            admin_email: state.admin.admin_email,
            admin_password: state.admin.admin_password,
            pricing_plan_id: state.selectedPlan.id,
        };
        const resp = await axios.post('/api/super-admin/onboard-shop', payload);
        okEl.textContent = 'تم إنشاء المتجر بنجاح';
        const shopId = resp.data && resp.data.shop && resp.data.shop.id ? resp.data.shop.id : null;
        if (shopId) {
            setTimeout(() => {
                window.location.href = `/super-admin/shops/${shopId}`;
            }, 800);
        }
    } catch (e) {
        const status = e && e.response && e.response.status;
        const msg = e && e.response && e.response.data && e.response.data.message;
        errEl.textContent = msg || 'حدث خطأ أثناء الإرسال';
        if (status === 422 && e.response.data && e.response.data.errors) {
            const firstKey = Object.keys(e.response.data.errors)[0];
            errEl.textContent = e.response.data.errors[firstKey][0] || errEl.textContent;
        }
        btn.disabled = false;
        btn.textContent = 'إنشاء المتجر';
    } finally {
        state.loading = false;
    }
}

function init() {
    switchStep(1);
    document.getElementById('next-1').onclick = () => {
        state.shop.shop_name = document.getElementById('shop_name').value;
        state.shop.description = document.getElementById('description').value;
        state.shop.logo = document.getElementById('logo').value;
        state.shop.phone = document.getElementById('phone').value;
        if (validateStep1()) switchStep(2);
    };
    document.getElementById('back-2').onclick = () => switchStep(1);
    document.getElementById('next-2').onclick = () => {
        state.admin.admin_name = document.getElementById('admin_name').value;
        state.admin.admin_email = document.getElementById('admin_email').value;
        state.admin.admin_password = document.getElementById('admin_password').value;
        if (validateStep2()) {
            loadPlans();
            switchStep(3);
        }
    };
    document.getElementById('back-3').onclick = () => switchStep(2);
    document.getElementById('next-3').onclick = () => {
        if (validateStep3()) {
            renderReview();
            switchStep(4);
        }
    };
    document.getElementById('back-4').onclick = () => switchStep(3);
    document.getElementById('submit').onclick = submit;
}

document.addEventListener('DOMContentLoaded', init);
