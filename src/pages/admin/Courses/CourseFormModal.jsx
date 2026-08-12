import { useState } from "react";
import {
  createCourseRequest,
  updateCourseRequest,
  getCourseImageUrl,
} from "../../../services/coursesService";
import "./CourseFormModal.scss";

export function CourseFormModal({ course, onClose, onSaved }) {
  const isEdit = !!course;

  const [formValues, setFormValues] = useState({
    title: course?.title || "",
    description: course?.description || "",
    url: course?.url || "",
    price: course?.price ?? 0,
    score: course?.score ?? "",
    active: course?.active ?? true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    getCourseImageUrl(course?.miniature)
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const newErrors = {};
    if (!formValues.title.trim()) newErrors.title = "Requerido";
    if (!formValues.description.trim()) newErrors.description = "Requerido";
    if (!formValues.url.trim()) newErrors.url = "Requerido";
    if (formValues.price === "" || Number(formValues.price) < 0) {
      newErrors.price = "Precio inválido";
    }
    if (!isEdit && !imageFile) newErrors.image = "La miniatura es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const saved = isEdit
        ? await updateCourseRequest(course._id, formValues, imageFile)
        : await createCourseRequest(formValues, imageFile);
      onSaved(saved);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-modal-overlay" onClick={onClose}>
      <div className="course-modal" onClick={(e) => e.stopPropagation()}>
        <div className="course-modal_header">
          <h2>{isEdit ? "Editar curso" : "Nuevo curso"}</h2>
          <button type="button" className="course-modal_close" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-modal_form">
          <div className="course-modal_image-section">
            <label htmlFor="course-image-input" className="course-modal_image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Curso" />
              ) : (
                <span>📷</span>
              )}
              <div className="course-modal_image-overlay">Cambiar miniatura</div>
            </label>
            <input
              id="course-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </div>
          {errors.image && (
            <span className="field-error" style={{ textAlign: "center" }}>
              {errors.image}
            </span>
          )}

          <div className="course-modal_field">
            <label>Título</label>
            <input
              name="title"
              value={formValues.title}
              onChange={handleChange}
              placeholder="Ej. Introducción a React"
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="course-modal_field">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descripción del curso"
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="course-modal_field">
            <label>Enlace (URL)</label>
            <input
              name="url"
              value={formValues.url}
              onChange={handleChange}
              placeholder="https://..."
              className={errors.url ? "input-error" : ""}
            />
            {errors.url && <span className="field-error">{errors.url}</span>}
          </div>

          <div className="course-modal_row">
            <div className="course-modal_field">
              <label>Precio (S/)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formValues.price}
                onChange={handleChange}
                className={errors.price ? "input-error" : ""}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="course-modal_field">
              <label>Calificación (0-5)</label>
              <input
                type="number"
                name="score"
                min="0"
                max="5"
                step="0.1"
                value={formValues.score}
                onChange={handleChange}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="course-modal_field course-modal_field--checkbox">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formValues.active}
                  onChange={handleChange}
                />
                Activar de inmediato
              </label>
            </div>
          )}

          {serverError && <p className="course-modal_error">{serverError}</p>}

          <div className="course-modal_footer">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}