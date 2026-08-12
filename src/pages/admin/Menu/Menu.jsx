import { useState, useEffect, useMemo } from "react";
import {
  getMenusRequest,
  toggleMenuStatusRequest,
  deleteMenuRequest,
} from "../../../services/menusService";
import { MenuFormModal } from "./MenuFormModal";
import { usePermissions } from "../../../hooks/usePermissions";
import "./Menu.scss";

const ITEMS_PER_PAGE = 6;

export function Menu() {
  const { hasRole } = usePermissions();
  const canManage = hasRole("editor") || hasRole("admin");

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenusRequest();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const filteredMenus = useMemo(() => {
    return menus
      .filter((item) => {
        if (filter === "active") return item.active;
        if (filter === "inactive") return !item.active;
        return true;
      })
      .filter((item) => {
        const term = search.toLowerCase();
        const title = item.title || item.name || "";
        const path = item.path || item.url || "";
        return (
          title.toLowerCase().includes(term) ||
          path.toLowerCase().includes(term)
        );
      });
  }, [menus, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMenus.length / ITEMS_PER_PAGE));

  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMenus.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMenus, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openCreateModal = () => {
    setEditingMenu(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingMenu(item);
    setModalOpen(true);
  };

  const handleToggleStatus = async (item) => {
    try {
      await toggleMenuStatusRequest(item._id, !item.active);
      setMenus((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, active: !m.active } : m))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuRequest(id);
      setMenus((prev) => prev.filter((m) => m._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaved = (savedMenu) => {
    setMenus((prev) => {
      const exists = prev.some((m) => m._id === savedMenu._id);
      return exists
        ? prev.map((m) => (m._id === savedMenu._id ? savedMenu : m))
        : [savedMenu, ...prev];
    });
    setModalOpen(false);
  };

  return (
    <div className="menu-page notranslate" translate="no">
      <div className="menu-page_toolbar">
        <div className="menu-page_filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
          >
            Todos <span>{menus.length}</span>
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => {
              setFilter("active");
              setCurrentPage(1);
            }}
          >
            Activos <span>{menus.filter((m) => m.active).length}</span>
          </button>
          <button
            className={filter === "inactive" ? "active" : ""}
            onClick={() => {
              setFilter("inactive");
              setCurrentPage(1);
            }}
          >
            Inactivos <span>{menus.filter((m) => !m.active).length}</span>
          </button>
        </div>

        <div className="menu-page_actions">
          <div className="menu-page_search-wrapper">
            <svg
              className="menu-page_search-icon"
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
              placeholder="Buscar por nombre o enlace..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="menu-page_search"
            />
          </div>
          {canManage && (
            <button className="menu-page_new-btn" onClick={openCreateModal}>
              + Nuevo ítem
            </button>
          )}
        </div>
      </div>

      {loading && <p className="menu-page_state">Cargando menú...</p>}
      {error && <p className="menu-page_state menu-page_state--error">{error}</p>}
      {!loading && !error && filteredMenus.length === 0 && (
        <p className="menu-page_state">No se encontraron ítems de menú.</p>
      )}

      <div className="menu-grid">
        {paginatedMenus.map((item) => (
          <div key={item._id} className="menu-card">
            <div className="menu-card_top">
              <span className="menu-card_order">#{item.order ?? 0}</span>
              <span
                className={`menu-card_status ${
                  item.active ? "menu-card_status--active" : "menu-card_status--inactive"
                }`}
              >
                {item.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <h3 className="menu-card_name">{item.title || item.name}</h3>
            <p className="menu-card_url">{item.path || item.url}</p>

            {canManage && (
              <div className="menu-card_actions">
                <button onClick={() => openEditModal(item)} title="Editar">
                  ✏️
                </button>
                <button onClick={() => handleToggleStatus(item)} title="Activar/Desactivar">
                  {item.active ? "🔒" : "🔓"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(item._id)}
                  title="Eliminar"
                  className="danger"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && filteredMenus.length > 0 && (
        <div className="menu-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="menu-pagination_nav"
          >
            ← Anterior
          </button>
          <div className="menu-pagination_pages">
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
            className="menu-pagination_nav"
          >
            Siguiente →
          </button>
        </div>
      )}

      {modalOpen && (
        <MenuFormModal
          menu={editingMenu}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmDeleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Eliminar este ítem de menú? Esta acción no se puede deshacer.</p>
            <div className="confirm-box_actions">
              <button onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className="danger" onClick={() => handleDelete(confirmDeleteId)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}