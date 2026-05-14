import { setSession } from '../session/sessionStore.js';

function meUrl() {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${base}/api/auth/me`;
}

export async function bootstrapAuth() {
  const token = localStorage.getItem('tiver_token');
  if (!token) return;

  try {
    const res = await fetch(meUrl(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('unauthorized');
    const user = await res.json();
    setSession({ mode: 'user', user, token });
  } catch {
    localStorage.removeItem('tiver_token');
    setSession({ mode: 'guest', user: null, token: null });
  }
}
