import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGedContext } from "../../contexts/GedContext";
import Footer from "../Footer";
import { Blocks } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import NavbarGED from "./NavbarGED";

export default function AdminsGED() {
  const { gedUser, fetchGedData, admins = [], projects = [], documents = [] } = useGedContext();
  const token = localStorage.getItem("gedToken");

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Champs formulaire
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  // Charger les données GED à l'ouverture
  useEffect(() => {
    fetchGedData();
  }, []);

  // Ajouter un admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = { fullname, email, phone, password, company };
      const res = await fetch("https://backend-ged-immo.onrender.com/ged/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur ajout admin");

      toast.success("Administrateur ajouté avec succès ✅");
      setShowAddModal(false);
      setFullname("");
      setEmail("");
      setPhone("");
      setPassword("");
      setCompany("");
      fetchGedData(); // 🔁 Recharger la liste
    } catch (err) {
      toast.error("Erreur : " + err.message);
    }
  };

  // Supprimer un admin
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet administrateur ?")) return;
    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/ged/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Admin supprimé 🗑️");
        fetchGedData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Erreur : " + err.message);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <NavbarGED />

      <div className="saas-container">
        {/* === SECTION STATS === */}
        <div className="stats-container">
          <div className="stat-card">
            <i className="fa-solid fa-user-shield"></i>
            <div>
              <h4>{admins.length}</h4>
              <p>Administrateurs</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-building"></i>
            <div>
              <h4>{projects.length}</h4>
              <p>Projets</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-file-alt"></i>
            <div>
              <h4>{documents.length}</h4>
              <p>Documents</p>
            </div>
          </div>
        </div>

        {/* === LISTE DES ADMINS === */}
        <div className="saas-card">
          {/* <div className="header-actions">
            <h2>
              <i className="fa-solid fa-user-shield"></i> Gestion des Administrateurs
            </h2>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <i className="fa-solid fa-plus"></i> Ajouter un admin
            </button>
          </div> */}

          {/* Barre de recherche */}
          <div className="filter-section">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Rechercher un administrateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-section">
  {loading ? (
    <div className="loading">
      <Blocks visible={true} height="80" width="80" />
    </div>
  ) : (
   <table className="saas-table">
  <thead>
    <tr>
      <th>Nom complet</th>
      <th>Email</th>
      <th>Téléphone</th>
      <th>Entreprise</th>
      <th>Date d'inscription</th>
      <th>Statut</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredAdmins.length === 0 ? (
      <tr>
        <td colSpan="7" style={{ textAlign: "center" }}>
          Aucun administrateur trouvé
        </td>
      </tr>
    ) : (
      filteredAdmins.map((a) => {
  const now = new Date();
  let status = "inactif";

  if (a.suspended) {
    status = "suspendu";
  } else if (a.subscriptionEnd && new Date(a.subscriptionEnd) < now) {
    status = "expiré";
  } else if (a.active || (a.subscriptionEnd && new Date(a.subscriptionEnd) >= now)) {
    status = "actif";
  }

  return (
    <tr key={a._id}>
      <td>{a.fullname}</td>
      <td>{a.email}</td>
      <td>{a.number || "—"}</td>
      <td>{a.company || "—"}</td>
      <td>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>

      <td>
        <span
          className={`status-badge ${
            status === "suspendu"
              ? "badge-suspended"
              : status === "expiré"
              ? "badge-expired"
              : status === "actif"
              ? "badge-active"
              : "badge-inactive"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>

      <td>
        <Link to={`/ged/admin/${a._id}`}>
          <button className="btn-details">
            <i className="fa-solid fa-eye"></i> Voir
          </button>
        </Link>
      </td>
    </tr>
  );
})
    )}
  </tbody>
    </table>
  )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal-container">
          <div className="modal-contents">
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-user-plus"></i> Ajouter un administrateur
              </h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <form className="modal-body form-grid" onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Entreprise / Projet</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }

        /* === STATISTIQUES === */
        .stats-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          flex: 1;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-card i {
          font-size: 1.8rem;
          color: #2563eb;
        }
        .stat-card h4 { margin: 0; font-size: 1.4rem; color: #111827; }
        .stat-card p { margin: 0; color: #6b7280; }

        /* === TABLE & FORM === */
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .btn-add { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; }
        .btn-add:hover { background: #1e40af; }
        .search-wrapper { position: relative; flex: 1; max-width: 300px; }
        .search-wrapper input { width: 100%; padding: .5rem 2.5rem .5rem .8rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .saas-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .saas-table th, .saas-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .saas-table th { background: #f1f5f9; }
        .btn-details, .btn-delete { padding: .4rem .8rem; border-radius: 6px; border: none; cursor: pointer; margin-right: .3rem; }
        .btn-details { background: #2563eb; color: #fff; }
        .btn-delete { background: #ef4444; color: #fff; }
        .btn-details:hover { background: #1e40af; }
        .btn-delete:hover { background: #dc2626; }
        .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-block;
      text-transform: capitalize;
    }
    .badge-active {
      background: #16a34a1a;
      color: #16a34a;
      border: 1px solid #16a34a33;
    }
    .badge-suspended {
      background: #facc151a;
      color: #ca8a04;
      border: 1px solid #facc1533;
    }
    .badge-expired {
      background: #f871711a;
      color: #dc2626;
      border: 1px solid #f8717133;
    }
      `}</style>
    </div>
  );
}