import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { PostImageUploader } from "./PostImageUploader";
import { usePostValidation } from "./usePostValidation";
import { createPostRequest, updatePostRequest, POST_IMAGE_BASE_URL } from "../../../services/postsService";
import "./PostFormModal.scss";

const emptyForm = {
  title: "",
  content: "",
  path: "",
  imagen: null,
};

function buildInitialForm(post) {
  if (!post) return emptyForm;
  return {
    title: post.title || "",
    content: post.content || "",
    path: post.path || "",
    imagen: post.miniature || null,
  };
}

export function PostFormModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState(() => buildInitialForm(post));
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { errors, validate, clearError } = usePostValidation();

  const isEdit = Boolean(post);
  const [pathTouched, setPathTouched] = useState(false);

  // Toma la API key configurada en .env o "no-api-key" como respaldo
  const tinyApiKey = import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleTitleChange = (value) => {
    handleChange("title", value);
    if (!pathTouched) {
      const slug = value
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      handleChange("path", slug);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const isValid = validate(form, { isEdit });
    if (!isValid) return;

    const imageFile = form.imagen instanceof File ? form.imagen : null;

    try {
      setLoading(true);
      if (isEdit) {
        await updatePostRequest(post._id, form, imageFile);
      } else {
        await createPostRequest(form, imageFile);
      }
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const existingImageUrl =
    isEdit && typeof form.imagen === "string"
      ? `${POST_IMAGE_BASE_URL}/${form.imagen}`
      : null;

  return (
    <div className="post-modal-overlay">
      <div className="post-modal">
        <div className="post-modal_header">
          <h2>{isEdit ? "Editar post" : "Nuevo post"}</h2>
          <button type="button" onClick={onClose} className="post-modal_close">X</button>
        </div>
        <form onSubmit={handleSubmit} className="post-modal_body">
          {apiError && <div className="post-modal_api-error">{apiError}</div>}

          <PostImageUploader
            value={form.imagen}
            onChange={(file) => handleChange("imagen", file)}
            error={errors.imagen}
            existingImageUrl={existingImageUrl}
          />

          <div className="post-modal_field">
            <label>Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ej: 5 nuevas funciones increíbles de Next.js"
              className={errors.title ? "has-error" : ""}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="post-modal_field">
            <label>
              Path (slug) <span className="muted">- usado en la URL del post</span>
            </label>
            <input
              type="text"
              value={form.path}
              onChange={(e) => {
                setPathTouched(true);
                handleChange("path", e.target.value);
              }}
              placeholder="ej-mi-nuevo-post"
              className={errors.path ? "has-error" : ""}
            />
            {errors.path && <p className="field-error">{errors.path}</p>}
          </div>

          <div className="post-modal_field">
            <label>Contenido</label>
            <Editor
              apiKey={tinyApiKey}
              value={form.content}
              onEditorChange={(content) => handleChange("content", content)}
              init={{
                height: 350,
                menubar: false,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "charmap", 
                  "preview", "anchor", "searchreplace", "visualblocks", 
                  "code", "fullscreen", "insertdatetime", "media", 
                  "table", "wordcount"
                ],
                toolbar:
                  "undo redo | blocks | bold italic underline | " +
                  "alignleft aligncenter alignright | bullist numlist | " +
                  "link image | code fullscreen",
                content_style: "body { font-family: Inter, sans-serif; font-size: 15px }",
              }}
            />
            {errors.content && <p className="field-error">{errors.content}</p>}
          </div>

          <div className="post-modal_actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}