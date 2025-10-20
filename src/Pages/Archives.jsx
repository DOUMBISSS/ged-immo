// Archives.jsx
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useMemo } from "react";
import { Blocks } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import PermissionModal from "./PermissionModal";

export default function Archives() {
  const { user } = useUserContext();
  const [persons, setPersons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchProject, setSearchProject] = useState(() => localStorage.getItem("archiveSearchProject") || "");
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("archiveSearchTerm") || "");
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem("archiveCurrentPage")) || 1);
  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const itemsPerPage = 15;

  // 🔹 Sauvegarde localStorage
  useEffect(() => { localStorage.setItem("archiveSearchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("archiveSearchTerm", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("archiveCurrentPage", currentPage); }, [currentPage]);

useEffect(() => {
  if (!user) return; // pas encore chargé

  // Un admin a automatiquement tous les droits
  const hasPermission = user.role === "admin" || (user.permissions?.includes("view_archives"));

  if (!hasPermission) {
    setShowPermissionModal(true);
    toast.error("Vous n'êtes pas autorisé à accéder aux archives.");
  }
}, [user]);

  // 🔹 Récupérer projets + archives pour l'admin connecté
  useEffect(() => {
    if (!user?._id || !user?.token) return;

    const adminIdToFetch = user.role === 'admin' ? user._id : user.adminId;

    if (!adminIdToFetch) {
      toast.error("Impossible de récupérer les archives : aucun administrateur lié.");
      setProjects([]);
      setPersons([]);
      return;
    }

    const fetchArchives = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/archives/admin/${adminIdToFetch}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();

        if (data.success) {
          setProjects(data.projects || []);
          setPersons(data.archives || []);
        } else {
          toast.error(data.message || "Erreur récupération archives");
          setProjects([]);
          setPersons([]);
        }
      } catch (err) {
        toast.error("Erreur récupération archives : " + err.message);
        setProjects([]);
        setPersons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [user]);

  // 🔹 Filtrage locataires
  const filteredPersons = useMemo(() => {
    return searchTerm
      ? persons.filter(p => `${p.name || ""} ${p.lastname || ""}`.toLowerCase().includes(searchTerm.toLowerCase()))
      : persons;
  }, [persons, searchTerm]);

  // 🔹 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPersons = filteredPersons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);

  return (
    <div>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="saas-container">
        <div className="saas-card">
          <nav aria-label="breadcrumb" className="breadcrumb-custom">
            <ol>
              <li><Link to='/Accueil'>Accueil</Link></li>
              <li className="active"><i className="fa-solid fa-box-archive"></i> Mes archives</li>
            </ol>
          </nav>

          <div className="header-actions">
            <h2><i className="fa-solid fa-box-archive"></i> Mes archives</h2>
          </div>

          {/* Filtres */}
          <div className="filter-section">
            <select
              className="select-field"
              value={searchProject}
              onChange={(e) => { setSearchProject(e.target.value); setCurrentPage(1); }}
            >
              <option value="">-- Sélectionner un projet --</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>

            {searchProject && (
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher un locataire..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            )}
          </div>

          {!searchProject ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              Veuillez sélectionner un projet pour afficher les archives.
            </p>
          ) : (
            <>
              {/* Locataires archivés */}
              <div className="tenant-section">
                <h3>📌 Locataires archivés</h3>
                {loading ? (
                  <Blocks visible={true} height="80" width="100%" ariaLabel="loading" />
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Nom & Prénom(s)</th>
                          <th>Contacts</th>
                          <th>Bien</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPersons.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>Aucun locataire trouvé</td>
                          </tr>
                        ) : (
                          currentPersons.map(person => (
                            <tr key={person._id}>
                              <td>{person.name} {person.lastname}</td>
                              <td>{person.tel}</td>
                              <td>{person.homeInfo?.categorie || "N/A"}</td>
                              <td><span className="badge badge-archived">Archivé</span></td>
                              <td>
                                <Link to={`/detailArchivedUser/${person._id}`}>
                                  <button className="btn-details">Détails</button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-section">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>▶</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🔹 Modal permission */}
      <PermissionModal
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title="Accès refusé"
        message="Vous n'êtes pas autorisé à accéder aux archives."
      />

      <Footer />
      <Toaster position="top-right" reverseOrder={false} />

      {/* CSS inchangé */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb-custom ol { display: flex; gap: .5rem; list-style: none; padding: 0; }
        .breadcrumb-custom li { font-size: .9rem; }
        .breadcrumb-custom .active { color: #2563eb; font-weight: bold; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-input, .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .tenant-section { margin-bottom: 2rem; }
        .tenant-section h3 { margin-bottom: 1rem; font-size: 1.2rem; color: #111827; }
        .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .table th, .table td { padding: .6rem; border: 1px solid #e5e7eb; text-align: center; }
        .table th { background: #f1f5f9; }
        .btn-details { padding: .3rem .6rem; border: none; border-radius: 6px; background: #2563eb; color: #fff; cursor: pointer; }
        .btn-details:hover { background: #1e40af; }
        .badge-archived { background: #ef4444; color: #fff; padding: .2rem .6rem; border-radius: 12px; font-size: 12px; }
        .pagination { margin-top: 1rem; display: flex; gap: .3rem; justify-content: center; }
        .pagination button { padding: .4rem .8rem; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; }
        .pagination button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
      `}</style>
    </div>
  );
}