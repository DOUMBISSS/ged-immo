import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../Footer";
import { Blocks } from "react-loader-spinner";
import { toast } from "react-hot-toast";

import RenewSubscriptionModal from "./RenewSubscriptionModal";
import NavbarGED from "./NavbarGED";

export default function DetailAdminGed() {
  const { id } = useParams();
  const token = localStorage.getItem("gedToken");

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [projects, setProjects] = useState([]);
  const [locataires, setLocataires] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState([]);
const [selectedSignature, setSelectedSignature] = useState(null);

  // 📦 Charger les infos Admin + ses ressources liées
  useEffect(() => {
    if (!id || !token) return;

    const fetchAdminDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/ged/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) return toast.error(data.message || "Erreur de chargement");

        setAdmin(data.admin);
        setProjects(data.projects || []);
        setLocataires(data.locataires || []);
        setDocuments(data.documents || []);
      } catch (err) {
        toast.error("Erreur serveur : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetail();
  }, [id, token]);

  // Dans ton useEffect de récupération de l'admin, après avoir défini setAdmin
useEffect(() => {
  if (!id || !token) return;

  const fetchAdminDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/ged/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur de chargement");

      setAdmin(data.admin);
      setProjects(data.projects || []);
      setLocataires(data.locataires || []);
      setDocuments(data.documents || []);

      // --- Récupération des signatures ---
      if (data.admin._id) {
        try {
          const sigRes = await fetch(`http://localhost:4000/ged/admin/${data.admin._id}/signatures`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!sigRes.ok) throw new Error("Impossible de charger les signatures");
          const sigData = await sigRes.json();
          const sigArray = Array.isArray(sigData.signatures) ? sigData.signatures : [];
          setSignatures(sigArray);
          setSelectedSignature(sigArray[0] || null);
        } catch (err) {
          console.error("Erreur fetchSignatures:", err);
        }
      }
    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAdminDetail();
}, [id, token]);

  if (loading)
    return (
      <div className="loading">
        <Blocks visible={true} height="100" width="100" />
      </div>
    );

  if (!admin)
    return (
      <div className="error-message">
        <p>⚠️ Administrateur introuvable</p>
      </div>
    );

  // Fonction pour compter les locataires par projet
  const countLocatairesByProject = (projectId) => {
    return locataires.filter((l) => l.projectId === projectId).length;
  };

  return (
    <div>
      <NavbarGED />
      <div className="saas-container">
        <div className="saas-card">

          {/* === HEADER ADMIN AMÉLIORÉ === */}
          <div className="header-admin-improved">
            {/* === LEFT: Profil et infos générales === */}
            <div className="admin-info-card">
              <div className="profile-header">
                {admin.photo ? (
                  <img
                    src={`http://localhost:4000/${admin.photo}`}
                    alt="Profil"
                    className="admin-photo"
                  />
                ) : (
                  <div className="admin-photo-placeholder">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                )}
                <div className="profile-name">
                  <h2>{admin.fullname}</h2>
                  <p className="username">@{admin.username}</p>
                </div>
              </div>

              <div className="profile-details">
                <p>
                  <strong>Email :</strong> {admin.email}
                </p>
                <p>
                  <strong>Téléphone :</strong> {admin.number || "Non spécifié"}
                </p>
                <p>
                  <strong>Adresse :</strong> {admin.address || "—"}
                </p>
                <p>
                  <strong>Vérifié :</strong> {admin.isVerified ? "✅ Oui" : "❌ Non"}
                </p>
                {admin.emailToken && (
                  <p>
                    <strong>Token email :</strong> {admin.emailToken}
                  </p>
                )}

                {/* --- Abonnement --- */}
                {/* --- Abonnement --- */}
                <div className="subscription-badge">
                  <span
                    className={`badge ${
                      admin.suspended
                        ? "suspended"
                        : admin.active && new Date(admin.subscriptionEnd) > new Date()
                        ? "active"
                        : "expired"
                    }`}
                  >
                    {admin.suspended
                      ? "Suspendu"
                      : admin.active && new Date(admin.subscriptionEnd) > new Date()
                      ? "Actif"
                      : "Expiré"}
                  </span>

                  <span className="subscription-info">
                    {admin.subscriptionType || "—"} |{" "}
                    {admin.subscriptionStart
                      ? `Début : ${new Date(admin.subscriptionStart).toLocaleDateString("fr-FR")}`
                      : "—"}{" "}
                    |{" "}
                    {admin.subscriptionEnd
                      ? `Fin : ${new Date(admin.subscriptionEnd).toLocaleDateString("fr-FR")}`
                      : "—"}
                  </span>
                </div>
                          </div>
            </div>

            {/* === CENTER: Signatures & abonnement === */}
            <div className="admin-subscription-card">
              <h3>Abonnement & Signatures</h3>
              <p><strong>Type :</strong> {admin.subscriptionType || "—"}</p>
              {admin.subscriptionStart && <p><strong>Début :</strong> {new Date(admin.subscriptionStart).toLocaleDateString("fr-FR")}</p>}
              {admin.subscriptionEnd && <p><strong>Fin :</strong> {new Date(admin.subscriptionEnd).toLocaleDateString("fr-FR")}</p>}
              <p><strong>Signatures disponibles :</strong> {admin.signatures.length > 0 ? admin.signatures.join(", ") : "Aucune"}</p>
              <p><strong>Signature sélectionnée :</strong> {admin.selectedSignature || "Aucune"}</p>
            </div>

            {/* === RIGHT: Actions & stats === */}
            <div className="admin-actions-card">
              <div className="actions-btns">
                <Link to="/ged/admins" className="btn-back">← Retour</Link>
                <button className="btn-renew" onClick={() => setIsRenewModalOpen(true)}>💳 Prolonger abonnement</button>
              </div>

              <div className="admin-stats">
                <div className="stat">
                  <h3>{admin.users?.length || 0}</h3>
                  <p>Utilisateurs associés</p>
                </div>
                <div className="stat">
                  <h3>{admin.projectIds?.length || 0}</h3>
                  <p>Projets associés</p>
                </div>
              </div>
            </div>
          </div>

          {/* === STATS === */}
          <div className="stats-dashboard">
            <div className="stat-card">
              <h3>{projects.length}</h3>
              <p>Projets</p>
            </div>
            <div className="stat-card">
              <h3>{locataires.length}</h3>
              <p>Locataires</p>
            </div>
            <div className="stat-card">
              <h3>{documents.length}</h3>
              <p>Documents</p>
            </div>
          </div>

          {/* === PROJETS === */}
          <div className="section">
            <h3>
              <i className="fa-solid fa-building"></i> Projets
            </h3>
            {projects.length === 0 ? (
              <p className="empty">Aucun projet enregistré.</p>
            ) : (
           <table className="saas-table">
  <thead>
    <tr>
      <th>Nom</th>
      <th>Adresse</th>
      <th>Type</th>
      <th>Nombre de biens</th>
      <th>Nombre de locataires</th>
    </tr>
  </thead>
  <tbody>
    {projects.map((p) => (
      <tr key={p._id}>
        <td>{p.name}</td>
        <td>{p.location || "—"}</td>
        <td>{p.type || "—"}</td>
        <td>{p.homeIds?.length || 0}</td> {/* Nombre de biens */}
        <td>{p.personIds?.length || 0}</td> {/* Nombre de locataires */}
      </tr>
    ))}
  </tbody>
</table>
            )}
          </div>

          {/* === LOCATAIRES === */}
          <div className="section">
            <h3>
              <i className="fa-solid fa-users"></i> Locataires
            </h3>
            {locataires.length === 0 ? (
              <p className="empty">Aucun locataire trouvé.</p>
            ) : (
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Bien</th>
                  </tr>
                </thead>
                <tbody>
                  {locataires.map((l) => (
                    <tr key={l._id}>
                      <td>{l.name}</td>
                      <td>{l.email}</td>
                      <td>{l.tel}</td>
                      <td>{l.homeId?.nameHome || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* === DOCUMENTS === */}
          <div className="section">
            <h3>
              <i className="fa-solid fa-folder-open"></i> Documents
            </h3>
            {documents.length === 0 ? (
              <p className="empty">Aucun document disponible.</p>
            ) : (
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Télécharger</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>{doc.title}</td>
                      <td>{doc.type}</td>
                      <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <a
                          href={`http://localhost:4000/${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 Télécharger
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* === MODAL DE RENOUVELLEMENT === */}
      <RenewSubscriptionModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        admin={admin}
        onRenew={(newEndDate) => setAdmin({ ...admin, subscriptionEnd: newEndDate })}
      />

      {/* === STYLES === */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }

        .header-admin-improved { display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 2rem; }
        .admin-info-card, .admin-subscription-card, .admin-actions-card { flex: 1 1 300px; background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .admin-photo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #4b00cc; }
        .admin-photo-placeholder { width: 70px; height: 70px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #4b00cc; border: 2px solid #4b00cc; }
        .profile-name h2 { margin: 0; font-size: 1.3rem; color: #2c3e50; }
        .profile-name .username { margin: 0; font-size: 0.9rem; color: #6b7280; }
        .profile-details p, .admin-subscription-card p { margin: 0.3rem 0; color: #374151; font-size: 0.95rem; }
        .admin-subscription-card h3 { margin-bottom: 0.8rem; color: #4b00cc; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
        .actions-btns { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .btn-back, .btn-renew { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; color: #fff; }
        .btn-back { background: #2563eb; }
        .btn-back:hover { background: #1e40af; }
        .btn-renew { background: #16a34a; }
        .btn-renew:hover { background: #15803d; }
        .admin-stats { display: flex; gap: 1rem; margin-top: 1rem; }
        .admin-stats .stat { flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 0.5rem 0; }
        .admin-stats .stat h3 { margin: 0; color: #4b00cc; }
        .admin-stats .stat p { margin: 0; font-size: 0.85rem; color: #6b7280; }

        .stats-dashboard { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .stat-card { flex: 1; background: #f9fafb; border-radius: 8px; text-align: center; padding: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .stat-card h3 { font-size: 2rem; color: #2563eb; margin: 0; }
        .stat-card p { color: #6b7280; margin: 0; }
        .section { margin-top: 2rem; }
        .empty { text-align: center; font-style: italic; color: #6b7280; padding: 1rem; }
        .saas-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 14px; }
        .saas-table th, .saas-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .saas-table th { background: #f1f5f9; font-weight: 600; }
        .loading { display: flex; justify-content: center; align-items: center; height: 70vh; }
          .subscription-badge {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 5px 12px;
      border-radius: 12px;
      font-weight: bold;
      color: #fff;
      font-size: 0.9rem;
    }
    .badge.active {
      background-color: #2ecc71; /* vert pour actif */
    }
    .badge.expired {
      background-color: #e74c3c; /* rouge pour expiré */
    }
       .badge.suspended {
    background-color: #f59e0b; /* orange */
  }
    .subscription-info {
      font-size: 0.9rem;
      color: #34495e;
    }
      `}</style>
    </div>
  );
}