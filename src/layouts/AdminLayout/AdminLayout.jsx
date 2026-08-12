import { Outlet, NavLink } from "react-router-dom";
import logo from "../../assets/svg/tincode-white.svg";
import { LogoutButton } from "../../components/Admin/LogoutButton/LogoutButton";
import { UserWelcome } from "../../components/Admin/UserWelcome/UserWelcome";
import { usePermissions } from "../../hooks/usePermissions";
import "./AdminLayout.scss";

const navItems = [
  { to: "/admin/users", label: "Usuarios", icon: "👤", requiredRole: "admin" },
  { to: "/admin/blog", label: "Blog", icon: "📝", requiredRole: "editor" },
  { to: "/admin/courses", label: "Cursos", icon: "🎓", requiredRole: "editor" },
  { to: "/admin/menu", label: "Menú", icon: "📋", requiredRole: "editor" },
  { to: "/admin/newsletter", label: "Newsletter", icon: "✉️", requiredRole: "user" },
];

export function AdminLayout() {
  const { hasRole } = usePermissions();

  const visibleItems = navItems.filter((item) => hasRole(item.requiredRole));

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src={logo} alt="TinCode" />
          <span>TinCode</span>
        </div>

        <nav className="admin-sidebar__nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "admin-nav-link admin-nav-link--active" : "admin-nav-link"
              }
            >
              <span className="admin-nav-link__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <LogoutButton />
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <h1>Panel administrativo</h1>
          <UserWelcome />
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}