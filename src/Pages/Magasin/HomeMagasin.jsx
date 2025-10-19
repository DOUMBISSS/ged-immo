import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import NavbarMagasin from "../../Pages/Magasin/NavbarMagasin";
import Footer from '../../Pages/Footer';
import toast, { Toaster } from "react-hot-toast";
import { useUserMagasin } from "../../contexts/UserMagasinContext";

export default function HomeMagasin() {
  const { magasinUser, logoutMagasinUser } = useUserMagasin();
  const [magasins, setMagasins] = useState([]);

  const [search, setSearch] = useState(() => localStorage.getItem("magasinSearch") || "");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("magasinPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newMagasinName, setNewMagasinName] = useState("");
  const [newMagasinDescription, setNewMagasinDescription] = useState("");
  const itemsPerPage = 12;

  const modalRef = useRef(null);

  // 🔹 Sauvegarde locale
  useEffect(() => { localStorage.setItem("magasinSearch", search); }, [search]);
  useEffect(() => { localStorage.setItem("magasinPage", currentPage); }, [currentPage]);

  // 🔹 Récupération magasins depuis backend
useEffect(() => {
  if (!magasinUser?._id) return;

  const fetchMagasins = async () => {
    try {
      const res = await fetch(`http://localhost:4000/projects/Magasin/owner/${magasinUser._id}`);
      
      // Vérifier le statut HTTP
      if (!res.ok) {
        if (res.status === 400) throw new Error("ID propriétaire invalide.");
        if (res.status === 404) throw new Error("Aucun magasin trouvé pour ce propriétaire.");
        throw new Error(`Erreur serveur (${res.status})`);
      }

      // Essayer de parser le JSON
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Réponse serveur invalide (non JSON).");
      }

      // Vérifier la structure de la réponse
      if (!data.success || !Array.isArray(data.projects)) {
        throw new Error(data.message || "Structure de données inattendue.");
      }

      setMagasins(data.projects);
    } catch (err) {
      console.error("Erreur récupération magasins:", err);
      toast.error(err.message || "Erreur de chargement des magasins");
      setMagasins([]); // reset en cas d'erreur
    }
  };

  fetchMagasins();
}, [magasinUser]);

  // 🔹 Filtrage magasins
  const filteredMagasins = search
    ? magasins.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : magasins;

  // 🔹 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMagasins = filteredMagasins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMagasins.length / itemsPerPage);

  // 🔹 Statistiques résumé
  const totalProduits = magasins.reduce((acc, m) => acc + (m.products?.length || 0), 0);
  const produitsEnStock = magasins.reduce(
    (acc, m) => acc + (m.products?.filter(p => p.stock > 0).length || 0),
    0
  );
  const produitsRupture = totalProduits - produitsEnStock;
  const tauxDisponibilite = totalProduits > 0 ? ((produitsEnStock / totalProduits) * 100).toFixed(1) : 0;

  // 🔹 Création nouveau magasin
const handleNewMagasinSubmit = async (e) => {
  e.preventDefault();

  if (!newMagasinName?.trim()) {
    toast.error("Veuillez saisir un nom de magasin");
    return;
  }

  if (!magasinUser?._id) {
    toast.error("Vous devez être connecté pour créer un magasin");
    return;
  }

  const token = localStorage.getItem("magasinToken");
  if (!token) {
    toast.error("Token manquant. Veuillez vous reconnecter.");
    logoutMagasinUser();
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/NewProject/Magasin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newMagasinName.trim(),
        description: newMagasinDescription?.trim() || "",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Erreur lors de la création du magasin");
    }

    toast.success(`Magasin "${data.project.name}" créé avec succès ✅`);
    setMagasins((prev) => [...prev, data.project]);
    setModalOpen(false);
    setNewMagasinName("");
    setNewMagasinDescription("");
  } catch (err) {
    console.error("Erreur handleNewMagasinSubmit :", err);
    toast.error(err.message || "Erreur serveur");
  }
};
  return (
    <>
      <Toaster position="top-right" />
      <NavbarMagasin />

      <div className="saas-container">
        <div className="saas-card">
          {/* Header */}
          <div className="header-actions">
            <h2><i className="fa-solid fa-store"></i> Mes magasins</h2>
            <button className="btn-add" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-plus"></i> Nouveau projet
            </button>
          </div>

          {/* 🔹 Résumé */}
          <div className="resume-cards">
            <div className="resume-card total">
              <h4>Total produits</h4>
              <span>{totalProduits}</span>
            </div>
            <div className="resume-card occupees">
              <h4>En stock</h4>
              <span>{produitsEnStock}</span>
            </div>
            <div className="resume-card libres">
              <h4>Rupture</h4>
              <span>{produitsRupture}</span>
            </div>
            <div className="resume-card taux">
              <h4>Taux disponibilité</h4>
              <span>{tauxDisponibilite}%</span>
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
              <option value="">Tous les magasins</option>
              {magasins.map((m) => (
                <option key={m._id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Liste magasins */}
       <div className="project-grid">
  {currentMagasins.length > 0 ? (
    currentMagasins.map(m => (
      <div key={m._id} className="project-card">
        {/* 🔹 Nom du projet */}
        <h3 className="project-name">{m.name}</h3>

        {m.createdBy && (
          <p className="project-info">
            Créé par : <strong>{m.createdBy.name}</strong> ({m.createdBy.role})
            <br />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Créé le {new Date(m.dateCreated).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </p>
        )}
        <div className="project-footer">
          <Link to={`/detailProject/fr/${m._id}`}>
            <button className="btn-details">
              Voir détails <i className="fa-solid fa-arrow-right"></i>
            </button>
          </Link>
        </div>
      </div>
    ))
  ) : (
    <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "2rem" }}>
      Aucun magasin trouvé
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

      {/* Modal création magasin */}
      {modalOpen && (
        <div className="modal-overlay-project">
          <div className="modal-project">
            <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </button>
            <h2>Nouveau Projet</h2>
            <form onSubmit={handleNewMagasinSubmit}>
              <div className="form-group">
                <label>Nom du Projet</label>
                <input
                  type="text"
                  value={newMagasinName}
                  onChange={(e) => setNewMagasinName(e.target.value)}
                  placeholder="Nom du magasin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optionnelle)</label>
                <textarea
                  value={newMagasinDescription}
                  onChange={(e) => setNewMagasinDescription(e.target.value)}
                  placeholder="Description du magasin"
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
        .modal-overlay-project { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-project { background: #fff; padding: 2rem; border-radius: 10px; width: 400px; max-width: 90%; box-shadow: 0 2px 10px rgba(0,0,0,0.3); animation: modalFadeIn 0.3s ease; position: relative; }
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close-btn { position: absolute; top: 10px; right: 15px; background: transparent; border: none; font-size: 1.5rem; font-weight: bold; cursor: pointer; color: #333; }
        .modal-close-btn:hover { color: #2563eb; }
        .resume-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .resume-card { background: #f1f5f9; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600; }
        .resume-card.total { border-left: 5px solid #2563eb; }
        .resume-card.occupees { border-left: 5px solid #22c55e; }
        .resume-card.libres { border-left: 5px solid #ef4444; }
        .resume-card.taux { border-left: 5px solid #06b6d4; }
        .resume-card span { display:block; font-size: 1.3rem; margin-top:.5rem; }
      `}</style>
    </>
  );
}