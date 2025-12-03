import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserMagasin } from "../../contexts/UserMagasinContext";
import NavbarMagasin from "../Magasin/NavbarMagasin";
import Footer from "../Footer";
import { Blocks } from "react-loader-spinner";
import { toast } from "react-toastify";

export default function ListeMagasin() {
  const navigate = useNavigate();
  const { magasinUser, logoutMagasinUser } = useUserMagasin();

  const [magasins, setMagasins] = useState([]);
  const [projects, setProjects] = useState([]);
  const [homes, setHomes] = useState([]);
  const [searchProject, setSearchProject] = useState(() => localStorage.getItem("searchProject") || "");
  const [search, setSearch] = useState(() => localStorage.getItem("search") || "");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedHome, setSelectedHome] = useState(null);

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const itemsPerPage = 15;

  // Sauvegarde automatique dans localStorage
  useEffect(() => { localStorage.setItem("searchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("search", search); }, [search]);
  useEffect(() => { localStorage.setItem("currentPage", currentPage); }, [currentPage]);

  // 🔹 Récupération unifiée des magasins
  useEffect(() => {
    if (!magasinUser?._id) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://backend-ged-immo.onrender.com/magasins/${magasinUser._id}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Erreur lors de la récupération des magasins.");
          return;
        }

        if (data.success) {
          setProjects(data.projects || []);
          setMagasins(data.magasins || []);
        } else {
          toast.error(data.message || "Aucune donnée trouvée.");
        }
      } catch (err) {
        toast.error("Erreur serveur : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [magasinUser]);

  const logoutHandler = () => { logoutMagasinUser(); navigate("/login"); };

  const handleSearch = (event) => { setSearch(event.target.value); setCurrentPage(1); };

  const filteredMagasins = magasins
    .filter(mag => !mag.archived)
    .filter(mag => !searchProject || String(mag.homeId?.projectId) === searchProject)
    .filter(mag => search === "" || mag.name?.toLowerCase().includes(search.toLowerCase()));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMagasins = filteredMagasins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMagasins.length / itemsPerPage);

  // ✅ Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setSelectedProject("");
    setSelectedHome(null);
    setName("");
    setLocation("");
    setOwner("");
    setTel("");
    setEmail("");
    setAddress("");
  };

  // Champs formulaire magasin
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [modalError, setModalError] = useState("");

  const handleAddMagasin = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!selectedProject) return setModalError("Sélectionnez un projet.");
    if (!selectedHome) return setModalError("Sélectionnez un local.");
    if (!name) return setModalError("Nom du magasin requis.");

    try {
      const payload = {
        name,
        location,
        owner,
        tel,
        email,
        address,
        projectId: selectedProject,
        homeId: selectedHome?._id || null,
        adminId: magasinUser._id,
      };

      const res = await fetch("https://backend-ged-immo.onrender.com/New/Magasin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${magasinUser?.token}` },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) return setModalError(result?.message || "Erreur serveur");
      if (!result.success) return setModalError(result.message || "Échec de l'ajout du magasin.");

      setShowAddModal(false);
      setMagasins(prev => [result.magasin, ...prev]);
      resetForm();
    } catch (err) {
      setModalError("Erreur serveur : " + err.message);
    }
  };

  return (
    <div>
      <NavbarMagasin logoutHandler={logoutHandler} />
      <div className="saas-container">
        <div className="saas-card">
          <div className="header-actions">
            <h2><i className="fa-solid fa-store"></i> Magasins</h2>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <i className="fa-solid fa-plus"></i> Ajouter un magasin
            </button>
          </div>

          {/* Filtres */}
          <div className="filter-section">
            <select
              value={searchProject}
              onChange={(e) => { setSearchProject(e.target.value); setCurrentPage(1); }}
              className="select-field"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>

            <div className="search-wrapper">
              <input type="text" placeholder="Rechercher un magasin..." value={search} onChange={handleSearch} />
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </div>
          </div>

          {/* Tableau magasins */}
          <div className="table-section">
            {loading ? (
              <div className="loading"><Blocks visible={true} height="80" width="80" /></div>
            ) : (
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Propriétaire</th>
                    <th>Localisation</th>
                    <th>Tel</th>
                    <th>Email</th>
                    <th>Adresse</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {!searchProject ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", fontStyle: "italic" }}>
                      Veuillez sélectionner un projet pour voir les magasins
                    </td></tr>
                  ) : currentMagasins.length > 0 ? (
                    currentMagasins.map(mag => (
                      <tr key={mag._id}>
                        <td>{mag.name}</td>
                        <td>{mag.owner}</td>
                        <td>{mag.location}</td>
                        <td>{mag.tel}</td>
                        <td>{mag.email}</td>
                        <td>{mag.address}</td>
                        <td>
                          <Link to={`/detailMagasin/${mag._id}`}>
                            <button className="btn-details">Détails</button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" style={{ textAlign: "center", fontStyle: "italic" }}>
                      Aucun magasin trouvé
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Précédent</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Suivant</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal ajout magasin */}
      {showAddModal && (
        <div className="modal-container">
          <div className="modal-contents">
            <div className="modal-header">
              <h2><i className="fa-solid fa-store-plus"></i> Ajouter un nouveau magasin</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            {modalError && (
              <div style={{ margin: '10px 0', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
                {modalError}
              </div>
            )}

            <form className="modal-body form-grid" onSubmit={handleAddMagasin}>
              <div className="form-group">
                <label>Nom du magasin</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Propriétaire</label>
                <input type="text" required value={owner} onChange={e => setOwner(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input type="text" required value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tel</label>
                <input type="text" required value={tel} onChange={e => setTel(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input type="text" required value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Projet</label>
                <select required value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="select-field">
                  <option value="">Sélectionner un projet</option>
                  {projects.map(proj => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CSS intégré --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; margin-bottom: 2rem; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .btn-add { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btn-add:hover { background: #1e40af; }
        .filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .search-wrapper { position: relative; flex: 1; max-width: 250px; }
        .search-wrapper input { width: 100%; padding: .5rem 2.5rem .5rem .8rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .search-icon { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .table-section { overflow-x: auto; }
        .loading { display: flex; justify-content: center; align-items: center; height: 40vh; }
        .saas-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .saas-table th, .saas-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .saas-table th { background: #f1f5f9; }
        .btn-details { padding: .4rem .8rem; border-radius: 6px; border: none; background: #2563eb; color: #fff; cursor: pointer; }
        .btn-details:hover { background: #1e40af; }
        .pagination { margin-top: 1rem; display: flex; gap: .3rem; justify-content: center; }
        .pagination button { padding: .4rem .8rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; background: #fff; }
        .pagination button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .pagination button:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}