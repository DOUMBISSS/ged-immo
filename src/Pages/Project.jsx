import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import Footer from './Footer';
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";

export default function Project() {
  const { user } = useUserContext();
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState(() => localStorage.getItem("projectSearch") || "");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("projectPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const itemsPerPage = 12;

  const modalRef = useRef(null);

  // 🔹 Sauvegarde locale
  useEffect(() => { localStorage.setItem("projectSearch", search); }, [search]);
  useEffect(() => { localStorage.setItem("projectPage", currentPage); }, [currentPage]);

  // 🔹 Nouvelle requête : récupération de toutes les données liées (Admin ou User)
  useEffect(() => {
    if (!user?._id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/data/${user._id}`);
        const data = await res.json();

        if (data.success) {
          setProjects(data.projects || []);
        } else {
          toast.error("Erreur récupération projets : " + (data.message || "Inconnue"));
        }
      } catch (err) {
        console.error("Erreur récupération données:", err);
        toast.error("Erreur de chargement des projets");
      }
    };

    fetchData();
  }, [user]);

  // 🔹 Filtrage projets
  const filteredProjects = search
    ? projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  // 🔹 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // 🔹 Statistiques résumé
  const totalMaisons = projects.reduce((acc, p) => acc + (p.homeIds?.length || 0), 0);
  const maisonsOccupees = projects.reduce(
    (acc, p) => acc + (p.homeIds?.filter(h => h.personId).length || 0),
    0
  );
  const maisonsLibres = totalMaisons - maisonsOccupees;
  const tauxOccupation = totalMaisons > 0 ? ((maisonsOccupees / totalMaisons) * 100).toFixed(1) : 0;

  // 🔹 Création nouveau projet
const handleNewProjectSubmit = async (e) => {
  e.preventDefault();

  // 🔹 Validation locale
  if (!newProjectName?.trim()) {
    toast.error("Veuillez saisir un nom de projet");
    return;
  }
  if (!user || !user._id) {
    toast.error("Vous devez être connecté");
    return;
  }

  try {
    console.log("Création projet : envoi des données au backend", {
      name: newProjectName,
      description: newProjectDescription,
      adminId: user._id,
    });

    const res = await fetch("http://localhost:4000/NewProject", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`
       },
      body: JSON.stringify({
        name: newProjectName.trim(),
        description: newProjectDescription?.trim(),
        adminId: user._id,
      }),
    });

    console.log("Réponse HTTP :", res.status, res.statusText);

    // 🔹 Lecture sécurisée du JSON
    const data = await res.json().catch(err => {
      console.error("Erreur parsing JSON :", err);
      throw new Error("Impossible de lire la réponse du serveur");
    });
    console.log("Données reçues :", data);

    // 🔹 Vérifier succès standardisé
    if (!data?.success) {
      const msg = data?.message || `Erreur serveur (${res.status})`;
      console.error("Erreur backend :", msg);
      throw new Error(msg);
    }

    if (!data?.project?._id) {
      console.error("Aucun projet créé : réponse invalide", data);
      throw new Error("Création du projet échouée : réponse invalide");
    }

    // 🔹 Succès : mise à jour locale
    toast.success(`Projet "${data.project.name}" créé avec succès !`);
    setProjects(prev => [...prev, data.project]);
    setModalOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    console.log("Projet ajouté localement :", data.project);

  } catch (err) {
    console.error("Erreur handleNewProjectSubmit :", err);
    toast.error(err.message || "Erreur lors de la création du projet");
  }
};

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <div className="saas-container">
        <div className="saas-card">
          {/* Header */}
          <div className="header-actions">
            <h2><i className="fa-solid fa-house"></i> Mes propriétés</h2>
            <button className="btn-add" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-plus"></i> Nouveau projet
            </button>
          </div>

          {/* 🔹 Résumé maisons */}
          <div className="resume-cards">
            <div className="resume-card total">
              <h4>Total maisons</h4>
              <span>{totalMaisons}</span>
            </div>
            <div className="resume-card occupees">
              <h4>Occupées</h4>
              <span>{maisonsOccupees}</span>
            </div>
            <div className="resume-card libres">
              <h4>Libres</h4>
              <span>{maisonsLibres}</span>
            </div>
            <div className="resume-card taux">
              <h4>Taux occupation</h4>
              <span>{tauxOccupation}%</span>
            </div>
          </div>

          {/* Barre recherche */}
          <div className="filter-section">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="select-field"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tous les projets</option>
              {projects.map((project) => (
                <option key={project._id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Liste projets */}
          <div className="project-grid">
            {currentProjects.length > 0 ? (
              currentProjects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-body">
                    <h3>{project.name}</h3>
                    {project.createdBy && (
                      <p className="project-info">Créé par : {project.createdBy}</p>
                    )}
                  </div>
                  <div className="project-footer">
                    <Link to={`/detail_projet/fr/${project._id}`}>
                      <button className="btn-details">
                        Voir détails <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "2rem" }}>
                Aucun projet trouvé
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >Précédent</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setCurrentPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >Suivant</button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* 🔹 Modal création projet */}
      {modalOpen && (
        <div className="modal-overlay-project">
          <div className="modal-project">
            <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </button>
            <h2>Nouveau projet</h2>
            <form onSubmit={handleNewProjectSubmit}>
              <div className="form-group">
                <label>Nom du projet</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nom du projet"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optionnelle)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Description du projet"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-add-home">Créer</button>
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CSS intégré --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .btn-add { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btn-add:hover { background: #1e40af; }
        .filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-input { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; flex: 1; min-width: 200px; }
        .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .project-card { border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s; }
        .project-card:hover { transform: translateY(-4px); }
        .project-body h3 { margin-bottom: .5rem; }
        .project-info { font-size: 14px; color: #6b7280; }
        .project-footer { margin-top: 1rem; }
        .btn-details { padding: .4rem .8rem; border-radius: 6px; border: none; background: #2563eb; color: #fff; cursor: pointer; font-size: 14px; }
        .btn-details:hover { background: #1e40af; }
        .pagination { margin-top: 2rem; display: flex; gap: .3rem; justify-content: center; }
        .pagination button { padding: .4rem .8rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; background: #fff; }
        .pagination button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .pagination button:disabled { opacity: .5; cursor: not-allowed; }
         .modal-overlay-project {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal-project {
    background: #fff;
    padding: 2rem;
    border-radius: 10px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    animation: modalFadeIn 0.3s ease;
    position: relative;
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    color: #333;
  }
  .modal-close-btn:hover { color: #2563eb; }
  .resume-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .resume-card {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
        .resume-card.total { border-left: 5px solid #2563eb; }
        .resume-card.occupees { border-left: 5px solid #22c55e; }
        .resume-card.libres { border-left: 5px solid #ef4444; }
        .resume-card.taux { border-left: 5px solid #06b6d4; }
        .resume-card span {
          display: block;
          font-size: 1.3rem;
          margin-top: .5rem;
        }
        
      `}</style>
    </>
  );
}