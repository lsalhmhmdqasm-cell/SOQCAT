import './bootstrap';

async function loadShopFlags() {
    const sidRaw = import.meta.env.VITE_SHOP_ID;
    const sid = sidRaw ? Number(sidRaw) : null;
    if (!sid) return;
    const resp = await window.axios.get(`/api/shops/${sid}`);
    const shop = resp && resp.data ? resp.data : {};
    const flags = {
        enable_web: !!shop.enable_web,
        enable_android: !!shop.enable_android,
        enable_ios: !!shop.enable_ios,
    };
    window.AppConfig = window.AppConfig || {};
    window.AppConfig.shop = shop;
    window.AppConfig.serviceFlags = flags;
}

function isServiceEnabledForCurrentPlatform() {
    const p = (window.AppConfig && window.AppConfig.platform) ? window.AppConfig.platform : 'web';
    const f = (window.AppConfig && window.AppConfig.serviceFlags) ? window.AppConfig.serviceFlags : {};
    if (p === 'android') return f.enable_android !== false;
    if (p === 'ios') return f.enable_ios !== false;
    return f.enable_web !== false;
}

function enforceUI() {
    const enabled = isServiceEnabledForCurrentPlatform();
    const reqEls = document.querySelectorAll('[data-requires-service]');
    const f = (window.AppConfig && window.AppConfig.serviceFlags) ? window.AppConfig.serviceFlags : {};
    reqEls.forEach((el) => {
        const req = (el.getAttribute('data-requires-service') || '').toLowerCase();
        const map = { web: 'enable_web', android: 'enable_android', ios: 'enable_ios' };
        const key = map[req] || 'enable_web';
        if (f[key] === false) {
            el.style.display = 'none';
        }
    });
    if (!enabled) {
        const banner = document.getElementById('service-disabled-banner');
        if (banner) {
            banner.textContent = 'هذه الخدمة غير مفعّلة في باقتك الحالية';
            banner.style.display = 'block';
        }
    }
}

window.addEventListener('service-disabled', () => {
    const banner = document.getElementById('service-disabled-banner');
    if (banner) {
        banner.textContent = 'هذه الخدمة غير مفعّلة في باقتك الحالية';
        banner.style.display = 'block';
    } else {
        alert('هذه الخدمة غير مفعّلة في باقتك الحالية');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadShopFlags();
    enforceUI();
});
