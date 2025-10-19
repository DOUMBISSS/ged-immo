// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Erreur lecture localStorage:", err);
      return null;
    }
  });

  // ✅ Sauvegarde auto dans localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Connexion
  const login = (userData) => {
    if (!userData || !userData._id) return console.error("ID utilisateur manquant !");
    const userWithSession = {
      ...userData,
      id: userData._id,
      isAdmin: userData.role === "admin",
      userId: userData.role !== "admin" ? userData._id : null,
      adminId: userData.role === "admin" ? userData._id : userData.adminId || null,
      token: userData.token || null,
    };
    setUser(userWithSession);
  };

  // ✅ Déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Login Handler global
  const loginHandler = async (role, emailOrUsername, password, navigate) => {
    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:4000/admin/login"
          : "http://localhost:4000/user/login";

      const body =
        role === "admin"
          ? { email: emailOrUsername.trim(), password: password.trim(), role }
          : { username: emailOrUsername.trim(), password: password.trim(), role };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Identifiants incorrects");
        return null;
      }

      if (!data.user || !data.token) {
        toast.error("Impossible de récupérer les informations de l'utilisateur");
        return null;
      }

      login({ ...data.user, token: data.token, role });
      localStorage.setItem("token", data.token);

      toast.success(`Bienvenue, ${data.user.fullname || data.user.name || "Utilisateur"} 👋`);
      navigate(role === "admin" ? "/administrator" : "/");
      return data.user;
    } catch (error) {
      console.error("Erreur serveur :", error);
      toast.error("Erreur serveur, réessayez plus tard");
      return null;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loginHandler }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext doit être utilisé dans un UserProvider");
  return context;
}