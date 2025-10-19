import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

export default function ProtectedRoute({ children, roles = [], permissions = [] }) {
  const { user } = useUserContext();
  const location = useLocation();

  // ⛔ Pas connecté → redirection vers login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 🔒 Vérification des rôles autorisés (ex: ['admin', 'manager'])
  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔐 Vérification des permissions (ex: ['edit_users', 'manage_admins'])
  if (permissions.length) {
    const hasPermission = permissions.some((perm) => user.permissions?.includes(perm));

    // Les super_admin ont toujours tous les droits
    if (user.role !== "admin" && !hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}