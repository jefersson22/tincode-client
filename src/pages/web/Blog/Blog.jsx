import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPostsRequest, POST_IMAGE_BASE_URL } from "../../../services/postsService";
import "./Blog.scss";

const ITEMS_PER_PAGE = 6;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Blog() {
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostsRequest(currentPage, ITEMS_PER_PAGE);
        setPosts(data.docs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tc-blog-page">
      <div className="tc-blog-page_header">
        <span className="tc-blog-page_eyebrow">// blog</span>
        <h1>Blog</h1>
        <p>
          Artículos escritos por desarrolladores reales sobre lo que
          realmente usamos día a día.
        </p>
      </div>

      <div className="tc-blog-page_inner">
        {loading && <p className="tc-blog-page__state">Cargando artículos...</p>}
        
        {!loading && error && (
          <p className="tc-blog-page__state tc-blog-page__state--error">
            {error}
          </p>
        )}
        
        {!loading && !error && posts.length === 0 && (
          <p className="tc-blog-page__state">
            Todavía no hay artículos publicados. Vuelve pronto.
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="tc-blog-grid">
            {posts.map((post) => (
              <Link key={post._id} to={`/blog/${post.path || post._id}`} className="tc-post-item">
                <div className="tc-post-item_image">
                  {post.miniature ? (
                    <img
                      src={`${POST_IMAGE_BASE_URL}/${post.miniature}`}
                      alt={post.title}
                    />
                  ) : (
                    <div className="tc-post-item_placeholder"></div>
                  )}
                </div>
                
                <div className="tc-post-item_body">
                  <span className="tc-post-item_date">
                    {formatDate(post.created_at)}
                  </span>
                  <h3>{post.title || "(Sin título)"}</h3>
                  <p>{stripHtml(post.content).slice(0, 120)}...</p>
                  <span className="tc-post-item__cta">Leer más →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="tc-blog-pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            <div className="tc-blog-pagination_pages">
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
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}