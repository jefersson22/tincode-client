import { apiFetch } from "./apiClient";

export const AVATAR_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3977").replace(/\/api(\/v\d+)?\/?$/, "");

export function getAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return null;
  
  if (avatar.startsWith("http") || avatar.startsWith("blob:") || avatar.startsWith("data:")) {
    return avatar;
  }

  let path = avatar.replace(/\\/g, "/");
  if (path.startsWith("/")) path = path.slice(1);

  if (path.startsWith("uploads/")) {
    return `${AVATAR_BASE_URL}/${path}`;
  }
  if (path.startsWith("avatar/")) {
    return `${AVATAR_BASE_URL}/uploads/${path}`;
  }
  return `${AVATAR_BASE_URL}/uploads/avatar/${path}`;
}

function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    firstname: user.firstname || user.firstName || "",
    lastname: user.lastname || user.lastName || "",
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error en la solicitud");
  return data;
}

export async function getUsersRequest(activeFilter) {
  const query = typeof activeFilter === "boolean" ? `?active=${activeFilter}` : "";
  const res = await apiFetch(`/users${query}`);
  const data = await handleResponse(res);
  
  const users = Array.isArray(data.response) ? data.response : [];
  return users.map(normalizeUser);
}

export async function getMeRequest() {
  const res = await apiFetch("/users/me");
  const data = await handleResponse(res);
  return normalizeUser(data.response);
}

export async function createUserRequest(formValues, avatarFile) {
  const formData = new FormData();
  formData.append("firstname", formValues.firstname);
  formData.append("lastname", formValues.lastname);
  formData.append("email", formValues.email);
  formData.append("password", formValues.password);
  formData.append("role", formValues.role);
  formData.append("active", String(formValues.active));
  if (avatarFile) formData.append("avatar", avatarFile);

  const res = await apiFetch("/users", { method: "POST", body: formData });
  const data = await handleResponse(res);
  return normalizeUser(data.user);
}

export async function updateUserRequest(id, formValues, avatarFile) {
  const formData = new FormData();
  formData.append("firstname", formValues.firstname);
  formData.append("lastname", formValues.lastname);
  formData.append("email", formValues.email);
  formData.append("role", formValues.role);
  if (formValues.password) formData.append("password", formValues.password);
  if (avatarFile) formData.append("avatar", avatarFile);

  const res = await apiFetch(`/users/${id}`, { method: "PATCH", body: formData });
  const data = await handleResponse(res);
  return normalizeUser(data.user);
}

export async function toggleUserStatusRequest(id, active) {
  const formData = new FormData();
  formData.append("active", String(active));
  const res = await apiFetch(`/users/${id}`, { method: "PATCH", body: formData });
  const data = await handleResponse(res);
  return normalizeUser(data.user);
}

export async function deleteUserRequest(id) {
  const res = await apiFetch(`/users/${id}`, { method: "DELETE" });
  return handleResponse(res);
}