import { apiFetch } from "./apiClient";

const BASE_SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:3977").replace(/\/api(\/v\d+)?\/?$/, "");
export const POST_IMAGE_BASE_URL = `${BASE_SERVER_URL}/uploads/post`;

export function getPostImageUrl(miniature) {
  if (!miniature || typeof miniature !== "string") return null;

  if (miniature.startsWith("http") || miniature.startsWith("blob:") || miniature.startsWith("data:")) {
    return miniature;
  }

  let path = miniature.replace(/\\/g, "/");
  if (path.startsWith("/")) path = path.slice(1);

  if (path.startsWith("uploads/")) {
    return `${BASE_SERVER_URL}/${path}`;
  }
  if (path.startsWith("post/")) {
    return `${BASE_SERVER_URL}/uploads/${path}`;
  }
  return `${POST_IMAGE_BASE_URL}/${path}`;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error en la solicitud");
  return data;
}

export async function getPostsRequest(page = 1, limit = 6) {
  const query = new URLSearchParams({ page, limit });
  const res = await apiFetch(`/post?${query.toString()}`);
  return handleResponse(res);
}

export async function getPostByPathRequest(path) {
  const query = new URLSearchParams({ path });
  const res = await apiFetch(`/post/path?${query.toString()}`);
  return handleResponse(res);
}

export async function createPostRequest(formValues, imageFile) {
  const formData = new FormData();
  formData.append("title", formValues.title);
  formData.append("content", formValues.content);
  formData.append("path", formValues.path);
  
  if (imageFile) formData.append("miniature", imageFile);
  
  const res = await apiFetch("/post", { method: "POST", body: formData });
  return handleResponse(res);
}

export async function updatePostRequest(id, formValues, imageFile) {
  const formData = new FormData();
  formData.append("title", formValues.title);
  formData.append("content", formValues.content);
  formData.append("path", formValues.path);
  
  if (imageFile) formData.append("miniature", imageFile);
  
  const res = await apiFetch(`/post/${id}`, { method: "PATCH", body: formData });
  return handleResponse(res);
}

export async function deletePostRequest(id) {
  const res = await apiFetch(`/post/${id}`, { method: "DELETE" });
  return handleResponse(res);
}