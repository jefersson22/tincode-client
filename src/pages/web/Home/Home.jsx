import { useState, useEffect } from "react";
import { getCoursesRequest, getCourseImageUrl } from "../../../services/coursesService";
import { getPostsRequest, POST_IMAGE_BASE_URL } from "../../../services/postsService";
import "./Home.scss";

const CODE_SNIPPET = [
  { indent: 0, tokens: [["const", "kw"], [" tincode", "var"], [" = {", "plain"]] },
  { indent: 1, tokens: [["cursos", "prop"], [": ", "plain"], ['"prácticos"', "str"], [",", "plain"]] },
  { indent: 1, tokens: [["mentores", "prop"], [": ", "plain"], ['"devs reales"', "str"], [",", "plain"]] },
  { indent: 1, tokens: [["ritmo", "prop"], [": ", "plain"], ['"a tu manera"', "str"], [",", "plain"]] },
  { indent: 1, tokens: [["precio", "prop"], [": ", "plain"], ['"accesible"', "str"], [",", "plain"]] },
  { indent: 0, tokens: [["};", "plain"]] },
];

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "");
}

export function Home() {
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCoursesRequest(1, 3, true);
        setCourses(data.docs || data.courses || []);
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    })();
    
    (async () => {
      try {
        const data = await getPostsRequest(1, 3);
        setPosts(data.docs || []);
      } catch {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, []);

  return (
    <div className="tc-home">
      {/* ===== HERO ===== */}
      <section className="tc-hero">
        <div className="tc-hero_inner">
          <div className="tc-hero_copy">
            <span className="tc-hero_eyebrow">$ whoami --learn-to-code</span>
            <h1 className="tc-hero_title">
              Aprende a programar.
              <br />
              <span className="tc-hero_title-accent">De verdad.</span>
            </h1>
            <p className="tc-hero_subtitle">
              Cursos prácticos, artículos escritos por desarrolladores reales y una comunidad que avanza al ritmo de la industria no al de un curso grabado hace cinco años.
            </p>
            <div className="tc-hero_actions">
              <a href="/courses" className="tc-hero_cta-primary">
                Empieza gratis
              </a>
              <a href="/blog" className="tc-hero_cta-secondary">
                Leer el blog →
              </a>
            </div>
          </div>
          
          <div className="tc-hero_visual">
            <div className="tc-editor">
              <div className="tc-editor_bar">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
                <span className="tc-editor_filename">tincode.js</span>
              </div>
              <div className="tc-editor_body">
                {CODE_SNIPPET.map((line, i) => (
                  <div
                    key={i}
                    className="tc-editor_line"
                    style={{ paddingLeft: `${line.indent * 20}px` }}
                  >
                    <span className="tc-editor_lineno">{i + 1}</span>
                    {line.tokens.map(([text, cls], j) => (
                      <span key={j} className={`tok tok--${cls}`}>
                        {text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="tc-features">
        <div className="tc-features_inner">
          <div className="tc-feature">
            <span className="tc-feature_mark">01</span>
            <h3>Proyectos, no diapositivas</h3>
            <p>Cada curso se construye alrededor de algo que terminas y publicas.</p>
          </div>
          <div className="tc-feature">
            <span className="tc-feature_mark">02</span>
            <h3>Contenido siempre actual</h3>
            <p>Actualizamos los cursos cuando cambian las herramientas, no cada 3 años.</p>
          </div>
          <div className="tc-feature">
            <span className="tc-feature_mark">03</span>
            <h3>Comunidad activa</h3>
            <p>Resuelve dudas con otros estudiantes y mentores, no con un foro muerto.</p>
          </div>
        </div>
      </section>

      {/* ===== CURSOS DESTACADOS ===== */}
      <section className="tc-section">
        <div className="tc-section_inner">
          <div className="tc-section_header">
            <div>
              <span className="tc-section_eyebrow">// cursos</span>
              <h2>Cursos destacados</h2>
            </div>
            <a href="/courses" className="tc-section_link">
              Ver todos →
            </a>
          </div>
          
          {loadingCourses && <p className="tc-section_state">Cargando cursos...</p>}
          {!loadingCourses && courses.length === 0 && (
            <p className="tc-section_state">
              Todavía no hay cursos publicados. Vuelve pronto.
            </p>
          )}
          {!loadingCourses && courses.length > 0 && (
            <div className="tc-card-grid">
              {courses.map((course) => (
                <a key={course._id} href={`/courses`} className="tc-course-card">
                  <div className="tc-course-card_image">
                    {course.miniature ? (
                      <img
                        src={getCourseImageUrl(course.miniature)}
                        alt={course.title}
                      />
                    ) : (
                      <div className="tc-course-card_placeholder"></div>
                    )}
                    {course.score !== undefined && course.score !== null && (
                      <span className="tc-course-card_score">
                        ★ {course.score}
                      </span>
                    )}
                  </div>
                  <div className="tc-course-card_body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <span className="tc-course-card_price">
                      S/ {course.price}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ÚLTIMOS POSTS ===== */}
      <section className="tc-section tc-section--muted">
        <div className="tc-section_inner">
          <div className="tc-section_header">
            <div>
              <span className="tc-section_eyebrow">// blog</span>
              <h2>Últimos artículos</h2>
            </div>
            <a href="/blog" className="tc-section_link">
              Ver todos →
            </a>
          </div>
          
          {loadingPosts && <p className="tc-section_state">Cargando artículos...</p>}
          {!loadingPosts && posts.length === 0 && (
            <p className="tc-section_state">
              Todavía no hay artículos publicados. Vuelve pronto.
            </p>
          )}
          {!loadingPosts && posts.length > 0 && (
            <div className="tc-card-grid">
              {posts.map((post) => (
                <a key={post._id} href={`/blog/${post._id}`} className="tc-post-card">
                  <div className="tc-post-card_image">
                    {post.miniature ? (
                      <img
                        src={`${POST_IMAGE_BASE_URL}/${post.miniature}`}
                        alt={post.title}
                      />
                    ) : (
                      <div className="tc-post-card_placeholder"></div>
                    )}
                  </div>
                  <div className="tc-post-card_body">
                    <h3>{post.title || "(Sin título)"}</h3>
                    <p>{stripHtml(post.content).slice(0, 90)}...</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="tc-closing-cta">
        <div className="tc-closing-cta_inner">
          <h2>¿Listo para construir algo?</h2>
          <p>Empieza hoy con un curso gratuito, sin tarjeta y sin letra pequeña.</p>
          <a href="/courses" className="tc-closing-cta_btn">
            Explorar cursos
          </a>
        </div>
      </section>
    </div>
  );
}