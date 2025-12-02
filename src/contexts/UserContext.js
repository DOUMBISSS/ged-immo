// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { SUBSCRIPTION_LIMITS } from "../subscriptionLimits";

const SESSION_DURATION = 60 * 60 * 1000;
const WARNING_DURATION = 60 * 1000;
const INACTIVITY_LIMIT = SESSION_DURATION;

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

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const countdownInterval = useRef(null);
  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const lastActivity = useRef(Date.now());
  const activityAttached = useRef(false);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // 🔥 Vérifier l’abonnement actif
  const isSubscriptionActive = () => {
    if (!user || !user.subscriptionDetails) return false;

    const sub = user.subscriptionDetails;

    if (!sub.active || sub.suspended) return false;

    const now = new Date();
    return now >= new Date(sub.subscriptionStart) && now <= new Date(sub.subscriptionEnd);
  };

  const hasFeature = (key, options = {}) => {
    if (!user) return false;

    if (!isSubscriptionActive()) {
      if (options.toastMessage !== false) {
        toast.error("🚫 Aucun abonnement actif à cette date. Veuillez souscrire à un plan.");
      }
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

  const login = (userData) => {
    setUser({
      ...userData,
      id: userData._id,
      adminId: userData.role === "admin" ? userData._id : userData.adminId,
      subscription: userData.subscriptionType || "gratuit",
      subscriptionDetails: userData.subscriptionDetails || null,
    });

    startSessionTimer();
  };

  const logout = () => {
    clearSessionTimers();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const startSessionTimer = () => {
    clearSessionTimers();
    lastActivity.current = Date.now();

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

      // ⚠️ IMPORTANT : Backend doit envoyer subscriptionDetails complet
      login({
        ...data.user,
        token: data.token,
        role,
        subscriptionDetails: data.user.subscriptionDetails,
      });

      localStorage.setItem("token", data.token);

      navigate(role === "admin" ? "/administrator" : "/");
      return data.user;
    } catch (err) {
      toast.error("Erreur serveur");
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        loginHandler,
        hasFeature,
        isSubscriptionActive,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}