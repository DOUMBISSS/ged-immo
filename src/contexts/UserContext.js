// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { SUBSCRIPTION_LIMITS } from "../subscriptionLimits";
import { v4 as uuidv4 } from "uuid";

const SESSION_DURATION = 60 * 60 * 1000; // 1h
const WARNING_DURATION = 60 * 1000; // 1 min avant expiration

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const countdownInterval = useRef(null);
  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);

  // 🔹 Sauvegarde user dans localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // 🔥 Vérifier si l’abonnement est actif
  const isSubscriptionActive = () => {
    if (!user || !user.subscriptionDetails) return false;

    const sub = user.subscriptionDetails;
    if (!sub.active || sub.suspended) return false;

    const now = new Date();
    return now >= new Date(sub.subscriptionStart) && now <= new Date(sub.subscriptionEnd);
  };

  // 🔹 Vérifier si une fonctionnalité est disponible selon le plan
  const hasFeature = (key, options = {}) => {
    if (!user) return false;
    if (!isSubscriptionActive()) {
      if (options.toastMessage !== false)
        toast.error("🚫 Aucun abonnement actif. Souscrivez à un plan.");
      return false;
    }

    const plan = user.subscription || "gratuit";
    const limit = SUBSCRIPTION_LIMITS[plan]?.[key];

    if (limit === undefined) return false;

    if (typeof limit === "boolean") {
      if (!limit && options.toastMessage !== false)
        toast.error(`🔒 Fonction non disponible dans le plan ${plan.toUpperCase()}.`);
      return limit;
    }

    if (typeof limit === "number") {
      if (options.currentCount !== undefined && options.currentCount >= limit) {
        toast.error(`🚫 Limite atteinte : max ${limit} ${key}.`);
        return false;
      }
    }

    return true;
  };

  // 🔹 Login frontend : sauvegarde user + token + sessionToken
  const login = (userData) => {
    const sessionToken = uuidv4();

    const newUser = {
      ...userData,
      id: userData._id,
      adminId: userData.role === "admin" ? userData._id : userData.adminId,
      subscription: userData.subscriptionType || "gratuit",
      subscriptionDetails: userData.subscriptionDetails || null,
      sessionToken,
    };

    setUser(newUser);
    localStorage.setItem("token", userData.token);
    startSessionTimer();
  };

  // 🔹 Logout complet
  const logout = () => {
    clearSessionTimers();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // 🔹 Timer session + avertissement
  const startSessionTimer = () => {
    clearSessionTimers();

    warningTimeout.current = setTimeout(() => {
      setShowSessionWarning(true);
      setCountdown(60);

      countdownInterval.current = setInterval(() => {
        setCountdown((v) => {
          if (v <= 1) {
            logout();
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }, SESSION_DURATION - WARNING_DURATION);

    logoutTimeout.current = setTimeout(logout, SESSION_DURATION);
  };

  const clearSessionTimers = () => {
    clearTimeout(logoutTimeout.current);
    clearTimeout(warningTimeout.current);
    clearInterval(countdownInterval.current);
  };

  // 🔹 LoginHandler : commun pour admin et user
  const loginHandler = async (role, emailOrUsername, password, navigate) => {
    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:4000/admin/login"
          : "http://localhost:4000/user/login";

      const body =
        role === "admin"
          ? { email: emailOrUsername.trim(), password }
          : { username: emailOrUsername.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return null;
      }

      login({
        ...data.user,
        token: data.token,
        role,
        subscriptionDetails: data.user.subscriptionDetails,
      });

      navigate(role === "admin" ? "/administrator" : "/");
      return data.user;
    } catch (err) {
      toast.error("Erreur serveur");
      return null;
    }
  };

  // 🔹 Pour tests uniquement : simuler un user déjà dans MongoDB
// useEffect(() => {
//   const mockUser = {
//     _id: "693038c73e84193b945fecf2",
//     name: "DOUMBIA",
//     lastname: "FODE",
//     role: "user",
//     adminId: "68dc2708eaf944edfc5fdde5",
//     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzAzOGM3M2U4NDE5M2I5NDVmZWNmMiIsInNlc3Npb24iOiIyMzIxZjM0NDFlODVkNTY3NzVmMTc4OGE5N2M5ZDI4MTY5OGY3ZjAzYWI2OTcwYzE3NjY2ZjU4YWY5ZmJkOWZhIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjQ3ODA2NjksImV4cCI6MTc2NDc4NDI2OX0.6QHhrf98dKw8vPffgrhCDu7F75YBbt4slxY7q9aUWIU",
//     sessionToken: "2321f3441e85d56775f1788a97c9d281698f7f03ab6970c17666f58af9fbd9fa",
//     subscription: "gratuit",
//     subscriptionDetails: {
//       active: true,
//       suspended: false,
//       subscriptionStart: new Date(),
//       subscriptionEnd: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // 30 jours
//     },
//   };

//   setUser(mockUser);
// }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        loginHandler,
        hasFeature,
        isSubscriptionActive,
        showSessionWarning,
        countdown,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}