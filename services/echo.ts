import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: any;
  }
}

window.Pusher = Pusher;

function buildEcho(): any {
  try {
    const key = (import.meta as any).env?.VITE_PUSHER_APP_KEY || '';
    const cluster = (import.meta as any).env?.VITE_PUSHER_APP_CLUSTER || 'mt1';
    if (!key) {
      throw new Error('Missing VITE_PUSHER_APP_KEY');
    }
    const token = (() => {
      try { return localStorage.getItem('accessToken') || ''; } catch { return ''; }
    })();
    return new Echo({
      broadcaster: 'pusher',
      key,
      cluster,
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    });
  } catch (e) {
    return {
      private: (name: string) => ({
        listen: (_event: string, _callback: (data: any) => void) => {
          console.log(`Echo fallback: private ${name}`);
          return { listen: () => {} };
        }
      }),
      channel: (name: string) => ({
        listen: (_event: string, _callback: (data: any) => void) => {
          console.log(`Echo fallback: channel ${name}`);
          return { listen: () => {} };
        }
      }),
      leaveChannel: (name: string) => {
        console.log(`Echo fallback: leave ${name}`);
      }
    };
  }
}

export const echo = buildEcho();
export default echo;
