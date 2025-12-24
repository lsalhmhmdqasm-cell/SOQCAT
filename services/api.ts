import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8000/api'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

const dispatchAppEvent = (name: string, detail?: any) => {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  } catch {}
};

const existingToken = (() => {
  try {
    return localStorage.getItem('accessToken') || '';
  } catch {
    return '';
  }
})();
if (existingToken) {
  api.defaults.headers.common = { ...api.defaults.headers.common, Authorization: `Bearer ${existingToken}` };
}

api.interceptors.request.use((config) => {
  const platform = (import.meta as any)?.env?.VITE_CLIENT_PLATFORM || 'web';
  (config.headers as any) = { ...(config.headers as any), 'X-Client-Platform': platform };

  // Note: We primarily rely on the Domain/Host for tenant identification now.
  // X-Shop-Id is kept as a fallback for Dev/Test environments or specific overrides.
  const envShopId = (import.meta as any)?.env?.VITE_SHOP_ID;
  if (envShopId) {
    (config.headers as any) = { ...(config.headers as any), 'X-Shop-Id': String(envShopId) };
  } else {
    try {
        const raw = localStorage.getItem('shopConfig');
        if (raw) {
            const parsed = JSON.parse(raw);
            const shopId = parsed?.shopId ?? parsed?.shop_id;
            if (shopId) {
                 (config.headers as any) = { ...(config.headers as any), 'X-Shop-Id': String(shopId) };
            }
        }
    } catch {}
  }

  try {
    const t = localStorage.getItem('accessToken');
    if (t) {
      (api.defaults.headers as any).common = { ...(api.defaults.headers as any).common, Authorization: `Bearer ${t}` };
    }
  } catch {}

  // Fallback: If shopConfig is missing, try to use logged-in user's shop_id
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const uid = u?.shop_id;
      if (uid && !((config.headers as any)['X-Shop-Id'])) {
        (config.headers as any) = { ...(config.headers as any), 'X-Shop-Id': String(uid) };
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const url = error?.config?.url || '';

    if (status === 401) {
      // CRITICAL FIX: Do NOT redirect to login if /me or /shop/config fails with 401.
      // This allows the app to load in Guest mode instead of forcing a login loop.
      if (!url.endsWith('/me') && !url.endsWith('/shop/config')) {
        dispatchAppEvent('api-unauthorized', { message });
      }
    }

    if (status === 403) {
      if (message === 'This service is not enabled for your shop') {
        dispatchAppEvent('service-disabled', { message });
      } else {
        dispatchAppEvent('api-forbidden', { message });
      }
    }
    
    // Handle Shop Not Found (e.g. invalid domain)
    if (status === 404 && message === 'Shop not found for this domain') {
         console.warn('Shop context not resolved via domain.');
    }

    return Promise.reject(error);
  }
);
