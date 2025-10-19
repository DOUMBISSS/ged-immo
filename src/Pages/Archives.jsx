// Archives.jsx
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useMemo } from "react";
import { Blocks } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";

export default function Archives() {
  const { user } = useUserContext();
  const [persons, setPersons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchProject, setSearchProject] = useState(() => localStorage.getItem("archiveSearchProject") || "");
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("archiveSearchTerm") || "");
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem("archiveCurrentPage")) || 1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  // Sauvegarde localStorage
  useEffect(() => { localStorage.setItem("archiveSearchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("archiveSearchTerm", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("archiveCurrentPage", currentPage); }, [currentPage]);

  // 🔹 Récupérer projets de l'admin
  useEffect(() => {
    if (!user?._id) return;
    fetch(`http://localhost:4000/projects/admin/${user._id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProjects(data.projects || []);
      })
      .catch(err => toast.error("Erreur récupération projets : " + err.message));
  }, [user]);

  // 🔹 Récupérer archives locataires
  useEffect(() => {
    if (!user?.token) return;

    const fetchArchives = async () => {
      try {
        setLoading(true);
        const archivesUrl = searchProject
          ? `http://localhost:4000/archives?projectId=${searchProject}`
          : `http://localhost:4000/archives`;

        const resPersons = await fetch(archivesUrl, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json());
        setPersons(resPersons.success ? resPersons.archives : []);

        if (!resPersons.success) toast.error(resPersons.message || "Aucun locataire archivé trouvé");

      } catch (err) {
        toast.error("Erreur récupération archives : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [user, searchProject]);

  // 🔹 Filtrage locataires
  const filteredPersons = useMemo(() => {
    return searchTerm
      ? persons.filter(p => `${p.name || ""} ${p.lastname || ""}`.toLowerCase().includes(searchTerm.toLowerCase()))
      : persons;
  }, [persons, searchTerm]);

  // Pagination
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