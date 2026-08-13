import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostByPathRequest, POST_IMAGE_BASE_URL } from "../../../services/postsService";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Helper para detectar URLs absolutas (Cloudinary) o compilar la ruta base
function getImageUrl(miniature) {
  if (!miniature) return null;
  if (miniature.startsWith("http://") || miniature.startsWith("https://")) {
    return miniature;
  }
  return `${POST_IMAGE_BASE_URL}/${miniature}`.replace(/([^:]\/)\/+/g, "$1");
}

export function Post() {
  const { id } = useParams(); // Recibe el path o ID desde la URL (/blog/:id)
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setImageError(false);
      try {
        const data = await getPostByPathRequest(id);
        setPost(data);
      } catch (err) {
        setError(err.message || "No se pudo cargar el artículo");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
        Cargando artículo...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ color: "#0f2c5c", marginBottom: "10px" }}>Artículo no encontrado</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          El artículo que buscas no existe o fue removido.
        </p>
        <Link to="/blog" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
          ← Volver al Blog
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(post.miniature);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px 96px", fontFamily: "Inter, sans-serif" }}>
      <Link
        to="/blog"
        style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
      >
        ← Volver al Blog
      </Link>

      <span style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "12px", fontFamily: "JetBrains Mono, monospace" }}>
        {formatDate(post.created_at)}
      </span>

      <h1 style={{ fontSize: "2.2rem", color: "#0f2c5c", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif", lineHeight: "1.2" }}>
        {post.title}
      </h1>

      {imageUrl && !imageError && (
        <div style={{ 
          marginBottom: "32px", 
          borderRadius: "16px", 
          overflow: "hidden", 
          maxHeight: "450px", 
          background: "#f1f5f9", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center" 
        }}>
          <img
            src={imageUrl}
            alt={post.title}
            onError={() => setImageError(true)}
            style={{ width: "100%", maxHeight: "450px", objectFit: "contain" }}
          />
        </div>
      )}

      <div
        style={{ fontSize: "1.05rem", lineHeight: "1.8", color: "#334155" }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}