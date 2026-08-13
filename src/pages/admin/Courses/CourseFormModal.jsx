import { useState, useEffect } from "react";
import { createCourseRequest, updateCourseRequest } from "../../../services/coursesService";
import { CourseImageUploader } from "./CourseImageUploader";
import "./CourseFormModal.scss";

export function CourseFormModal({ course, onClose, onSaved }) {
  const isEditing = Boolean(course);

  // 1. Estado inicial con cadenas vacías "" para no forzar el 0
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    url: course?.url || "",
    price: course?.price !== undefined && course?.price !== null ? course.price : "",
    score: course?.score !== undefined && course?.score !== null ? course.score : "",
    active: course?.active ?? true,
  });

  const [miniatureFile, setMiniatureFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        url: course.url || "",
        price: course.price !== undefined && course.price !== null ? course.price : "",
        score: course.score !== undefined && course.score !== null ? course.score : "",
        active: course.active ?? true,
      });
    }
  }, [course]);

  // 2. Manejo flexible de inputs manteniendo texto libre mientras escribe
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("url", formData.url);
      
      // 3. Conversión limpia antes de enviar al servidor
      data.append("price", formData.price === "" ? 0 : Number(formData.price));

      if (formData.score !== "") {
        data.append("score", Number(formData.score));
      }

      data.append("active", formData.active);

      if (miniatureFile) {
        data.append("miniature", miniatureFile);
      }

      if (isEditing) {
        await updateCourseRequest(course._id, data);
      } else {
        await createCourseRequest(data);
      }

      onSaved();
    } catch (err) {
      setErrorMessage(err.message || "Error al guardar el curso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="course-modal-overlay">
      <div className="course-modal-box">
        <div className="course-modal-header">
          <h2>{isEditing ? "Editar curso" : "Nuevo curso"}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="course-modal-form">
          <CourseImageUploader
            currentImage={course?.miniature}
            onImageSelect={(file) => setMiniatureFile(file)}
          />

          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              name="title"
              placeholder="Ej. Introducción a React"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              placeholder="Breve descripción del curso"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Enlace (URL)</label>
            <input
              type="text"
              name="url"
              placeholder="https://..."
              value={formData.url}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            {/* 4. Inputs de precio y calificación sin 0 predeterminado */}
            <div className="form-group">
              <label>Precio (S/)</label>
              <input
                type="number"
                name="price"
                placeholder="Ej. 35"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Calificación (0-5)</label>
              <input
                type="number"
                name="score"
                placeholder="Ej. 5"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group-checkbox">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Activar de inmediato
            </label>
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <div className="course-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Guardando..." : isEditing ? "Actualizar curso" : "Crear curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}