import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import "./TopBar.scss";

const NAV_LINKS = [
  { label: "Inicio", to: "/" },
  { label: "Cursos", to: "/courses" },
  { label: "Blog", to: "/blog" },
  { label: "Contacto", to: "/contact" },
];

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className={`tc-topbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="tc-topbar_inner">
        <a href="/" className="tc-topbar_logo-link">
          <Logo variant="navy" size="md" />
        </a>
        
        <nav className="tc-topbar_nav tc-topbar_nav--desktop" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `tc-topbar_link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
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
        <nav className="tc-topbar_nav tc-topbar_nav--mobile" aria-label="Navegación móvil">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `tc-topbar_link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
          <a href="/admin" className="tc-topbar_ghost-btn tc-topbar_ghost-btn--mobile">
            Iniciar sesión
          </a>
          <a href="/courses" className="tc-topbar_cta-btn tc-topbar_cta-btn--mobile">
            Empieza gratis
          </a>
        </nav>
      </div>
    </header>
  );
}