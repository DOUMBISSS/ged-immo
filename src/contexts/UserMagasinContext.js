import React, { createContext, useContext, useState, useEffect } from "react";

// 🔹 Création du contexte
const UserMagasinContext = createContext();

// 🔹 Fournisseur du contexte
export const UserMagasinProvider = ({ children }) => {
  const [magasinUser, setMagasinUser] = useState(() => {
    const storedUser = localStorage.getItem("magasinUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    if (magasinUser) {
      localStorage.setItem("magasinUser", JSON.stringify(magasinUser));
    } else {
      localStorage.removeItem("magasinUser");
    }
  }, [magasinUser]);

  // 🔑 Connexion
  const loginMagasinUser = (userData) => {
    setMagasinUser(userData);
    localStorage.setItem("magasinUser", JSON.stringify(userData));
  };

  // 🚪 Déconnexion
  const logoutMagasinUser = () => {
    setMagasinUser(null);
    localStorage.removeItem("magasinUser");
  };

  // 🔄 Rafraîchir les infos depuis le backend
  const refreshMagasinUser = async () => {
    if (!magasinUser?._id) return;
    try {
      const res = await fetch(`http://localhost:4000/owner/${magasinUser._id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMagasinUser(data.owner);
        localStorage.setItem("magasinUser", JSON.stringify(data.owner));
      }
    } catch (err) {
      console.error("Erreur de mise à jour des infos du propriétaire :", err);
    }
  };

  return (
    <UserMagasinContext.Provider
      value={{
        magasinUser,
        loginMagasinUser,
        logoutMagasinUser,
        refreshMagasinUser,
        isLoggedIn: !!magasinUser,
      }}
    >
      {children}
    </UserMagasinContext.Provider>
  );
};

// 🔹 Hook personnalisé
export const useUserMagasin = () => useContext(UserMagasinContext);