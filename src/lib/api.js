const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function api(path, options = {}) {
  const url = `${base}/api${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = localStorage.getItem('tiver_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'request_failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
