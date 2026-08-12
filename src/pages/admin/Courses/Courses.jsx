import { useState, useEffect } from "react";
import {
  getCoursesRequest,
  toggleCourseStatusRequest,
  deleteCourseRequest,
  getCourseImageUrl,
} from "../../../services/coursesService";
import { CourseFormModal } from "./CourseFormModal";
import { usePermissions } from "../../../hooks/usePermissions";
import "./Courses.scss";

const ITEMS_PER_PAGE = 6;

export function Courses() {
  const { hasRole } = usePermissions();
  const canManage = hasRole("editor") || hasRole("admin");

  const [courses, setCourses] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const activeFilterValue =
    filter === "active" ? true : filter === "inactive" ? false : undefined;

  const loadCourses = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoursesRequest(page, ITEMS_PER_PAGE, activeFilterValue);
      setCourses(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setTotalDocs(data.totalDocs || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses(currentPage);
  }, [currentPage, filter]);

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const changeFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleToggleStatus = async (course) => {
    try {
      await toggleCourseStatusRequest(course._id, !course.active);
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, active: !c.active } : c))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourseRequest(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setConfirmDeleteId(null);
      loadCourses(currentPage);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    loadCourses(currentPage);
  };

  return (
    <div className="courses-page notranslate" translate="no">
      <div className="courses-page_toolbar">
        <div className="courses-page_filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => changeFilter("all")}
          >
            Todos
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

        <div className="courses-page_actions">
          <div className="courses-page_search-wrapper">
            <svg
              className="courses-page_search-icon"
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
              placeholder="Buscar por nombre de curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="courses-page_search"
            />
          </div>
          {canManage && (
            <button className="courses-page_new-btn" onClick={openCreateModal}>
              + Nuevo curso
            </button>
          )}
        </div>
      </div>

      {loading && <p className="courses-page_state">Cargando cursos...</p>}
      {error && (
        <p className="courses-page_state courses-page_state--error">{error}</p>
      )}
      {!loading && !error && filteredCourses.length === 0 && (
        <p className="courses-page_state">No se encontraron cursos.</p>
      )}
      {!loading && !error && (
        <p className="courses-page_total">
          {`${totalDocs} curso${totalDocs !== 1 ? "s" : ""} en total`}
        </p>
      )}

      <div className="courses-grid">
        {filteredCourses.map((course) => {
          const imageUrl = getCourseImageUrl(course.miniature);
          return (
            <div key={course._id} className="course-card">
              <div className="course-card_image">
                {imageUrl ? (
                  <img src={imageUrl} alt={course.title} />
                ) : (
                  <div className="course-card_image-placeholder">📚</div>
                )}
                <span
                  className={`course-card_status ${
                    course.active
                      ? "course-card_status--active"
                      : "course-card_status--inactive"
                  }`}
                >
                  {course.active ? "Activo" : "Inactivo"}
                </span>
                {course.score !== undefined && course.score !== null && (
                  <span className="course-card_score">⭐ {course.score}</span>
                )}
              </div>

              <div className="course-card_body">
                <h3 className="course-card_title">{course.title}</h3>
                <p className="course-card_description">{course.description}</p>
                <div className="course-card_meta">
                  <span className="price">S/ {course.price}</span>
                  {course.url && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="course-card_link"
                    >
                      Ver enlace
                    </a>
                  )}
                </div>

                {canManage && (
                  <div className="course-card_actions">
                    <button onClick={() => openEditModal(course)} title="Editar">
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleStatus(course)}
                      title="Activar/Desactivar"
                    >
                      {course.active ? "🔒" : "🔓"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(course._id)}
                      title="Eliminar"
                      className="danger"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && totalPages > 1 && (
        <div className="courses-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="courses-pagination_nav"
          >
            ← Anterior
          </button>
          <div className="courses-pagination_pages">
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
            className="courses-pagination_nav"
          >
            Siguiente →
          </button>
        </div>
      )}

      {modalOpen && (
        <CourseFormModal
          course={editingCourse}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmDeleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Eliminar este curso? Esta acción no se puede deshacer.</p>
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