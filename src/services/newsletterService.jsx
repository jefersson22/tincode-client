import { apiFetch } from "./apiClient";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error en la solicitud");
  return data;
}

export async function getNewsletterEmailsRequest(page = 1, limit = 6, activeFilter, search = "") {
  const query = new URLSearchParams({ page, limit });
  if (typeof activeFilter === "boolean") {
    query.append("active", activeFilter);
  }
  if (search) {
    query.append("search", search);
  }
  const res = await apiFetch(`/newsletter?${query.toString()}`);
  return handleResponse(res);
}

export async function toggleNewsletterStatusRequest(id, active) {
  const res = await apiFetch(`/newsletter/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return handleResponse(res);
}

export async function deleteNewsletterEmailRequest(id) {
  const res = await apiFetch(`/newsletter/${id}`, { method: "DELETE" });
  return handleResponse(res);
}