/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
function detectPlatform() {
    const p = (import.meta.env.VITE_PLATFORM || '').toLowerCase();
    if (p === 'web' || p === 'android' || p === 'ios') return p;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'ios';
    return 'web';
}
window.AppConfig = window.AppConfig || {};
window.AppConfig.platform = window.AppConfig.platform || detectPlatform();
window.axios.defaults.headers.common['X-Client-Platform'] = window.AppConfig.platform;
window.axios.interceptors.response.use(
    (r) => r,
    (e) => {
        const status = e && e.response && e.response.status;
        const msg = e && e.response && e.response.data && e.response.data.message;
        if (status === 403 && msg === 'This service is not enabled for your shop') {
            window.dispatchEvent(new CustomEvent('service-disabled', { detail: { message: msg } }));
        }
        return Promise.reject(e);
    }
);

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';

// import Pusher from 'pusher-js';
// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
//     wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });
