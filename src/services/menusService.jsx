import { apiFetch } from "./apiClient";

async function handleResponse(res) {
  // Si no hay menús, el backend responde 404; lo tratamos como lista vacía
  if (res.status === 404) {
    return [];
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error en la solicitud");
  return data;
}

export async function getMenusRequest(activeFilter) {
  const query = typeof activeFilter === "boolean" ? `?active=${activeFilter}` : "";
  const res = await apiFetch(`/menu${query}`);
  return handleResponse(res);
}

export async function createMenuRequest(formValues) {
  const res = await apiFetch("/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formValues),
  });
  return handleResponse(res);
}

export async function updateMenuRequest(id, formValues) {
  const res = await apiFetch(`/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formValues),
  });
  return handleResponse(res);
}

export async function toggleMenuStatusRequest(id, active) {
  const res = await apiFetch(`/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return handleResponse(res);
}

export async function deleteMenuRequest(id) {
  const res = await apiFetch(`/menu/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error al eliminar");
  return data;
}