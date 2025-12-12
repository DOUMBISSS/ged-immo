import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useMemo } from "react";
import { Blocks } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import PermissionModal from "./PermissionModal";

export default function Archives() {
  const { user, hasFeature,getAuthHeaders } = useUserContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // ==== 3 jeux de données ====
  const [tenants, setTenants] = useState([]);
  const [homes, setHomes] = useState([]);
  const [projects, setProjects] = useState([]);

  // ==== Filtres ====
  const [search, setSearch] = useState("");

  const [tenantType, setTenantType] = useState("");
  const [tenantProject, setTenantProject] = useState("");

  const [homeType, setHomeType] = useState("");
  const [homeProject, setHomeProject] = useState("");

  // ==== Pagination séparée ====
  const [pageTenant, setPageTenant] = useState(1);
  const [pageHome, setPageHome] = useState(1);
  const [pageProject, setPageProject] = useState(1);
  const itemsPerPage = 15;

  const [activeTab, setActiveTab] = useState("locataires");

  // // ==== Vérification permissions ====
  // useEffect(() => {
  //   if (!user) return;

  //   const allowed =
  //     user.role === "admin" || user.permissions?.includes("view_archives");

  //   if (!allowed) {
  //     setShowPermissionModal(true);
  //     toast.error("Vous n'êtes pas autorisé à accéder aux archives.");
  //   }
  // }, [user]);

  // ==== Charger données backend ====
  useEffect(() => {
    if (!user?.token) return;

    const adminId = user.role === "admin" ? user._id : user.adminId;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:4000/archives/admin/${adminId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        setTenants(data.archivedTenants || []);
        setHomes(data.archivedHomes || []);
        setProjects(data.archivedProjects || []);
      } catch (err) {
        toast.error("Erreur: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // ============= FILTRAGE INDEPENDANT ==================

  // --- Locataires ---
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const txt = `${t.name} ${t.lastname} ${t.raisonSociale} ${t.tel} ${
        t.homeInfo?.nameHome
      } ${t.homeId?.projectId?.name}`.toLowerCase();

      const matchSearch = txt.includes(search.toLowerCase());
      const matchType = tenantType ? t.typePersonne === tenantType : true;
      const matchProject = tenantProject
        ? t.homeId?.projectId?._id === tenantProject
        : true;

      return matchSearch && matchType && matchProject;
    });
  }, [tenants, search, tenantType, tenantProject]);

  // --- Maisons ---
  const filteredHomes = useMemo(() => {
    return homes.filter((h) => {
      const txt = `${h.nameHome} ${h.addressHome} ${h.categorie} ${
        h.projectId?.name
      }`.toLowerCase();

      const matchSearch = txt.includes(search.toLowerCase());
      const matchType = homeType ? h.categorie === homeType : true;
      const matchProject = homeProject
        ? h.projectId?._id === homeProject
        : true;

      return matchSearch && matchType && matchProject;
    });
  }, [homes, search, homeType, homeProject]);

  // --- Projets ---
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const txt = `${p.name} ${p.type} ${p.description}`.toLowerCase();
      return txt.includes(search.toLowerCase());
    });
  }, [projects, search]);

  // ============= PAGINATION ==================

  const paginatedTenants = filteredTenants.slice(
    (pageTenant - 1) * itemsPerPage,
    pageTenant * itemsPerPage
  );

  const paginatedHomes = filteredHomes.slice(
    (pageHome - 1) * itemsPerPage,
    pageHome * itemsPerPage
  );

  const paginatedProjects = filteredProjects.slice(
    (pageProject - 1) * itemsPerPage,
    pageProject * itemsPerPage
  );

  // ============= RENDU ==================

  return (
    <div>
      <Navbar />
      <Toaster position="top-right" />

      <div className="archives-container">
        <div className="archives-card">
          <h2>📦 Archives</h2>

          <div className="tabs">
            <button
              className={activeTab === "locataires" ? "active" : ""}
              onClick={() => setActiveTab("locataires")}
            >
              Locataires
            </button>
            <button
              className={activeTab === "biens" ? "active" : ""}
              onClick={() => setActiveTab("biens")}
            >
              Biens
            </button>
            <button
              className={activeTab === "projets" ? "active" : ""}
              onClick={() => setActiveTab("projets")}
            >
              Projets
            </button>
          </div>

          {/* --- Barre de recherche globale --- */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            placeholder="Rechercher..."
          />

          {/* ================= CONTENU DES ONGLET ================= */}

          {loading ? (
            <div className="loader">
              <Blocks visible height="80" width="80" />
            </div>
          ) : (
            <>
              {activeTab === "locataires" && (
                <TableTenants
                  data={paginatedTenants}
                  total={filteredTenants.length}
                  page={pageTenant}
                  setPage={setPageTenant}
                />
              )}

              {activeTab === "biens" && (
                <TableHomes
                  data={paginatedHomes}
                  total={filteredHomes.length}
                  page={pageHome}
                  setPage={setPageHome}
                />
              )}

              {activeTab === "projets" && (
                <TableProjects
                  data={paginatedProjects}
                  total={filteredProjects.length}
                  page={pageProject}
                  setPage={setPageProject}
                />
              )}
            </>
          )}
        </div>
      </div>

      <PermissionModal
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title="Accès refusé"
        message="Vous n'êtes pas autorisé à accéder aux archives."
      />

      <Footer />

      <style>{`
        .archives-container {
          background:#f5f7fb;
          min-height:100vh;
          padding:2rem;
        }
        .archives-card {
          background:white;
          padding:2rem;
          border-radius:12px;
          box-shadow:0 6px 20px rgba(0,0,0,0.06);
        }
        .tabs {
          display:flex;
          gap:1rem;
          margin-bottom:1rem;
        }
        .tabs button {
          padding:.6rem 1.2rem;
          border-radius:6px;
          border:none;
          background:#e5e7eb;
          cursor:pointer;
          font-weight:500;
        }
        .tabs button.active {
          background:#2563eb;
          color:white;
        }
        .search-bar {
          width:100%;
          padding:.7rem 1rem;
          border:1px solid #d1d5db;
          border-radius:8px;
          margin-bottom:1rem;
        }
        table {
          width:100%;
          border-collapse:collapse;
          margin-top:1rem;
        }
        th, td {
          padding:.7rem;
          border:1px solid #e5e7eb;
        }
        th {
          background:#f1f5f9;
        }
        .btn-details {
          background:#2563eb;
          color:white;
          padding:.4rem .8rem;
          border-radius:6px;
          border:none;
          cursor:pointer;
        }
      `}</style>
    </div>
  );
}

function TableTenants({ data, total, page, setPage }) {
  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nom / Société</th>
            <th>Contact</th>
            <th>Bien</th>
            <th>Projet</th>
            <th>Archivé le</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucun locataire archivé
              </td>
            </tr>
          ) : (
            data.map((t) => (
              <tr key={t._id}>
                <td>
                  {t.typePersonne === "societe"
                    ? t.raisonSociale
                    : `${t.name} ${t.lastname}`}
                </td>
                <td>{t.tel}</td>
                <td>{t.homeInfo?.nameHome}</td>
                <td>{t.homeId?.projectId?.name}</td>
                <td>
                  {t.archivedAt
                    ? new Date(t.archivedAt).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td>
                  <Link to={`/detailArchivedUser/${t._id}`}>
                    <button className="btn-details">Détails</button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}

function TableHomes({ data, total, page, setPage }) {
  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Adresse</th>
            <th>Catégorie</th>
            <th>Projet</th>
            <th>Archivé le</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucun bien archivé
              </td>
            </tr>
          ) : (
            data.map((h) => (
              <tr key={h._id}>
                <td>{h.nameHome}</td>
                <td>{h.addressHome}</td>
                <td>{h.categorie}</td>
                <td>{h.projectId?.name}</td>
                <td>
                  {h.dateArchived
                    ? new Date(h.dateArchived).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td>
                  <Link to={`/detailArchivedHome/${h._id}`}>
                    <button className="btn-details">Détails</button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}

function TableProjects({ data, total, page, setPage }) {
  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Projet</th>
            <th>Type</th>
            <th>Description</th>
            <th>Archivé le</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Aucun projet archivé
              </td>
            </tr>
          ) : (
            data.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.description}</td>
                <td>
                  {p.archivedAt
                    ? new Date(p.archivedAt).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td>
                  <Link to={`/detailProjectArchived/${p._id}`}>
                    <button className="btn-details">Détails</button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, setPage }) {
  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
      <button onClick={() => setPage(Math.max(1, page - 1))}>◀</button>
      <span>
        {page} / {totalPages}
      </span>
      <button onClick={() => setPage(Math.min(totalPages, page + 1))}>▶</button>
    </div>
  );
}