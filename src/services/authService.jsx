const API_URL = 'http://localhost:3977/api/v1';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.message || 'Error en la solicitud');
  }
  return data;
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res); // { msg, access, refresh }
}

export async function registerRequest(userData) {
  const { firstname, lastname, firstName, lastName, email, password } = userData || {};

  const body = {
    firstname: firstname || firstName || '',
    lastname: lastname || lastName || '',
    email,
    password,
  };

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(res); // { msg, user }
}

export async function refreshAccessTokenRequest(refreshToken) {
  const res = await fetch(`${API_URL}/auth/refresh_access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: refreshToken }),
  });
  return handleResponse(res); // { accessToken }
}