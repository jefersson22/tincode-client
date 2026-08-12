import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

export function RequireRole({ role, children }) {
  const { hasRole } = usePermissions();

  if (!hasRole(role)) {
    return <Navigate to="/admin/users" replace />;
  }

  return children;
}