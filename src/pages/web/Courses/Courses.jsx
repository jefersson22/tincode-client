import { useState, useEffect } from "react";
import { getCoursesRequest, getCourseImageUrl } from "../../../services/coursesService";
import "./Courses.scss";

const ITEMS_PER_PAGE = 6;

// Helper para asegurar que la URL sea un enlace externo válido y no rompa React Router
function formatCourseUrl(url) {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
}

export function Courses() {
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCoursesRequest(currentPage, ITEMS_PER_PAGE, true);
        setCourses(data.docs || data.courses || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || "Error al cargar los cursos");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage]);

  const handleImageError = (courseId) => {
    setFailedImages((prev) => ({ ...prev, [courseId]: true }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tc-courses-page">
      <div className="tc-courses-page_header">
        <span className="tc-courses-page_eyebrow">// cursos</span>
        <h1>Nuestros cursos</h1>
        <p>
          Aprende con proyectos reales, a tu ritmo, con contenido que se
          mantiene al día con la industria.
        </p>
      </div>

      <div className="tc-courses-page_inner">
        {loading && <p className="tc-courses-page__state">Cargando cursos...</p>}
        
        {!loading && error && (
          <p className="tc-courses-page__state tc-courses-page__state--error">
            {error}
          </p>
        )}
        
        {!loading && !error && courses.length === 0 && (
          <p className="tc-courses-page__state">
            Todavía no hay cursos publicados. Vuelve pronto.
          </p>
        )}
        
        {!loading && !error && courses.length > 0 && (
          <div className="tc-courses-grid">
            {courses.map((course) => {
              const imageUrl = getCourseImageUrl(course.miniature);
              const isImageBroken = failedImages[course._id];

              return (
                <div key={course._id} className="tc-course-item">
                  <div className="tc-course-item_image">
                    {course.miniature && imageUrl && !isImageBroken ? (
                      <img
                        src={imageUrl}
                        alt={course.title || "Curso"}
                        onError={() => handleImageError(course._id)}
                      />
                    ) : (
                      <div className="tc-course-item_placeholder"></div>
                    )}
                    {course.score !== undefined && course.score !== null && (
                      <span className="tc-course-item_score">
                        ★ {course.score}
                      </span>
                    )}
                  </div>
                  
                  <div className="tc-course-item_body">
                    <h3>{course.title || "(Sin título)"}</h3>
                    <p>{course.description || "Sin descripción disponible."}</p>
                    <div className="tc-course-item_footer">
                      <span className="tc-course-item_price">
                        S/ {course.price ?? 0}
                      </span>
                      {course.url ? (
                        <a
                          href={formatCourseUrl(course.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="tc-course-item__cta"
                        >
                          Ver curso →
                        </a>
                      ) : (
                        <span className="tc-course-item__cta tc-course-item__cta--disabled">
                          Próximamente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="tc-courses-pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            <div className="tc-courses-pagination_pages">
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
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}