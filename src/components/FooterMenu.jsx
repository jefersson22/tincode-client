// Enlaces por defecto. Si ya tienes un endpoint público de menú
// (ej: GET /api/v1/menu) puedes reemplazar esto por un fetch.
const DEFAULT_LINKS = {
  producto: [
    { label: "Inicio", path: "/" },
    { label: "Cursos", path: "/courses" },
    { label: "Blog", path: "/blog" },
    { label: "Contacto", path: "/contact" },
  ],
  legal: [
    { label: "Términos de uso", path: "/terminos" },
    { label: "Privacidad", path: "/privacidad" },
    { label: "Cookies", path: "/cookies" },
  ],
};

export function FooterMenu() {
  return (
    <div className="tc-footer-menu">
      <div className="tc-footer-menu_col">
        <h4 className="tc-footer-menu_heading">Producto</h4>
        <ul>
          {DEFAULT_LINKS.producto.map((link) => (
            <li key={link.path}>
              <a href={link.path}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
      <div className="tc-footer-menu_col">
        <h4 className="tc-footer-menu_heading">Legal</h4>
        <ul>
          {DEFAULT_LINKS.legal.map((link) => (
            <li key={link.path}>
              <a href={link.path}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}