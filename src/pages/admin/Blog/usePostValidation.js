import { useState, useCallback } from "react";

const MAX_IMAGE_SIZE_MB = 3;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PATH_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function usePostValidation() {
  const [errors, setErrors] = useState({});

  const validate = useCallback((form, { isEdit = false } = {}) => {
    const newErrors = {};

    if (!form.title || form.title.trim().length < 5) {
      newErrors.title = "El título debe tener al menos 5 caracteres.";
    } else if (form.title.trim().length > 150) {
      newErrors.title = "El título no puede superar los 150 caracteres.";
    }

    const plainContent = (form.content || "").replace(/<[^>]*>/g, "").trim();
    if (!plainContent || plainContent.length < 20) {
      newErrors.content = "El contenido debe tener al menos 20 caracteres.";
    }

    if (!form.path || form.path.trim() === "") {
      newErrors.path = "El path (slug) es obligatorio.";
    } else if (!PATH_REGEX.test(form.path.trim())) {
      newErrors.path = "Usa solo minúsculas, números y guiones (ej: mi-nuevo-post).";
    }

    if (!isEdit && !form.imagen) {
      newErrors.imagen = "Debes seleccionar una imagen de portada.";
    }

    if (form.imagen instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.includes(form.imagen.type)) {
        newErrors.imagen = "Formato no permitido. Usa JPG, PNG o WEBP.";
      } else if (form.imagen.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        newErrors.imagen = `La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  return { errors, validate, clearError };
}