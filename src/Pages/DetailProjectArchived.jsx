import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Pages/Navbar";
import Footer from "../Pages/Footer";
import toast, { Toaster } from "react-hot-toast";
import { Blocks } from "react-loader-spinner";
import { useUserContext } from "../contexts/UserContext";

const API_BASE = "http://localhost:4000";

export default function DetailProjectArchived() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [project, setProject] = useState(null);
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/archiveProjects/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setProject(data.archive);
      setHomes(data.homes || []);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger le projet archivé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  };

  /** 🔄 Toast de confirmation RESTORE */
  const confirmRestore = () =>
    toast((t) => (
      <div>
        <strong>Restaurer ce projet ?</strong>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button
            className="confirm-btn"
            onClick={() => {
              toast.dismiss(t.id);
              handleRestore();
            }}
          >
            ✔ Oui
          </button>
          <button className="cancel-btn" onClick={() => toast.dismiss(t.id)}>
            ✖ Non
          </button>
        </div>
      </div>
    ));

  /** 🔄 Toast de confirmation DELETE */
  const confirmDelete = () =>
    toast((t) => (
      <div>
        <strong>Supprimer définitivement ?</strong>
        <p style={{ margin: "5px 0", color: "#b91c1c" }}>Action irréversible</p>
        <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
          <button
            className="delete-confirm-btn"
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete();
            }}
          >
            ✔ Supprimer
          </button>

          <button className="cancel-btn" onClick={() => toast.dismiss(t.id)}>
            ✖ Annuler
          </button>
        </div>
      </div>
    ));

  /** 🔄 Restaurer (compatible avec backend) */
  const handleRestore = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Projet restauré !");
      navigate("/Mes__archives");
    } catch (e) {
      toast.error("Erreur lors de la restauration.");
    }
  };

  /** ❌ Suppression définitive (compatible backend) */
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/archive`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Projet supprimé définitivement.");
      navigate("/Mes__archives");
    } catch (e) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            {loading ? (
              <Blocks height="80" width="100%" visible />
            ) : !project ? (
              <div className="home-card">
                <h2>Projet introuvable</h2>
              </div>
            ) : (
              <div className="detail-home-wrapper">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/Mes__archives">Archives</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Projet archivé : {project.name}
                    </li>
                  </ol>
                </nav>

                {/* SECTION INFO */}
                <div className="project-info-card">
                  <div className="info-header">
                    <h2>{project.name}</h2>

                    <div className="buttons">
                      <button className="restore-btn" onClick={confirmRestore}>
                        Restaurer
                      </button>
                      <button className="delete-btn" onClick={confirmDelete}>
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item"><span>Nom :</span> {project.name}</div>
                    <div className="info-item"><span>Type :</span> {project.type}</div>
                    <div className="info-item"><span>Description :</span> {project.description || "Aucune description"}</div>
                    <div className="info-item"><span>Archivé par :</span> {project.archivedBy?.name || "—"}</div>
                    <div className="info-item"><span>Date d'archivage :</span> {formatDate(project.archivedAt)}</div>
                    <div className="info-item"><span>Total biens :</span> {homes.length}</div>
                  </div>
                </div>

                {/* TABLEAU DES BIENS */}
                <div className="homes-table-card">
                  <h3>Biens archivés du projet</h3>

                  {homes.length === 0 ? (
                    <p>Aucun bien dans ce projet archivé.</p>
                  ) : (
                    <table className="homes-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Nom</th>
                          <th>Référence</th>
                          <th>Catégorie</th>
                          <th>Ville</th>
                          <th>Loyer</th>
                          <th>Date archivage</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {homes.map((h) => (
                          <tr key={h._id}>
                            <td>
                              <img
                                src={h.img?.startsWith("http") ? h.img : `${API_BASE}/${h.img}`}
                                alt="visuel"
                                className="home-img"
                              />
                            </td>

                            <td>{h.nameHome}</td>
                            <td>{h.reference || "—"}</td>
                            <td>{h.categorie || "—"}</td>
                            <td>{h.city || "—"}</td>
                            <td>{h.rent ? `${Number(h.rent).toLocaleString()} FCFA` : "—"}</td>
                            <td>{formatDate(h.dateArchived)}</td>

                            <td>
                              <Link to={`/detailArchivedHome/${h._id}`}>
                                <button className="details__btn">Détails</button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            <Toaster position="top-right" />
          </div>
        </div>
      </div>

      <Footer />

      {/* ===== CSS ===== */}
      <style>{`

        .confirm-btn {
          background:#4CAF50;
          color:white;
          padding:6px 12px;
          border-radius:6px;
          border:none;
          cursor:pointer;
          font-weight:600;
        }

        .delete-confirm-btn {
          background:#e53935;
          color:white;
          padding:6px 12px;
          border-radius:6px;
          border:none;
          cursor:pointer;
          font-weight:600;
        }

        .cancel-btn {
          background:#6b7280;
          color:white;
          padding:6px 12px;
          border-radius:6px;
          border:none;
          cursor:pointer;
        }

        .project-info-card {
          background: white;
          padding: 25px;
          border-radius: 14px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .info-header {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:20px;
        }

        .restore-btn {
          background:#2563eb;
          color:white;
          padding:10px 18px;
          border-radius:8px;
          border:none;
          cursor:pointer;
          font-weight:600;
          margin-right:1rem;
        }

        .delete-btn {
          background:#e53935;
          color:white;
          padding:10px 18px;
          border-radius:8px;
          border:none;
          cursor:pointer;
          font-weight:600;
        }

        .info-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
          gap:15px;
        }

        .info-item span {
          font-weight:600;
          color:#555;
        }

        .homes-table-card {
          background:white;
          padding:25px;
          border-radius:14px;
          box-shadow:0 4px 20px rgba(0,0,0,0.08);
        }

        .homes-table {
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }

        .homes-table th {
          background:#f4f4f4;
          padding:12px;
          text-align:left;
        }

        .homes-table td {
          padding:10px;
          border-bottom:1px solid #eee;
        }

        .home-img {
          width:70px;
          height:70px;
          object-fit:cover;
          border-radius:6px;
        }

        .details__btn {
          background:#0d6efd;
          color:white;
          border:none;
          padding:7px 14px;
          border-radius:6px;
          cursor:pointer;
        }

      `}</style>
    </div>
  );
}