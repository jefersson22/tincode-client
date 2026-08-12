const API_URL = import.meta.env.VITE_API_URL || 'https://tincode-server-8c99.onrender.com/api/V1';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const refreshToken =
    localStorage.getItem('refreshToken') || localStorage.getItem('refresh');
  if (!refreshToken) throw new Error('No hay refresh token');

  const res = await fetch(`${API_URL}/auth/refresh_access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: refreshToken }),
  });

  if (!res.ok) throw new Error('No se pudo renovar la sesión');

  const data = await res.json();
  const newToken = data.accessToken || data.access;

  if (newToken) {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('access', newToken);
  }
  return newToken;
}

export async function apiFetch(endpoint, options = {}) {
  const accessToken =
    localStorage.getItem('accessToken') || localStorage.getItem('access');

  const doFetch = (token) => {
    const isFormData = options.body instanceof FormData;
    const headers = { ...(options.headers || {}) };

    // Si enviamos imágenes (FormData), eliminamos estrictamente cualquier 'Content-Type'
    // para permitir que el navegador agregue 'multipart/form-data' con su propio boundary
    if (isFormData) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    } else if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await doFetch(accessToken);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);
        response = await doFetch(newToken);
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refresh');
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
        throw err;
      }
    } else {
      response = await new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          resolve(doFetch(newToken));
        });
      });
    }
  }

  return response;
}