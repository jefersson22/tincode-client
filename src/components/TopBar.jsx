import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { getMenuApi } from "../../../services/menuService"; // Ajusta la ruta a tu servicio de menú si varía
import "./TopBar.scss";

const DEFAULT_NAV_LINKS = [
  { _id: "1", title: "Inicio", path: "/" },
  { _id: "2", title: "Cursos", path: "/courses" },
  { _id: "3", title: "Blog", path: "/blog" },
  { _id: "4", title: "Contacto", path: "/contact" },
];

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(DEFAULT_NAV_LINKS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquea el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Cargar ítems activos del menú dinámico desde la base de datos
  useEffect(() => {
    (async () => {
      try {
        const data = await getMenuApi(true); // true = solicitar únicamente ítems activos
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setMenuItems(sorted);
        }
      } catch (err) {
        console.error("Error al obtener los ítems del menú dinámico:", err);
      }
    })();
  }, []);

  const renderNavLink = (item, isMobile = false) => {
    const path = item.path || item.to || "/";
    const title = item.title || item.label || "Enlace";
    const isExternal = path.startsWith("http://") || path.startsWith("https://");

    if (isExternal) {
      return (
        <a
          key={item._id || path}
          href={path}
          target="_blank"
          rel="noreferrer"
          onClick={() => isMobile && setMenuOpen(false)}
          className="tc-topbar_link"
        >
          {title}
        </a>
      );
    }

    return (
      <NavLink
        key={item._id || path}
        to={path}
        onClick={() => isMobile && setMenuOpen(false)}
        className={({ isActive }) =>
          `tc-topbar_link ${isActive ? "is-active" : ""}`
        }
      >
        {title}
      </NavLink>
    );
  };

  return (
    <header className={`tc-topbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="tc-topbar_inner">
        <a href="/" className="tc-topbar_logo-link">
          <Logo variant="navy" size="md" />
        </a>

        <nav
          className="tc-topbar_nav tc-topbar_nav--desktop"
          aria-label="Navegación principal"
        >
          {menuItems.map((item) => renderNavLink(item, false))}
        </nav>

        <div className="tc-topbar_actions">
          <a href="/admin" className="tc-topbar_ghost-btn">
            Iniciar sesión
          </a>
          <a href="/courses" className="tc-topbar_cta-btn">
            Empieza gratis
          </a>

          <button
            className={`tc-topbar_burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`tc-topbar_mobile ${menuOpen ? "is-open" : ""}`}>
        <nav
          className="tc-topbar_nav tc-topbar_nav--mobile"
          aria-label="Navegación móvil"
        >
          {menuItems.map((item) => renderNavLink(item, true))}
          <a
            href="/admin"
            className="tc-topbar_ghost-btn tc-topbar_ghost-btn--mobile"
          >
            Iniciar sesión
          </a>
          <a
            href="/courses"
            className="tc-topbar_cta-btn tc-topbar_cta-btn--mobile"
          >
            Empieza gratis
          </a>
        </nav>
      </div>
    </header>
  );
}