import { useRef, useMemo, useEffect } from "react";
import "./PostImageUploader.scss";

export function PostImageUploader({ value, onChange, error, existingImageUrl }) {
  const inputRef = useRef(null);

  const preview = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    if (existingImageUrl) return existingImageUrl;
    return null;
  }, [value, existingImageUrl]);

  useEffect(() => {
    if (!(value instanceof File) || !preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [value, preview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="post-image-uploader">
      <label className="post-image-uploader_label">Imagen de portada</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`post-image-uploader_dropzone ${error ? "has-error" : ""}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Vista previa del post" />
            <button
              type="button"
              onClick={handleRemove}
              className="post-image-uploader_remove notranslate"
              translate="no"
              title="Quitar imagen"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="post-image-uploader_placeholder">
            <span className="icon">📷</span>
            <span className="text">Haz clic para subir una imagen</span>
            <span className="hint">JPG, PNG o WEBP máx. 10MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="post-image-uploader_input"
      />
      {error && <p className="post-image-uploader_error">{error}</p>}
    </div>
  );
}