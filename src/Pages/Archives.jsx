import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useMemo } from "react";
import { Blocks } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import PermissionModal from "./PermissionModal";

export default function Archives() {
  const { user, hasFeature } = useUserContext();
  const [archives, setArchives] = useState([]);
  const [homes, setHomes] = useState([]);
  const [projects, setProjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("archiveSearchTerm") || "");
  const [selectedType, setSelectedType] = useState(localStorage.getItem("archiveSelectedType") || "");
  const [searchProject, setSearchProject] = useState(localStorage.getItem("archiveSearchProject") || "");

  const [currentPageArchives, setCurrentPageArchives] = useState(parseInt(localStorage.getItem("archiveCurrentPageArchives")) || 1);
  const [currentPageHomes, setCurrentPageHomes] = useState(parseInt(localStorage.getItem("archiveCurrentPageHomes")) || 1);

  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("locataires"); // "locataires" ou "biens"
  const navigate = useNavigate();

  const itemsPerPage = 15;

  // --- Persistance locale ---
  useEffect(() => { localStorage.setItem("archiveSearchTerm", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("archiveSelectedType", selectedType); }, [selectedType]);
  useEffect(() => { localStorage.setItem("archiveSearchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("archiveCurrentPageArchives", currentPageArchives); }, [currentPageArchives]);
  useEffect(() => { localStorage.setItem("archiveCurrentPageHomes", currentPageHomes); }, [currentPageHomes]);

  // --- Vérification permission ---
  useEffect(() => {
    if (!user) return;
    const hasPermission = user.role === "admin" || user.permissions?.includes("view_archives");
    if (!hasPermission) {
      setShowPermissionModal(true);
      toast.error("Vous n'êtes pas autorisé à accéder aux archives.");
    }
  }, [user]);

  // --- Récupération des données ---
  useEffect(() => {
    if (!user?._id || !user?.token) return;
    const adminId = user.role === "admin" ? user._id : user.adminId;
    if (!adminId) return;

    const fetchArchives = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (searchProject) queryParams.append("projectId", searchProject);
        if (selectedType) queryParams.append("type", selectedType);

        const url = `https://backend-ged-immo.onrender.com/archives/admin/${adminId}?${queryParams.toString()}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Erreur de chargement des archives");

        setProjects(data.projects || []);
        setArchives(data.archives || []);
        setHomes(data.archivedHomes || []);
      } catch (err) {
        console.error("Erreur récupération archives :", err);
        toast.error("Erreur récupération archives : " + err.message);
        setArchives([]); setHomes([]); setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [user, selectedType, searchProject]);

  // --- Filtrage complet Archives ---
  const filteredArchives = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return archives.filter(a => {
      const fullText = `
        ${a.name || ""}
        ${a.lastname || ""}
        ${a.raisonSociale || ""}
        ${a.tel || ""}
        ${a.homeInfo?.nameHome || ""}
        ${a.homeId?.projectId?.name || ""}
      `.toLowerCase();

      const matchText = term === "" || fullText.includes(term);
      const matchType = selectedType ? (a.typePersonne || "").toLowerCase() === selectedType.toLowerCase() : true;
      const matchProject = searchProject ? (a.homeId?.projectId?._id === searchProject) : true;

      return matchText && matchType && matchProject;
    });
  }, [archives, searchTerm, selectedType, searchProject]);

  // --- Filtrage complet Maisons ---
  const filteredHomes = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return homes.filter(h => {
      const fullText = `
        ${h.nameHome || ""}
        ${h.addressHome || ""}
        ${h.categorie || ""}
        ${h.projectId?.name || ""}
      `.toLowerCase();

      const matchText = term === "" || fullText.includes(term);
      const matchType = selectedType ? (h.categorie || "").toLowerCase() === selectedType.toLowerCase() : true;
      const matchProject = searchProject ? (h.projectId?._id === searchProject) : true;

      return matchText && matchType && matchProject;
    });
  }, [homes, searchTerm, selectedType, searchProject]);

  // --- Pagination ---
  const indexLastArchive = currentPageArchives * itemsPerPage;
  const indexFirstArchive = indexLastArchive - itemsPerPage;
  const currentArchivesPage = filteredArchives.slice(indexFirstArchive, indexLastArchive);
  const totalPagesArchives = Math.ceil(filteredArchives.length / itemsPerPage);

  const indexLastHome = currentPageHomes * itemsPerPage;
  const indexFirstHome = indexLastHome - itemsPerPage;
  const currentHomesPage = filteredHomes.slice(indexFirstHome, indexLastHome);
  const totalPagesHomes = Math.ceil(filteredHomes.length / itemsPerPage);

  // --- Vérification du plan ---
  useEffect(() => {
    if (!hasFeature("archives")) {
      toast.error("🔒 Fonction non disponible dans le plan Gratuit. Passez à Standard pour l’activer.");
    }
  }, [hasFeature, navigate]);

 

  return (
    
    <div>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="saas-container">
        <div className="saas-card">
          <nav aria-label="breadcrumb" className="breadcrumb-custom">
            <ol>
              <li><Link to="/Accueil">Accueil</Link></li>
              <li className="active"><i className="fa-solid fa-box-archive"></i> Mes archives</li>
            </ol>
          </nav>

          <div className="header-actions">
            <h2><i className="fa-solid fa-box-archive"></i> Mes archives</h2>
          </div>

          {/* --- Onglets Locataires / Biens --- */}
          <div className="tabs-section">
            <button className={activeTab === "locataires" ? "tab-active" : ""} onClick={() => setActiveTab("locataires")}>Locataires</button>
            <button className={activeTab === "biens" ? "tab-active" : ""} onClick={() => setActiveTab("biens")}>Biens</button>
          </div>

          {/* --- Filtres dynamiques --- */}
          <div className="filter-section">
            <select
              className="select-field"
              value={selectedType}
              onChange={e => { setSelectedType(e.target.value); setCurrentPageArchives(1); setCurrentPageHomes(1); }}
            >
              <option value="">Tous les types</option>
              {[...new Set(projects.map(p => p.categorie || p.type || ""))].map((type, idx) => (
                <option key={idx} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>

            <select
              className="select-field"
              value={searchProject}
              onChange={e => { setSearchProject(e.target.value); setCurrentPageArchives(1); setCurrentPageHomes(1); }}
            >
              <option value="">Tous les projets</option>
              {projects
                .filter(p => !selectedType || (p.categorie || p.type || "").toLowerCase() === selectedType.toLowerCase())
                .map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>

            <input
              type="text"
              className="search-input"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPageArchives(1); setCurrentPageHomes(1); }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Blocks visible={true} height="80" width="80" />
            </div>
          ) : (
            <>
              {activeTab === "locataires" && (
                <TableSection
                  data={currentArchivesPage}
                  totalPages={totalPagesArchives}
                  currentPage={currentPageArchives}
                  setCurrentPage={setCurrentPageArchives}
                  type="locataire"
                />
              )}
              {activeTab === "biens" && (
                <TableSection
                  data={currentHomesPage}
                  totalPages={totalPagesHomes}
                  currentPage={currentPageHomes}
                  setCurrentPage={setCurrentPageHomes}
                  type="bien"
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

      {/* --- Composant TableSection réutilisable --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb-custom ol { display: flex; gap: .5rem; list-style: none; padding: 0; }
        .breadcrumb-custom li { font-size: .9rem; }
        .breadcrumb-custom .active { color: #2563eb; font-weight: bold; }
        .tabs-section { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .tabs-section button { padding: .5rem 1rem; border: none; border-radius: 8px; cursor: pointer; background: #e5e7eb; font-weight: 500; }
        .tabs-section .tab-active { background: #2563eb; color: #fff; }
        .filter-section { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .search-input, .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: .6rem; text-align: center; }
        .table th { background: #f1f5f9; }
        .btn-details { padding: .3rem .6rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        .btn-details:hover { background: #1e40af; }
        .pagination-section { display: flex; justify-content: center; align-items: center; gap: .5rem; margin-top: 1rem; }
        .tenant-section { margin-top: 2rem; }
        .table-responsive { overflow-x: auto; }
      `}</style>
    </div>
  );
}

// --- TableSection ---
function TableSection({ data, totalPages, currentPage, setCurrentPage, type }) {
  return (
    <div className="tenant-section">
      <div className="table-responsive">
        <table className="table">
          <thead>
            {type === "locataire" ? (
              <tr>
                <th>Nom / Société</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Bien</th>
                <th>Projet</th>
                <th>Archivé par</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            ) : (
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Catégorie</th>
                <th>Projet</th>
                <th>Archivé par</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            )}
          </thead>
        <tbody>
  {data.length === 0 ? (
    <tr>
      <td colSpan={type === "locataire" ? 8 : 7} style={{ textAlign: "center" }}>
        Aucun élément trouvé
      </td>
    </tr>
  ) : data.map(item => (
    <tr key={item._id}>
      {type === "locataire" ? (
        <>
          <td>{item.typePersonne === "societe" ? item.raisonSociale || "Société" : `${item.name || ""} ${item.lastname || ""}`}</td>
          <td>{item.tel || "N/A"}</td>
          <td>{item.typePersonne === "societe" ? "Société" : "Particulier"}</td>
          <td>{item.homeInfo?.nameHome || "—"}</td>
          <td>{item.homeId?.projectId?.name || "—"}</td>
          <td>{item.createdBy || "—"}</td>
          <td>{item.archivedAt ? new Date(item.archivedAt).toLocaleDateString("fr-FR") : "—"}</td>
          <td>
            <Link to={`/detailArchivedUser/${item._id}`}>
              <button className="btn-details">Détails</button>
            </Link>
          </td>
        </>
      ) : (
        <>
          <td>{item.nameHome}</td>
          <td>{item.addressHome}</td>
          <td>{item.categorie}</td>
          <td>{item.projectId?.name}</td>
          <td>{item.archivedInfo?.archivedByName || "—"}</td> {/* <-- Affiche archivedByName */}
          
          <td>{item.dateArchived ? new Date(item.dateArchived).toLocaleDateString("fr-FR") : "—"}</td>
          <td>
            <Link to={`/detailArchivedHome/${item._id}`}>
              <button className="btn-details">Détails</button>
            </Link>
          </td>
        </>
      )}
    </tr>
  ))}
</tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-section">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀</button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>▶</button>
          </div>
        )}
      </div>
    </div>
  );
}