// middlewares/authorize.js
export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const { user } = req;
    if (!user) return res.status(401).json({ message: "Non authentifié" });

    // Les super-admins ont tous les droits
    if (user.role === "super_admin") return next();

    // Vérifie si l'utilisateur a au moins une permission requise
    const hasPermission = requiredPermissions.some((perm) =>
      user.permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : permissions insuffisantes",
      });
    }

    next();
  };
};