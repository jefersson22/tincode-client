import { useAuth } from "./useAuth";

const ROLE_HIERARCHY = {
  admin: 3,
  editor: 2,
  user: 1,
};

export function usePermissions() {
  const { user } = useAuth();
  
  // Convierte el rol siempre a minúsculas y limpia espacios en blanco
  const role = user?.role ? user.role.toLowerCase().trim() : "user";

  const hasRole = (requiredRole) => {
    return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
  };

  const isRole = (roleToCheck) => role === roleToCheck;

  return { role, hasRole, isRole };
}