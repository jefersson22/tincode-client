import { useState } from "react";
import { createUserRequest, updateUserRequest, AVATAR_BASE_URL } from "../../../services/usersService";
import "./UserFormModal.scss";

// Formatea la URL del avatar garantizando la ruta estática /uploads/
const formatAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("blob:") || avatarPath.startsWith("data:") || avatarPath.startsWith("http")) {
    return avatarPath;
  }
  let cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  if (!cleanPath.startsWith("/uploads/")) {
    cleanPath = cleanPath.startsWith("/avatar/") ? `/uploads${cleanPath}` : `/uploads/avatar${cleanPath}`;
  }
  return `${AVATAR_BASE_URL}${cleanPath}`;
};

export function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = !!user;

  const [formValues, setFormValues] = useState({
    firstname: user?.firstname || user?.firstName || "",
    lastname: user?.lastname || user?.lastName || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "user",
    active: user?.active ?? true,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(formatAvatarUrl(user?.avatar));
  const [imageError, setImageError] = useState(false);
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setImageError(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formValues.firstname.trim()) newErrors.firstname = "Requerido";
    if (!formValues.lastname.trim()) newErrors.lastname = "Requerido";
    if (!formValues.email.trim()) newErrors.email = "Requerido";
    if (!isEdit && !formValues.password) newErrors.password = "Requerido";
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
        ? await updateUserRequest(user._id, formValues, avatarFile)
        : await createUserRequest(formValues, avatarFile);
      onSaved(saved);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal_header">
          <h2>{isEdit ? "Editar usuario" : "Nuevo usuario"}</h2>
          <button type="button" className="user-modal_close" onClick={onClose}>X</button>
        </div>
        <form onSubmit={handleSubmit} className="user-modal_form">
          <div className="user-modal_avatar-section">
            <label htmlFor="avatar-input" className="user-modal_avatar-preview">
              {avatarPreview && !imageError ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{formValues.firstname.charAt(0).toUpperCase() || "U"}</span>
              )}
              <div className="user-modal_avatar-overlay">Cambiar</div>
            </label>
            <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </div>

          <div className="user-modal_row">
            <div className="user-modal_field">
              <label>Nombre</label>
              <input name="firstname" value={formValues.firstname} onChange={handleChange} className={errors.firstname ? "input-error" : ""} />
              {errors.firstname && <span className="field-error">{errors.firstname}</span>}
            </div>
            <div className="user-modal_field">
              <label>Apellido</label>
              <input name="lastname" value={formValues.lastname} onChange={handleChange} className={errors.lastname ? "input-error" : ""} />
              {errors.lastname && <span className="field-error">{errors.lastname}</span>}
            </div>
          </div>

          <div className="user-modal_field">
            <label>Correo electrónico</label>
            <input type="email" name="email" value={formValues.email} onChange={handleChange} disabled={isEdit} className={errors.email ? "input-error" : ""} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {!isEdit ? (
            <div className="user-modal_field">
              <label>Contraseña</label>
              <input type="password" name="password" value={formValues.password} onChange={handleChange} className={errors.password ? "input-error" : ""} />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          ) : (
            <div className="user-modal_field">
              <label>Nueva contraseña (opcional)</label>
              <input type="password" name="password" value={formValues.password} onChange={handleChange} placeholder="Dejar en blanco para no cambiarla" />
            </div>
          )}

          <div className="user-modal_row">
            <div className="user-modal_field">
              <label>Rol</label>
              <select name="role" value={formValues.role} onChange={handleChange}>
                <option value="user">Usuario</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {!isEdit && (
              <div className="user-modal_field user-modal_field--checkbox">
                <label>
                  <input type="checkbox" name="active" checked={formValues.active} onChange={handleChange} />
                  Activar de inmediato
                </label>
              </div>
            )}
          </div>

          {serverError && <p className="user-modal_error">{serverError}</p>}

          <div className="user-modal_footer">
            <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}