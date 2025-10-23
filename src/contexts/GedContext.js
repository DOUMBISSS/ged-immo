import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const GedContext = createContext();

export function GedProvider({ children }) {
  const [gedUser, setGedUser] = useState(
    JSON.parse(localStorage.getItem("gedImmo")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("gedToken") || null);
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", projectId: "", type: "" });

  const API_BASE = "http://localhost:4000";

  // 🔹 Login GED et stockage dans le contexte
  const loginGed = async (email, password) => {
    if (!email || !password) {
      toast.error("Veuillez renseigner tous les champs");
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ged/immo/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Échec de la connexion");
        return null;
      }

      setGedUser(data.ged);
      setToken(data.token);
      localStorage.setItem("gedImmo", JSON.stringify(data.ged));
      localStorage.setItem("gedToken", data.token);

      toast.success("Connexion réussie 🎉");
      await fetchGedData();
      return data;
    } catch (err) {
      console.error("Erreur login GED:", err);
      toast.error("Erreur serveur, veuillez réessayer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Déconnexion
  const logoutGed = () => {
    setGedUser(null);
    setToken(null);
    localStorage.removeItem("gedImmo");
    localStorage.removeItem("gedToken");
    toast.success("Déconnexion réussie");
  };

  // 🔹 Charger les données GED globales
  const fetchGedData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ged/data`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de chargement GED");

      setDocuments(data.documents || []);
      setProjects(data.projects || []);
      setAdmins(data.admins || []);
    } catch (err) {
      toast.error("Erreur GED : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGedData();
  }, [token]);

  return (
    <GedContext.Provider
      value={{
        gedUser,
        token,
        loginGed,
        logoutGed,
        documents,
        projects,
        admins,
        loading,
        filters,
        setFilters,
        fetchGedData,
      }}
    >
      {children}
    </GedContext.Provider>
  );
}

// Hook d'accès rapide
export function useGedContext() {
  const context = useContext(GedContext);
  if (!context) throw new Error("useGedContext doit être utilisé dans un GedProvider");
  return context;
}