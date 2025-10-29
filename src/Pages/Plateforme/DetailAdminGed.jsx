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
  const [subscriptions, setSubscriptions] = useState([]);
  const [latestSubscription, setLatestSubscription] = useState(null);
  const [persons, setPersons] = useState([]);
          const [isOpen, setIsOpen] = useState(false); // État du dépliant

  // Pagination abonnements
  const [currentSubPage, setCurrentSubPage] = useState(1);
  const subscriptionsPerPage = 10;

  // Pagination projets
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const projectsPerPage = 10;

  useEffect(() => {
    if (!id || !token) return;

    const fetchAdminDetail = async () => {
      try {
        setLoading(true);

        // --- Admin + projets + locataires + documents ---
        const res = await fetch(`http://localhost:4000/ged/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) return toast.error(data.message || "Erreur de chargement");

        setAdmin(data.admin);
        setProjects(data.projects || []);
        setLocataires(data.locataires || []);
        setDocuments(data.documents || []);
        setPersons(data.persons || []);

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

        // --- Récupération des abonnements ---
        try {
          const subRes = await fetch(`http://localhost:4000/ged/admin/${id}/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const subData = await subRes.json();
          if (!subRes.ok) return toast.error(subData.message || "Erreur de chargement des abonnements");

          setSubscriptions(subData);

          // Trouver le dernier abonnement actif ou le plus récent
          const latest = subData.length > 0 
            ? subData.sort((a, b) => new Date(b.subscriptionEnd) - new Date(a.subscriptionEnd))[0]
            : null;
          setLatestSubscription(latest);
        } catch (err) {
          console.error("Erreur fetchSubscriptions:", err);
          toast.error("Erreur lors de la récupération des abonnements");
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

const countLocatairesByProject = (projectId) => {
  const project = projects.find((p) => p._id === projectId);
  return project?.homeIds?.reduce((count, home) => {
    if (home.personId) count++;
    return count;
  }, 0) || 0;
};

  // Pagination abonnements
  const indexOfLastSub = currentSubPage * subscriptionsPerPage;
  const indexOfFirstSub = indexOfLastSub - subscriptionsPerPage;
  const currentSubscriptions = subscriptions.slice(indexOfFirstSub, indexOfLastSub);
  const totalSubPages = Math.ceil(subscriptions.length / subscriptionsPerPage);

  // Pagination projets
  const indexOfLastProject = currentProjectPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalProjectPages = Math.ceil(projects.length / projectsPerPage);

  return (
    <div>
      <NavbarGED />
      <div className="saas-container">
        <div className="saas-card">
          {/* === HEADER ADMIN AMÉLIORÉ === */}
           <div className="actions-btns">
                <Link to="/ged/admins" className="btn-back">← Retour</Link>
              
              </div>
          <div className="header-admin-improved">
            <div className="admin-info-card">
              <div className="profile-header">
                {admin.photo ? (
                  <img src={`http://localhost:4000/${admin.photo}`} alt="Profil" className="admin-photo" />
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
                <p><strong>Email :</strong> {admin.email}</p>
                <p><strong>Téléphone :</strong> {admin.number || "Non spécifié"}</p>
                <p><strong>Adresse :</strong> {admin.address || "—"}</p>
                <p><strong>Vérifié :</strong> {admin.isVerified ? "✅ Oui" : "❌ Non"}</p>
                {admin.emailToken && <p><strong>Token email :</strong> {admin.emailToken}</p>}

                {latestSubscription ? (
                  <div className="subscription-badge">
                    <div className="badge-status">
                      <span className={`badge ${latestSubscription.suspended ? "suspended" : latestSubscription.active && new Date(latestSubscription.subscriptionEnd) > new Date() ? "active" : "expired"}`}>
                        {latestSubscription.suspended ? "⏸️ Suspendu" : latestSubscription.active && new Date(latestSubscription.subscriptionEnd) > new Date() ? "✅ Actif" : "❌ Expiré"}
                      </span>
                      <span className="subscription-type">{latestSubscription.subscriptionType?.toUpperCase() || "—"}</span>
                    </div>
                    <div className="subscription-info">
                      <p><strong>Début :</strong> {latestSubscription.subscriptionStart ? new Date(latestSubscription.subscriptionStart).toLocaleDateString("fr-FR") : "—"}</p>
                      <p><strong>Fin :</strong> {latestSubscription.subscriptionEnd ? new Date(latestSubscription.subscriptionEnd).toLocaleDateString("fr-FR") : "—"}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ marginTop: "1rem", color: "#6b7280" }}>Aucun abonnement actif pour cet administrateur.</p>
                )}

                  <button className="btn-renew" onClick={() => setIsRenewModalOpen(true)}>💳 Prolonger abonnement</button>
              </div>
            </div>

            <div className="admin-subscription-card">
              <h3>Abonnement & Signatures</h3>
              {/* {latestSubscription ? (
                <>
                  <p><strong>Type :</strong> {latestSubscription.subscriptionType}</p>
                  <p><strong>Début :</strong> {new Date(latestSubscription.subscriptionStart).toLocaleDateString("fr-FR")}</p>
                  <p><strong>Fin :</strong> {new Date(latestSubscription.subscriptionEnd).toLocaleDateString("fr-FR")}</p>
                  <p><strong>Statut :</strong> {latestSubscription.active ? "✅ Actif" : "❌ Inactif"}</p>
                </>
              ) : <p>Aucun abonnement en cours</p>} */}
              <p><strong>Signatures disponibles :</strong> {signatures.length > 0 ? signatures.join(", ") : "Aucune"}</p>
              <p><strong>Signature sélectionnée :</strong> {selectedSignature || "Aucune"}</p>
            </div>

            {/* <div className="admin-actions-card">
             

              <div className="admin-stats">
                <div className="stat">
                  <h3>{admin.users?.length || 0}</h3>
                  <p>Utilisateurs associés</p>
                </div>
                <div className="stat">
                  <h3>{projects.length}</h3>
                  <p>Projets associés</p>
                </div>
              </div>
            </div> */}
          </div>

          {/* === STATS === */}
          <div className="stats-dashboard">
            <div className="stat-card">
              <h3>{projects.length}</h3>
              <p>Projets</p>
            </div>
            {/* <div className="stat-card">
              <h3>{locataires.length}</h3>
              <p>Locataires</p>
            </div>
            <div className="stat-card">
              <h3>{documents.length}</h3>
              <p>Documents</p>
            </div> */}
          </div>

          {/* === UTILISATEURS CRÉÉS PAR L'ADMIN === */}
<div className="section">
  <h3><i className="fa-solid fa-user"></i> Utilisateurs créés</h3>
  {admin.users && admin.users.length === 0 ? (
    <p className="empty">Aucun utilisateur créé par cet administrateur.</p>
  ) : (
    <table className="saas-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {admin.users.map((user) => (
          <tr key={user._id}>
            <td>{user.name || "—"} {user.prenom || "—"}</td>
            <td>{user.email || "—"}</td>
            <td>{user.role || "—"}</td>
            <td>{user.isVerified ? "✅ Vérifié" : "❌ Non vérifié"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

          {/* === HISTORIQUE DES ABONNEMENTS === */}
          <div className="section">
            <h3><i className="fa-solid fa-receipt"></i> Historique des abonnements</h3>
            {subscriptions.length === 0 ? (
              <p className="empty">Aucun abonnement trouvé pour cet administrateur.</p>
            ) : (
              <>
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Début</th>
                      <th>Fin</th>
                      <th>Prix</th>
                      <th>Méthode</th>
                      <th>Statut paiement</th>
                      <th>État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubscriptions.map((sub) => (
                      <tr key={sub._id}>
                        <td>{sub.subscriptionType}</td>
                        <td>{new Date(sub.subscriptionStart).toLocaleDateString("fr-FR")}</td>
                        <td>{new Date(sub.subscriptionEnd).toLocaleDateString("fr-FR")}</td>
                        <td>{sub.subscriptionPrice} FCFA</td>
                        <td>{sub.paymentMethod}</td>
                        <td>
                          <span className={`status-badge ${sub.paymentStatus === "paid" ? "paid" : sub.paymentStatus === "pending" ? "pending" : "failed"}`}>
                            {sub.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${sub.active ? "active" : "expired"}`}>
                            {sub.active ? "Actif" : "Expiré"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination" style={{ marginTop: "1rem", textAlign: "center" }}>
                  <button disabled={currentSubPage === 1} onClick={() => setCurrentSubPage(prev => prev - 1)} style={{ marginRight: "0.5rem" }}>← Précédent</button>
                  <span>Page {currentSubPage} / {totalSubPages}</span>
                  <button disabled={currentSubPage === totalSubPages} onClick={() => setCurrentSubPage(prev => prev + 1)} style={{ marginLeft: "0.5rem" }}>Suivant →</button>
                </div>
              </>
            )}
          </div>

          {/* === PROJETS === */}
  <div className="section">
  <h3><i className="fa-solid fa-building"></i> Projets</h3>
  
  {projects.length === 0 ? (
    <p className="empty">Aucun projet enregistré.</p>
  ) : (
    <table className="saas-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Adresse</th>
          <th>Type</th>
          <th>Total biens</th>
          <th>Biens libres</th>
          <th>Biens occupés</th>
          <th>Locataires</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => {
          const totalHomes = p.homeIds?.length || 0;
          const occupiedHomes = p.homeIds?.filter(h => h.personId).length || 0;
          const freeHomes = totalHomes - occupiedHomes;
          const locatairesCount = countLocatairesByProject(p._id);

          return (
            <React.Fragment key={p._id}>
              <tr 
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(prev => prev === p._id ? null : p._id)}
              >
                <td>{p.name}</td>
                <td>{p.location || "—"}</td>
                <td>{p.type || "—"}</td>
                <td>{totalHomes}</td>
                <td>{freeHomes}</td>
                <td>{occupiedHomes}</td>
                <td>{locatairesCount}</td>
              </tr>

             {isOpen === p._id && (
  <tr className="project-details-row">
    <td colSpan={7}>
      <div style={{ padding: "10px", background: "#f9fafb", borderRadius: "8px" }}>
        <h4>Détails des biens et locataires</h4>
        {p.homeIds?.length > 0 ? (
          <table className="saas-table" style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Nom du bien</th>
                <th>Nom</th>
                <th>Prénom(s)</th>
                <th>Contacts</th>
                <th>Email</th>
                <th>Adresse</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {p.homeIds.map((h, idx) => (
                <tr key={idx}>
                  <td>{h.nameHome || "—"}</td>
                  <td>{h.personId?.name || "Libre"}</td>
                  <td>{h.personId?.lastname || "—"}</td>
                  <td>{h.personId?.tel || "—"}</td>
                  <td>{h.personId?.email || "—"}</td>
                  <td>{h.personId?.address || "—"}</td>
                  <td>{h.personId?.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ margin: 0 }}>Aucun bien associé à ce projet.</p>
        )}
      </div>
    </td>
  </tr>
)}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  )}
</div>

          {/* === LOCATAIRES === */}
          {/* <div className="section">
            <h3><i className="fa-solid fa-users"></i> Locataires</h3>
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
          </div> */}

          {/* === DOCUMENTS === */}
          <div className="section">
            <h3><i className="fa-solid fa-folder-open"></i> Documents</h3>
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
                        <a href={`http://localhost:4000/${doc.filePath}`} target="_blank" rel="noopener noreferrer">
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

      <RenewSubscriptionModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        admin={admin}
        onRenew={(newEndDate) => setAdmin({ ...admin, subscriptionEnd: newEndDate })}
      />

      {/* === STYLES === */}
      <style>{`
        /* Gardé exactement le même style que ton code d'origine */
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
        .btn-renew { background: #16a34a; margin: 0.4rem}
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
        .subscription-badge { margin-top: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .subscription-badge { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; box-shadow: 0 3px 6px rgba(0,0,0,0.05); }
        .badge-status { display: flex; align-items: center; justify-content: space-between; }
        .badge { padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.95rem; color: #fff; text-transform: capitalize; display: inline-flex; align-items: center; gap: 6px; }
        .badge.active { background-color: #22c55e; }
        .badge.expired { background-color: #ef4444; }
        .badge.suspended { background-color: #f59e0b; }
        .subscription-type { background: #eef2ff; color: #4f46e5; font-weight: 600; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; }
        .subscription-info { display: flex; justify-content: space-between; font-size: 0.9rem; color: #374151; }
        .subscription-info p { margin: 0; }
        .pagination button { padding: 6px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}