import { useState, useEffect } from "react";
import {
  getNewsletterEmailsRequest,
  toggleNewsletterStatusRequest,
  deleteNewsletterEmailRequest,
} from "../../../services/newsletterService";
import { usePermissions } from "../../../hooks/usePermissions";
import "./Newsletter.scss";

const ITEMS_PER_PAGE = 6;

export function Newsletter() {
  const { hasRole } = usePermissions();
  const canManage = hasRole("editor") || hasRole("admin");

  const [subscribers, setSubscribers] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const activeFilterValue =
    filter === "active" ? true : filter === "inactive" ? false : undefined;

  const loadSubscribers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNewsletterEmailsRequest(
        page,
        ITEMS_PER_PAGE,
        activeFilterValue,
        search
      );
      const docs = data.subscribers || data.docs || [];
      const total = data.total ?? data.totalDocs ?? docs.length;
      setSubscribers(docs);
      setTotalDocs(total);
      setTotalPages(data.totalPages || Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadSubscribers(1);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const changeFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (subscriber) => {
    try {
      await toggleNewsletterStatusRequest(subscriber._id, !subscriber.active);
      setSubscribers((prev) =>
        prev.map((s) =>
          s._id === subscriber._id ? { ...s, active: !s.active } : s
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteNewsletterEmailRequest(id);
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
      setTotalDocs((prev) => prev - 1);
      setConfirmDeleteId(null);
      
      if (subscribers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
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

  return (
    <div className="newsletter-page notranslate" translate="no">
      <div className="newsletter-page_toolbar">
        <div className="newsletter-page_filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => changeFilter("all")}
          >
            <span>Todos</span>
            {filter === "all" && Boolean(totalDocs) && <span>{totalDocs}</span>}
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => changeFilter("active")}
          >
            Activos
          </button>
          <button
            className={filter === "inactive" ? "active" : ""}
            onClick={() => changeFilter("inactive")}
          >
            Inactivos
          </button>
        </div>
        <div className="newsletter-page_actions">
          <div className="newsletter-page_search-wrapper">
            <svg
              className="newsletter-page_search-icon"
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
              placeholder="Buscar por correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="newsletter-page_search"
            />
          </div>
        </div>
      </div>

      {loading && <p className="newsletter-page_state">Cargando suscriptores...</p>}
      
      {error && (
        <p className="newsletter-page_state newsletter-page_state--error">
          {error}
        </p>
      )}

      {!loading && !error && subscribers.length === 0 && (
        <p className="newsletter-page_state">No se encontraron suscriptores.</p>
      )}

      {!loading && !error && (
        <p className="newsletter-page_total">
          {`${totalDocs} suscriptor${totalDocs !== 1 ? "es" : ""} en total`}
        </p>
      )}

      {!loading && !error && subscribers.length > 0 && (
        <div className="newsletter-table-wrapper">
          <table className="newsletter-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, index) => (
                <tr key={sub._id}>
                  <td className="muted">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="newsletter-table_email">{sub.email}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        sub.active ? "status-badge--active" : "status-badge--inactive"
                      }`}
                    >
                      {sub.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="muted">{formatDate(sub.subscribed_at || sub.createdAt)}</td>
                  {canManage && (
                    <td>
                      <div className="newsletter-table_actions">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          title={sub.active ? "Desactivar" : "Activar"}
                        >
                          {sub.active ? "🔒" : "🔓"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(sub._id)}
                          title="Eliminar"
                          className="danger"
                          disabled={deletingId === sub._id}
                        >
                          {deletingId === sub._id ? "..." : "🗑️"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="newsletter-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="newsletter-pagination_nav"
          >
            ← Anterior
          </button>
          <div className="newsletter-pagination_pages">
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
            className="newsletter-pagination_nav"
          >
            Siguiente →
          </button>
        </div>
      )}

      {confirmDeleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Eliminar este suscriptor? Esta acción no se puede deshacer.</p>
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