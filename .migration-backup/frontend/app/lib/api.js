export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}
