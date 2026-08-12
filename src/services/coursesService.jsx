import { apiFetch } from "./apiClient";

export const COURSE_IMAGE_BASE_URL = "http://localhost:3977";

// Helper para obtener la URL formateada de la miniatura
export function getCourseImageUrl(imagePath) {
  if (!imagePath) return null;
  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  let cleanPath = imagePath.replace(/\\/g, "/");
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);

  if (cleanPath.startsWith("uploads/")) {
    return `${COURSE_IMAGE_BASE_URL}/${cleanPath}`;
  }
  if (cleanPath.startsWith("course/")) {
    return `${COURSE_IMAGE_BASE_URL}/uploads/${cleanPath}`;
  }
  return `${COURSE_IMAGE_BASE_URL}/uploads/course/${cleanPath}`;
}

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(
      `Error del servidor (${res.status}): La ruta no devolvió JSON. Verifica que la ruta '/api/v1/course' esté registrada en app.js y que el servidor esté activo.`
    );
  }

  if (!res.ok) {
    throw new Error(data.msg || data.message || "Error en la solicitud");
  }

  return data;
}

export async function getCoursesRequest(page = 1, limit = 6, activeFilter) {
  const query = new URLSearchParams({ page, limit });
  if (typeof activeFilter === "boolean") {
    query.append("active", activeFilter);
  }
  const res = await apiFetch(`/course?${query.toString()}`);
  return handleResponse(res);
}

export async function createCourseRequest(formValues, imageFile) {
  const formData = new FormData();
  formData.append("title", formValues.title);
  formData.append("description", formValues.description);
  formData.append("url", formValues.url);
  formData.append("price", String(formValues.price));
  formData.append("active", String(formValues.active));

  if (formValues.score !== "" && formValues.score !== undefined) {
    formData.append("score", String(formValues.score));
  }
  if (imageFile) {
    formData.append("miniature", imageFile);
  }

  const res = await apiFetch("/course", {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function updateCourseRequest(id, formValues, imageFile) {
  const formData = new FormData();
  formData.append("title", formValues.title);
  formData.append("description", formValues.description);
  formData.append("url", formValues.url);
  formData.append("price", String(formValues.price));

  if (formValues.score !== "" && formValues.score !== undefined) {
    formData.append("score", String(formValues.score));
  }
  if (imageFile) {
    formData.append("miniature", imageFile);
  }

  const res = await apiFetch(`/course/${id}`, {
    method: "PUT",
    body: formData,
  });
  return handleResponse(res);
}

export async function toggleCourseStatusRequest(id, active) {
  const formData = new FormData();
  formData.append("active", String(active));

  const res = await apiFetch(`/course/${id}`, {
    method: "PUT",
    body: formData,
  });
  return handleResponse(res);
}

export async function deleteCourseRequest(id) {
  const res = await apiFetch(`/course/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}