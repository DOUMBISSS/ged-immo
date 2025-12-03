import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavbarMagasin from "../Magasin/NavbarMagasin";
import Footer from "../Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserMagasin } from "../../contexts/UserMagasinContext";
import DuplicateHomeModal from "../Magasin/DuplicateHomeModal";

export default function DetailProjectMagasin() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { magasinUser } = useUserMagasin();

  const [project, setProject] = useState(null);
  const [homes, setHomes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [showModal, setShowModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedHome, setSelectedHome] = useState(null);

  // Form states
  const [reference, setReference] = useState("");
  const [nameHome, setNameHome] = useState("");
  const [categorie, setCategorie] = useState("");
  const [addressHome, setAddressHome] = useState("");
  const [city, setCity] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [guarantee, setGuarantee] = useState("");
  const [observations, setObservations] = useState("");
  const [state, setState] = useState("Disponible");
  const [NmbrePieces, setNmbrePieces] = useState("");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);
  const [works, setWorks] = useState("");
  const [charges, setCharges] = useState("");
const [surface, setSurface] = useState("");
const [equipment, setEquipment] = useState("");

const piecesOptions = {
  Appartement: ["1", "2", "3", "4", "5"],
  Maison: ["2", "3", "4", "5", "6", "7"],
  "Local Commercial": ["1", "2", "3", "4"],
  Terrain: ["1"], // ou vide selon ton besoin
};

  // Gestion upload images
  const handleMainImageChange = (e) => setImg(e.target.files[0]);
  const handleFileChange = (e) => setImages(e.target.files);

  // Récupération du projet et maisons
  useEffect(() => {
    fetch(`https://backend-ged-immo.onrender.com/projects/Magasin/project/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.project) {
          setProject(data.project);
          setHomes(data.project.properties || []);
        }
      })
      .catch(err => console.error("Erreur récupération projet:", err));
  }, [projectId]);

  // Stats
  const activeHomes = homes.filter(h => !h.archived);
  const occupiedHomes = activeHomes.filter(h => h.state === "Occupé" || h.personId).length;
  const availableHomes = activeHomes.length - occupiedHomes;
  const occupancyRate = activeHomes.length ? ((occupiedHomes / activeHomes.length) * 100).toFixed(1) : 0;

  const filteredHomes = activeHomes.filter(home => {
    const matchCategorie = !categorie || categorie === "Toutes" || home.categorie === categorie;
    const matchPieces = !NmbrePieces || String(home.NmbrePieces) === String(NmbrePieces);
    return matchCategorie && matchPieces;
  });

  const handleResetFilters = () => {
    setCategorie("");
    setNmbrePieces("");
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHomes = filteredHomes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHomes.length / itemsPerPage);

// Gestion du formulaire
const handleSubmitNew = async (e) => {
  e.preventDefault();

  if (!magasinUser?.token) {
    return toast.error("Utilisateur non connecté !");
  }

  // 🔎 Validation des champs essentiels
  if (!nameHome || !addressHome || !categorie || !city || !rent) {
    return toast.error("Veuillez remplir tous les champs obligatoires !");
  }

  try {
    const formData = new FormData();

    // Champs du modèle Property
    formData.append("title", nameHome);
    formData.append("address", addressHome);
    formData.append("city", city);
    formData.append("quarter", quarter || "");
    formData.append("description", description || "");
    formData.append("guarantee", guarantee || "");
    formData.append("observations", observations || "");
    formData.append("state", state || "Disponible");
    formData.append("NmbrePieces", NmbrePieces || "");
    formData.append("type", categorie);
    formData.append("rent", rent);
    formData.append("charges", charges || 0);
    formData.append("surface", surface || "");
    formData.append("equipment", equipment || "");
    formData.append("projectId", projectId || "");

    // Gestion des images
    if (img) formData.append("img", img); // image principale
    if (images.length > 0) {
      Array.from(images).forEach((file) => formData.append("images", file));
    }

    // 🔐 Ajout du userId si c'est un user
    if (magasinUser.role === "user") {
      formData.append("userId", magasinUser._id);
    }

    // 🔥 Envoi vers le backend
    const res = await fetch("https://backend-ged-immo.onrender.com/magasins/new", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${magasinUser.token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Magasin ajouté avec succès !");
      setHomes((prev) => [...prev, data.property]);

      // Réinitialisation complète du formulaire
      setNameHome("");
      setReference("");
      setCategorie("");
      setAddressHome("");
      setCity("");
      setQuarter("");
      setRent("");
      setCharges("");
      setSurface("");
      setEquipment("");
      setDescription("");
      setGuarantee("");
      setObservations("");
      setState("Disponible");
      setNmbrePieces("");
      setImg(null);
      setImages([]);
      setShowModal(false);
    } else {
      toast.error(data.message || "Erreur lors de l'ajout du magasin.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout :", err);
    toast.error("Erreur serveur lors de l'ajout.");
  }
};
  // Duplication maison
  const handleDuplicateHome = async (homeId) => {
    if (!magasinUser?._id) return toast.error("Utilisateur non connecté !");
    try {
      const res = await fetch(`http://localhost:4000/homes/${homeId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: magasinUser._id, projectId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Maison dupliquée !");
        setHomes(prev => [...prev, data.home]);
      } else toast.error(data.message || "Erreur duplication");
    } catch (err) {
      console.error(err);
      toast.error("Erreur duplication maison");
    }
  };

  return (
    <>
      <NavbarMagasin />
      <div className="container">
        <header className="project-header">
          <h1>{project ? `Projet: ${project.name}` : "Chargement..."}</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowModal(true)}>Ajouter maison</button>
            <button className="btn-secondary" onClick={() => navigate("/Mes__archives")}>Voir archives</button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card"><p>Total</p><h3>{activeHomes.length}</h3></div>
          <div className="stat-card"><p>Disponibles</p><h3>{availableHomes}</h3></div>
          <div className="stat-card"><p>Occupés</p><h3>{occupiedHomes}</h3></div>
          <div className="stat-card"><p>Taux d'occupation</p><h3>{occupancyRate}%</h3></div>
        </div>

        {/* Filtre */}
        <div className="filter-bar">
         <select value={categorie} onChange={e => setCategorie(e.target.value)} required>
            <option value="">Catégorie</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison">Maison</option>
            <option value="Local Commercial">Local Commercial</option>
            <option value="Terrain">Terrain</option>
          </select>
          <select value={NmbrePieces} onChange={e => setNmbrePieces(e.target.value)} disabled={!categorie}>
            <option value="">Nombre pièces</option>
            {categorie && piecesOptions[categorie].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn-reset" onClick={handleResetFilters}>Réinitialiser</button>
        </div>

        {/* Cartes maisons */}
        <div className="cards-grid">
          {currentHomes.length > 0 ? currentHomes.map(home => (
            <div key={home._id} className="card">
              <Link to={`/detailHome/${home._id}`}>
                <img src={home.img.startsWith("http") ? home.img : `https://backend-ged-immo.onrender.com/${home.img}`} alt={home.nameHome} />
              </Link>
              <div className="card-info">
                <h3>{home.nameHome}</h3>
                <p>{home.NmbrePieces} pièces | {home.categorie}</p>
                <p>{home.rent} F CFA</p>
                <span className={`badge ${home.state === "Disponible" ? "available" : "occupied"}`}>{home.state}</span>
                <button className="btn-duplicate" onClick={() => { setSelectedHome(home); setShowDuplicateModal(true); }}>Dupliquer</button>
              </div>
            </div>
          )) : <p className="no-data">Aucune maison trouvée</p>}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} className={currentPage === i+1 ? "active" : ""} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Suivant</button>
          </div>
        )}
      </div>
      <Footer />

      {/* Modale ajout maison */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
      <form onSubmit={handleSubmitNew} className="form-modal">
        <h2>Ajouter une maison</h2>

        <div className="form-group">
          <input type="text" placeholder="Nom" value={nameHome} onChange={e => setNameHome(e.target.value)} required />
          <input type="text" placeholder="Référence" value={reference} onChange={e => setReference(e.target.value)} required />
        </div>

        <div className="form-group">
          <select value={categorie} onChange={e => setCategorie(e.target.value)} required>
            <option value="">Catégorie</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison">Maison</option>
            <option value="Local Commercial">Local Commercial</option>
            <option value="Terrain">Terrain</option>
          </select>

          <select value={NmbrePieces} onChange={e => setNmbrePieces(e.target.value)} disabled={!categorie || !piecesOptions[categorie]}>
            <option value="">Nombre pièces</option>
            {categorie && piecesOptions[categorie]?.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-group">
          <input type="text" placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
          <input type="text" placeholder="Quartier" value={quarter} onChange={e => setQuarter(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Adresse" value={addressHome} onChange={e => setAddressHome(e.target.value)} />
          <input type="text" placeholder="Loyer" value={rent} onChange={e => setRent(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Caution" value={guarantee} onChange={e => setGuarantee(e.target.value)} />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Charges mensuelles" value={charges} onChange={e => setCharges(e.target.value)} />
          <input type="text" placeholder="Surface (m²)" value={surface} onChange={e => setSurface(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Équipements (séparés par des virgules)" value={equipment} onChange={e => setEquipment(e.target.value)} />
        </div>

        <div className="form-group">
          <textarea placeholder="Observations" value={observations} onChange={e => setObservations(e.target.value)} />
          <select value={state} onChange={e => setState(e.target.value)}>
            <option value="Disponible">Disponible</option>
            <option value="Occupé">Occupé</option>
          </select>
        </div>

        <div className="form-group">
          <input type="file" onChange={handleMainImageChange} />
          <input type="file" multiple onChange={handleFileChange} />
        </div>

        <button type="submit" className="btn-primary">Ajouter</button>
      </form>
    </div>
  </div>
)}

      {/* Modale duplication */}
      {showDuplicateModal && selectedHome && (
        <DuplicateHomeModal
          home={selectedHome}
          projectId={projectId}
          adminId={magasinUser._id}
          onClose={() => { setShowDuplicateModal(false); setSelectedHome(null); }}
          onDuplicated={newHome => setHomes(prev => [...prev, newHome])}
        />
      )}

      <style>{`
        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Header */
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header-actions button {
          margin-left: 10px;
        }

        /* Buttons */
        .btn-primary {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-primary:hover { background: #4338ca; }
        .btn-secondary {
          background: #e5e7eb;
          color: #111827;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-reset { background: #f97316; color:white; padding: 6px 12px; border-radius: 6px; border:none; cursor:pointer; }
        .btn-reset:hover { background: #c2410c; }
        .btn-duplicate { background: #10b981; color:white; padding: 4px 10px; border-radius:6px; border:none; cursor:pointer; margin-top:5px; }

        /* Stats */
        .stats-container {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
        }
        .stat-card {
          flex: 1;
          background: #f3f4f6;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 { font-size: 22px; margin-top: 5px; }

        /* Filtre */
        .filter-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .filter-bar select { padding: 8px 12px; border-radius: 6px; border:1px solid #d1d5db; }
        .filter-bar button { height: 36px; }

        /* Cartes */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(250px,1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-3px); }
        .card img { width: 100%; height: 180px; object-fit: cover; }
        .card-info { padding: 15px; }
        .card-info h3 { font-size: 18px; margin-bottom: 5px; }
        .card-info p { font-size: 14px; margin-bottom: 5px; color:#374151; }
        .badge { display:inline-block; padding:2px 8px; border-radius:6px; font-size:12px; margin-top:5px; }
        .available { background-color: #10b981; color:white; }
        .occupied { background-color: #ef4444; color:white; }

        .no-data { text-align:center; padding:50px; color:#6b7280; }

        /* Pagination */
        .pagination { display:flex; gap:8px; justify-content:center; margin-bottom:30px; }
        .pagination button { padding:6px 12px; border:none; border-radius:6px; cursor:pointer; background:#e5e7eb; }
        .pagination button.active { background:#4f46e5; color:white; }

        /* Modal */
        .modal-overlay {
          position: fixed; top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.5);
          display:flex; justify-content:center; align-items:center;
          z-index:100000;
        }
        .modal-content {
          background:white; padding:30px; border-radius:10px; width:90%; max-width:700px; max-height:90%; overflow-y:auto; position:relative;
        }
        .modal-close { position:absolute; top:15px; right:20px; font-size:24px; background:none; border:none; cursor:pointer; }

        /* Formulaire modal */
        .form-modal .form-group {
          display:flex; flex-wrap:wrap; gap:15px; margin-bottom:15px;
        }
        .form-modal input, .form-modal select, .form-modal textarea {
          flex:1; padding:10px; border-radius:6px; border:1px solid #d1d5db; min-width:120px;
        }
        .form-modal button { margin-top:10px; }
        
      `}</style>
    </>
  );
}