import { useState, useEffect } from "react";
import {
  getPostsRequest,
  deletePostRequest,
  getPostImageUrl,
} from "../../../services/postsService";
import { PostFormModal } from "./PostFormModal";
import { usePermissions } from "../../../hooks/usePermissions";
import "./Blog.scss";

const ITEMS_PER_PAGE = 6;

export function Blog() {
  const { hasRole } = usePermissions();
  const canManage = hasRole("editor") || hasRole("admin");

  const [posts, setPosts] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const loadPosts = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPostsRequest(page, ITEMS_PER_PAGE);
      setPosts(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setTotalDocs(data.totalDocs || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    loadPosts(currentPage);
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deletePostRequest(id);
      setConfirmDeleteId(null);
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadPosts(currentPage);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "");

  const handleImageError = (postId) => {
    setFailedImages((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="posts-page">
      <div className="posts-page_toolbar">
        <p className="posts-page_total">
          {totalDocs} post{totalDocs !== 1 ? "s" : ""} en total
        </p>
        <div className="posts-page_actions">
          <div className="posts-page_search-wrapper">
            <svg
              className="posts-page_search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="posts-page_search"
            />
          </div>
          {canManage && (
            <button className="posts-page_new-btn" onClick={openCreateModal}>
              + Nuevo post
            </button>
          )}
        </div>
      </div>

      {loading && <p className="posts-page_state">Cargando posts...</p>}
      {error && <p className="posts-page_state posts-page_state--error">{error}</p>}
      
      {!loading && !error && filteredPosts.length === 0 && (
        <p className="posts-page_state">No se encontraron posts.</p>
      )}

      <div className="posts-grid">
        {filteredPosts.map((post) => {
          const imageUrl = getPostImageUrl(post.miniature);
          const isImageBroken = failedImages[post._id];

          return (
            <div key={post._id} className="post-card">
              <div className="post-card_image">
                {post.miniature && imageUrl && !isImageBroken ? (
                  <img
                    src={imageUrl}
                    alt={post.title || "Imagen del post"}
                    onError={() => handleImageError(post._id)}
                  />
                ) : (
                  <div className="post-card_image-placeholder">📄</div>
                )}
              </div>
              <div className="post-card_body">
                <h3 className="post-card_title">{post.title || "(Sin título)"}</h3>
                <p className="post-card_excerpt">
                  {stripHtml(post.content).slice(0, 110)}
                  {stripHtml(post.content).length > 110 ? "..." : ""}
                </p>
                <span className="post-card_date">{formatDate(post.created_at)}</span>
              </div>
              {canManage && (
                <div className="post-card_actions">
                  <button onClick={() => openEditModal(post)} title="Editar">✏️</button>
                  <button
                    onClick={() => setConfirmDeleteId(post._id)}
                    title="Eliminar"
                    className="danger"
                    disabled={deletingId === post._id}
                  >
                    {deletingId === post._id ? "..." : "🗑️"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!loading && totalPages > 1 && (
        <div className="posts-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="posts-pagination_nav"
          >
            ← Anterior
          </button>
          <div className="posts-pagination_pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={page === currentPage ? "active" : ""}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="posts-pagination_nav"
          >
            Siguiente →
          </button>
        </div>
      )}

      {modalOpen && (
        <PostFormModal
          post={editingPost}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmDeleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Eliminar este post? Esta acción no se puede deshacer.</p>
            <div className="confirm-box_actions">
              <button onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button
                className="danger"
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}