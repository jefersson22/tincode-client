import { useState, useEffect, useMemo } from "react";
import {
  getUsersRequest,
  toggleUserStatusRequest,
  deleteUserRequest,
  getAvatarUrl,
} from "../../../services/usersService";
import { UserFormModal } from "./UserFormModal";
import { usePermissions } from "../../../hooks/usePermissions";
import "./Users.scss";

const USERS_PER_PAGE = 6;

// Subcomponente para renderizar el Avatar con manejo de error de carga
function UserAvatar({ avatar, firstname }) {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getAvatarUrl(avatar);
  const initial = firstname?.charAt(0)?.toUpperCase() || "U";

  if (!avatarUrl || hasError) {
    return <span>{initial}</span>;
  }

  return (
    <img
      src={avatarUrl}
      alt={firstname || "Avatar"}
      onError={() => setHasError(true)}
    />
  );
}

export function Users() {
  const { hasRole } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersRequest();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (filter === "active") return u.active;
        if (filter === "inactive") return !u.active;
        return true;
      })
      .filter((u) => {
        const term = search.toLowerCase();
        return (
          u.firstname?.toLowerCase().includes(term) ||
          u.lastname?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      });
  }, [users, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatusRequest(user._id, !user.active);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, active: !u.active } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserRequest(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaved = (savedUser) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u._id === savedUser._id);
      return exists
        ? prev.map((u) => (u._id === savedUser._id ? savedUser : u))
        : [savedUser, ...prev];
    });
    setModalOpen(false);
  };

  return (
    <div className="users-page">
      <div className="users-page_toolbar">
        <div className="users-page_filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
          >
            Todos <span>{users.length}</span>
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => {
              setFilter("active");
              setCurrentPage(1);
            }}
          >
            Activos <span>{users.filter((u) => u.active).length}</span>
          </button>
          <button
            className={filter === "inactive" ? "active" : ""}
            onClick={() => {
              setFilter("inactive");
              setCurrentPage(1);
            }}
          >
            Inactivos <span>{users.filter((u) => !u.active).length}</span>
          </button>
        </div>

        <div className="users-page_actions">
          <div className="users-page_search-wrapper">
            <svg
              className="users-page_search-icon"
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
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="users-page_search"
            />
          </div>
          {hasRole("admin") && (
            <button className="users-page_new-btn" onClick={openCreateModal}>
              + Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {loading && <p className="users-page_state">Cargando usuarios...</p>}
      {error && <p className="users-page_state users-page_state--error">{error}</p>}
      {!loading && !error && filteredUsers.length === 0 && (
        <p className="users-page_state">No se encontraron usuarios.</p>
      )}

      <div className="users-grid">
        {paginatedUsers.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-card_top">
              <div className="user-card_avatar">
                <UserAvatar avatar={user.avatar} firstname={user.firstname} />
              </div>
              <span
                className={`user-card_status ${
                  user.active ? "user-card_status--active" : "user-card_status--inactive"
                }`}
              >
                {user.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <h3 className="user-card_name">
              {user.firstname} {user.lastname}
            </h3>
            <p className="user-card_email">{user.email}</p>
            <span className={`user-card_role user-card_role--${user.role}`}>
              {user.role}
            </span>

            {hasRole("admin") && (
              <div className="user-card_actions">
                <button onClick={() => openEditModal(user)} title="Editar">✏️</button>
                <button onClick={() => handleToggleStatus(user)} title="Activar/Desactivar">
                  {user.active ? "🔒" : "🔓"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(user._id)}
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

      {!loading && filteredUsers.length > 0 && (
        <div className="users-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="users-pagination_nav"
          >
            ← Anterior
          </button>
          <div className="users-pagination_pages">
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
            className="users-pagination_nav"
          >
            Siguiente →
          </button>
        </div>
      )}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmDeleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Eliminar este usuario? Esta acción no se puede deshacer.</p>
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