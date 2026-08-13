import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { getMenusRequest } from "../services/menusService";
import "./TopBar.scss";

// Menú por defecto mientras carga o si la base de datos no retorna ítems
const DEFAULT_NAV_LINKS = [
  { _id: "def-1", title: "Inicio", path: "/" },
  { _id: "def-2", title: "Cursos", path: "/courses" },
  { _id: "def-3", title: "Blog", path: "/blog" },
  { _id: "def-4", title: "Contacto", path: "/contact" },
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Cargar menús activos desde la API
  useEffect(() => {
    (async () => {
      try {
        const data = await getMenusRequest(true);
        const list = Array.isArray(data) ? data : data?.docs || data?.menus || [];

        if (list.length > 0) {
          const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
          setMenuItems(sorted);
        }
      } catch (err) {
        console.error("Error al cargar los menús:", err);
      }
    })();
  }, []);

  const renderNavLink = (item, isMobile = false) => {
    const path = item.path || item.url || item.to || "/";
    const title = item.title || item.name || item.label || "Enlace";
    const isExternal = path.startsWith("http://") || path.startsWith("https://");
    const uniqueKey = item._id || `${path}-${title}`;

    if (isExternal) {
      return (
        <a
          key={uniqueKey}
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
        key={uniqueKey}
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