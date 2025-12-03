import React, { useEffect, useState, useRef, useCallback } from "react";
import NavbarGED from "./NavbarGED";
import { toast, Toaster } from "react-hot-toast";
import { useGedContext } from "../../contexts/GedContext";
import { Link } from "react-router-dom";
import Footer from "../Footer";

export default function GedNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    notifId: null,
    action: null,
    plan: "gratuit",
    adminId: null,
  });
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("tous"); // 🔹 Filtre: tous, en_attente, acceptee, refusee
  const [currentPage, setCurrentPage] = useState(1); // 🔹 Pagination
  const { gedUser } = useGedContext();
  const prevNotificationsRef = useRef([]);
  const ITEMS_PER_PAGE = 15;

  const fetchNotifications = useCallback(async () => {
    if (!gedUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch("https://backend-ged-immo.onrender.com/gedimmo/notifications", {
        headers: { Authorization: `Bearer ${gedUser.token}` },
      });
      const data = await res.json();

      if (data.success) {
        const pendingNotifs = data.data.filter((n) => n.status === "en_attente");
        const prevIds = prevNotificationsRef.current.map((n) => n._id);
        const newNotifs = pendingNotifs.filter((n) => !prevIds.includes(n._id));

        if (newNotifs.length > 0) {
          newNotifs.forEach((n) =>
            toast(`📩 Nouvelle demande : ${n.message}`, { icon: "🆕" })
          );
        }

        prevNotificationsRef.current = pendingNotifs;
        setNotifications(data.data);
      } else {
        toast.error("Erreur lors du chargement des notifications");
      }
    } catch (err) {
      console.error("Erreur fetch notifications :", err);
      toast.error("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }, [gedUser]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 100000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const openModal = (notifId, action, adminId, plan = "gratuit") => {
    setModal({ show: true, notifId, action, adminId, plan });
  };

  const closeModal = () => {
    if (!processing) {
      setModal({
        show: false,
        notifId: null,
        action: null,
        plan: "gratuit",
        adminId: null,
      });
    }
  };

const handleActionConfirmed = async () => {
  if (processing || !modal.notifId || !modal.adminId || !gedUser?.token) return;

  setProcessing(true);

  try {
    const res = await fetch(
      `https://backend-ged-immo.onrender.com/update/notifications/subscriptions/${modal.adminId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gedUser.token}`,
        },
        body: JSON.stringify({
          id: modal.notifId,
          status: modal.action,
          plan: modal.plan,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      // 🔹 Toast différent selon que l'abonnement est programmé ou actif
      if (data.subscription?.scheduledStart) {
        toast.success(
          `🕒 Abonnement "${modal.plan}" programmé pour le ${new Date(
            data.subscription.scheduledStart
          ).toLocaleDateString("fr-FR")}`
        );
      } else if (data.subscription?.subscriptionEnd) {
        toast.success(
          `✅ Abonnement "${modal.plan}" actif jusqu'au ${new Date(
            data.subscription.subscriptionEnd
          ).toLocaleDateString("fr-FR")}`
        );
      } else {
        // Pour les demandes refusées
        toast.success(data.message);
      }

      // 🔹 Recharge les notifications
      await fetchNotifications();

      // 🔹 Ferme le modal
      setModal({
        show: false,
        notifId: null,
        action: null,
        plan: "gratuit",
        adminId: null,
      });
    } else {
      toast.error(data.message || "Erreur lors du traitement de la demande");
    }
  } catch (err) {
    console.error("Erreur update notification:", err);
    toast.error("Erreur réseau ou serveur");
  } finally {
    setProcessing(false);
  }
};

  // 🔹 Comptage des notifications par statut
const counts = {
  tous: notifications.length,
  en_attente: notifications.filter((n) => n.status === "en_attente").length,
  acceptee: notifications.filter((n) => n.status === "acceptee").length,
  refusee: notifications.filter((n) => n.status === "refusee").length,
};

  // 🔹 Filtrage des notifications
  const filteredNotifications =
    filter === "tous"
      ? notifications
      : notifications.filter((n) => n.status === filter);

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const displayedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f4f6fa", minHeight: "100vh" }}>
      <NavbarGED />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="actions-btns">
        <Link to="/ged/admins" className="btn-back">← Retour</Link>
      </div>

      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "1rem", color: "#1f2937" }}>
          🔔 Demandes d’abonnement
        </h2>

        {/* 🔹 Filtrage */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
  {["tous", "en_attente", "acceptee", "refusee"].map((f) => (
    <button
      key={f}
      onClick={() => { setFilter(f); setCurrentPage(1); }}
      style={{
        padding: "0.3rem 0.6rem",
        borderRadius: "0.5rem",
        border: filter === f ? "2px solid #2563eb" : "1px solid #ccc",
        background: filter === f ? "#e0f2fe" : "#f3f4f6",
        cursor: "pointer",
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {f === "tous" ? `Tous (${counts[f]})` : f === "en_attente" ? `En attente (${counts[f]})` :
       f === "acceptee" ? `Acceptées (${counts[f]})` : `Refusées (${counts[f]})`}
    </button>
  ))}
</div>

        {loading ? (
          <p style={{ color: "#6b7280" }}>Chargement des notifications…</p>
        ) : displayedNotifications.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucune demande pour le moment.</p>
        ) : (
          <ul style={{ display: "grid", gap: "1rem" }}>
            {displayedNotifications.map((notif) => (
              <li key={notif._id} style={{
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                backgroundColor: notif.status === "acceptee" ? "#ecfdf5" :
                                 notif.status === "refusee" ? "#fef2f2" : "#f3f4f6",
                borderLeft: notif.status === "en_attente" ? "4px solid #3b82f6" : "4px solid transparent",
              }}>
                <p style={{ fontSize: "1rem", color: "#111827", fontWeight: 500 }}>{notif.message}</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  <strong>Créée le :</strong>{" "}
                  {new Date(notif.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {notif.status === "acceptee" && <p style={{ fontSize: "0.875rem", color: "#065f46", marginTop: "0.25rem" }}>✅ Cette demande a été acceptée.</p>}
                {notif.status === "refusee" && <p style={{ fontSize: "0.875rem", color: "#b91c1c", marginTop: "0.25rem" }}>❌ Cette demande a été refusée.</p>}
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  <strong>Admin :</strong> {notif.adminId?.fullname} ({notif.adminId?.email})
                </p>
                <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.25rem" }}>
                  <strong>Plan demandé :</strong>{" "}
                  <span style={{ textTransform: "capitalize" }}>{notif.plan || "gratuit"}</span>
                </p>
                {notif.status === "en_attente" && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button onClick={() => openModal(notif._id, "acceptee", notif.adminId?._id, notif.plan || "gratuit")} style={{ backgroundColor: "#10b981", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "0.5rem", fontWeight: 600 }}>Accepter</button>
                    <button onClick={() => openModal(notif._id, "refusee", notif.adminId?._id, notif.plan || "gratuit")} style={{ backgroundColor: "#ef4444", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "0.5rem", fontWeight: 600 }}>Refuser</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 🔹 Pagination */}
{totalPages > 1 && (
  <div className="pagination-container">
    {/* <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⏮ Premier</button> */}
    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>← Précédent</button>
    <span>Page {currentPage} / {totalPages}</span>
    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Suivant →</button>
    {/* <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Dernier ⏭</button> */}
  </div>
)}
      </div>

      {/* 🔹 Modal confirmation */}
      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "1rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginBottom: "1rem" }}>Confirmation</h3>
            <p>Êtes-vous sûr de vouloir <strong>{modal.action === "acceptee" ? "accepter" : "refuser"}</strong> cette demande pour le plan <strong style={{ textTransform: "capitalize" }}>{modal.plan}</strong> ?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
              <button onClick={closeModal} disabled={processing} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #ccc", background: "#f3f4f6", cursor: processing ? "not-allowed" : "pointer", opacity: processing ? 0.6 : 1 }}>Annuler</button>
              <button onClick={handleActionConfirmed} disabled={processing} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "#10b981", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: processing ? 0.7 : 1 }}>{processing ? "Traitement..." : "Confirmer"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .actions-btns { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; margin:2rem }
        .btn-back, .btn-renew { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; color: #fff; }
        .btn-back { background: #2563eb; }
        .btn-back:hover { background: #1e40af; }
        .pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.pagination-container button {
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #2563eb; /* bleu principal */
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.pagination-container button:hover:not(:disabled) {
  background-color: #1e40af; /* bleu plus foncé au hover */
  transform: scale(1.05);
}

.pagination-container button:disabled {
  background-color: #cbd5e1; /* gris clair */
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.pagination-container span {
  font-weight: 500;
  color: #1f2937; /* gris foncé */
  padding: 0 0.5rem;
}
      `}</style>

      <Footer />
    </div>
  );
}