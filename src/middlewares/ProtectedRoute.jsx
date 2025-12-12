import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

export default function ProtectedRoute({ children, roles = [], permissions = [], authRequired = true, redirectIfAuthenticated = false }) {
  const { user } = useUserContext();
  const location = useLocation();

  // ⚠️ Si la route est pour les utilisateurs **non connectés uniquement** (ex: login/home)
  if (redirectIfAuthenticated && user) {
    // Rediriger vers la page par défaut après login (ex: /Accueil)
    return <Navigate to="/Accueil" replace />;
  }

  // ⛔ Si la route est protégée et que l'utilisateur n'est pas connecté
  if (authRequired && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 🔒 Vérification des rôles autorisés
  if (roles.length && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}