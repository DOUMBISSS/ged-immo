import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../contexts/UserContext";
import DuplicateHomeModal from "./Maison/DuplicateHomeModal";

export default function DetailProject() {
  const { id: projectId } = useParams(); // ID du projet depuis l'URL
  const navigate = useNavigate();
  const { user } = useUserContext(); // ✅ récupération de l’admin connecté

  const [project, setProject] = useState(null);
  const [homes, setHomes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // --- Ajouter des états pour les filtres ---
const [filterCategorie, setFilterCategorie] = useState("");
const [filterPieces, setFilterPieces] = useState("");
  const itemsPerPage = 20;

  const [showModal, setShowModal] = useState(false);

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
  const [NmbrePieces, SetNmbrePieces] = useState("");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);
  const [works, setWorks] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedHome, setSelectedHome] = useState(null);

  const piecesOptions = {
    Appartement: ["2","3","4", "5", "6","7", "8", "9","10"],
    Maison: ["3","4", "5", "6","7", "8", "9","10"],
    Studio: ["1"],
    Villa: ["3","4", "5", "6","7", "8", "9","10"],
  };

  const handleMainImageChange = (e) => setImg(e.target.files[0]);
  const handleFileChange = (e) => setImages(e.target.files);

  
// console.log(user.isAdmin, user.userId, user.adminId);
 // -------------------- AJOUT D’UNE MAISON --------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user?.token) return toast.error("Utilisateur non connecté !");

  if (!reference || !nameHome || !categorie || !addressHome || !city || !rent) {
    return toast.error("Veuillez remplir tous les champs obligatoires !");
  }

  try {
    const formData = new FormData();
    formData.append("reference", reference);
    formData.append("nameHome", nameHome);
    formData.append("categorie", categorie);
    formData.append("addressHome", addressHome);
    formData.append("city", city);
    formData.append("quarter", quarter || "");
    formData.append("rent", rent);
    formData.append("description", description || "");
    formData.append("guarantee", guarantee || "");
    formData.append("observations", observations || "");
    formData.append("state", state || "Disponible");
    formData.append("NmbrePieces", NmbrePieces || "");
    if (works?.trim()) formData.append("works", works);
    if (img) formData.append("img", img);
    if (images.length > 0) Array.from(images).forEach(file => formData.append("images", file));

    const response = await fetch(`http://localhost:4000/newHome/${projectId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${user?.token}` },
      body: formData
    });

    // 🔹 Vérifier le statut de la réponse
    if (response.status === 403) {
      const errorData = await response.json();
      return toast.error(errorData.message || "Vous n'avez pas la permission !");
    }

    const data = await response.json();

    if (data.success) {
      toast.success("Maison ajoutée avec succès !");
      setHomes(prev => [...prev, data.home]);

      // Réinitialiser le formulaire
      setReference("");
      setNameHome("");
      setCategorie("");
      setAddressHome("");
      setCity("");
      setQuarter("");
      setRent("");
      setDescription("");
      setGuarantee("");
      setObservations("");
      setState("Disponible");
      SetNmbrePieces("");
      setWorks("");
      setImg(null);
      setImages([]);
      setShowModal(false);
    } else {
      toast.error(data.message || "Erreur lors de l'ajout de la maison");
    }
  } catch (err) {
    console.error("Erreur ajout maison:", err);
    toast.error("Erreur serveur lors de l'ajout de la maison");
  }
};
useEffect(() => {
  if (!user?.token) return;

  fetch(`http://localhost:4000/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error("Non autorisé");
      return res.json();
    })
    .then((data) => {
      if (data.project) {
        setProject(data.project);
        setHomes(data.homes || []);
      }
    })
    .catch((err) => console.error("Erreur récupération projet:", err));
}, [projectId, user?.token]);
  

  // Filtrer les maisons actives
  const activeHomes = homes.filter((home) => !home.archived);
  const occupiedHomes = activeHomes.filter((home) => home.state === "Occupé" || home.personId).length;
  const availableHomes = activeHomes.length - occupiedHomes;
  const occupancyRate = activeHomes.length
    ? ((occupiedHomes / activeHomes.length) * 100).toFixed(1)
    : 0;
  const totalHomes = activeHomes.length;

// --- Modifier le filtrage des maisons ---
const filteredHomes = activeHomes.filter((home) => {
  const matchCategorie =
    !filterCategorie || filterCategorie === "Toutes" || home.categorie === filterCategorie;
  const matchPieces =
    !filterPieces || String(home.NmbrePieces) === String(filterPieces);
  return matchCategorie && matchPieces;
});

// --- Bouton reset filtres ---
const handleResetFilters = () => {
  setFilterCategorie("");
  setFilterPieces("");
  setCurrentPage(1);
};


// const currentHomes = filteredHomes.slice(indexOfFirstItem, indexOfLastItem);
// const totalPages = Math.ceil(filteredHomes.length / itemsPerPage);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHomes = filteredHomes.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredHomes.length / itemsPerPage);;

  // const handleDuplicateHome = async (homeId) => {
  //   if (!user?._id) return toast.error("Utilisateur non connecté !");

  //   try {
  //     const response = await fetch(`http://localhost:4000/homes/${homeId}/duplicate`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ adminId: user._id, projectId }),
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       toast.success("Maison dupliquée avec succès !");
  //       setHomes((prev) => [...prev, data.home]);
  //     } else {
  //       toast.error(data.message || "Erreur lors de la duplication");
  //     }
  //   } catch (err) {
  //     console.error("Erreur duplication maison :", err);
  //     toast.error("Erreur lors de la duplication de la maison");
  //   }
  // };

  return (
    <>
      <div className="renthome-page">
        <Navbar />
        <div className="containers">
          <div className="dashboard">
            <div className="right">
              <div className="renthome-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>
                  <i className="fa-solid fa-house"></i>{" "}
                  {project ? `Maisons du projet : ${project.name}` : "Chargement..."}
                </h1>

                <div style={{ display: "flex", gap: "10px" }}>
                  {project && (
                    <button className="btn-add-home" style={{ height: "40px" }} onClick={() => setShowModal(true)}>
                      <i className="fa-solid fa-plus"></i> Ajouter une maison
                    </button>
                  )}
                  <button className="btn-archives" style={{ height: "40px" }} onClick={() => navigate("/Mes__archives")}>
                    <i className="fa-solid fa-archive"></i> Voir archives
                  </button>
                </div>
              </div>

              <div className="stats-gauges">
                 <div className="gauge-card">
                  <h4>Total des maisons</h4>
                  <div className="gauge-bar">
                    <div
                      className="gauge-fill"
                      style={{ width: "100%", backgroundColor: "#6f42c1" }}
                    ></div>
                  </div>
                  <span>{totalHomes}</span>
                </div>

                <div className="gauge-card">
                  <h4>Biens disponibles</h4>
                  <div className="gauge-bar">
                    <div className="gauge-fill" style={{ width: `${(availableHomes / activeHomes.length) * 100 || 0}%`, backgroundColor: '#28a745' }}></div>
                  </div>
                  <span>{availableHomes}</span>
                </div>

                <div className="gauge-card">
                  <h4>Biens occupés</h4>
                  <div className="gauge-bar">
                    <div className="gauge-fill" style={{ width: `${(occupiedHomes / activeHomes.length) * 100 || 0}%`, backgroundColor: '#dc3545' }}></div>
                  </div>
                  <span>{occupiedHomes}</span>
                </div>

                <div className="gauge-card">
                  <h4>Taux d'occupation</h4>
                  <div className="gauge-bar">
                    <div className="gauge-fill" style={{ width: `${occupancyRate}%`, backgroundColor: '#0d6efd' }}></div>
                  </div>
                  <span>{occupancyRate}%</span>
                </div>
              </div>
              
              {/* --- FILTRAGE DES MAISONS --- */}
<div className="filter-section">
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h3 style={{ marginBottom: "10px", color: "#4b00cc" }}>
      <i className="fa-solid fa-filter"></i> Filtrer les maisons
    </h3>
    {(categorie || NmbrePieces) && (
      <button className="btn-reset-filter" onClick={handleResetFilters}>
        <i className="fa-solid fa-rotate-right"></i> Réinitialiser
      </button>
    )}
  </div>

  <div className="filter-row">
    <div className="filter-col">
      <label>Catégorie</label>
<select
  className="form-input"
  value={filterCategorie}
  onChange={(e) => {
    setFilterCategorie(e.target.value);
    setCurrentPage(1);
  }}
>
  <option value="">Toutes les catégories</option>
  <option value="Appartement">Appartement</option>
  <option value="Maison">Maison</option>
  <option value="Studio">Studio</option>
  <option value="Villa">Villa</option>
</select>
    </div>

    <div className="filter-col">
      <label>Nombre de pièces</label>
     <select
  className="form-input"
  value={filterPieces}
  onChange={(e) => {
    setFilterPieces(e.target.value);
    setCurrentPage(1);
  }}
  disabled={!filterCategorie}
>
  <option value="">Tous</option>
  {filterCategorie &&
    piecesOptions[filterCategorie]?.map((p) => (
      <option key={p} value={p}>
        {p}
      </option>
    ))}
</select>
    </div>

  </div>
</div>
<div className="renthome-cards-container">
  {currentHomes.length > 0 ? (
    currentHomes.map((home) => (
      <div key={home._id} className="renthome-card">
        <div className="renthome-card-images">
          {/* 🔹 Vérifie si la maison a une image principale ou secondaire */}
          {home.img || (home.images && home.images.length > 0) ? (
            <>
              {/* Image principale */}
              {home.img && (
                <Link to={`/detailHome/${home._id}`}>
                  <img
                    src={
                      home.img.startsWith("http")
                        ? home.img
                        : `http://localhost:4000/${home.img}`
                    }
                    alt={home.nameHome}
                    className="home-image"
                  />
                </Link>
              )}

              {/* Images secondaires */}
              {home.images?.map((url, index) => (
                <Link key={index} to={`/detailHome/${home._id}`}>
                  <img
                    src={
                      url.startsWith("http")
                        ? url
                        : `http://localhost:4000/${url}`
                    }
                    alt={`Home ${index}`}
                    className="home-image"
                  />
                </Link>
              ))}
            </>
          ) : (
            // 🔹 Si aucune image, afficher ton logo par défaut
            <Link to={`/detailHome/${home._id}`}>
              <img src="/logo4 copie.jpg" alt="Aucune image disponible" className="home-image default-image"/>
            </Link>
          )}
        </div>

        <div className="renthome-card-content">
          <h3>
            {home.nameHome}{" "}
            {home.archived && <span className="badge archived">Archivé</span>}
            {!home.archived && home.state === "Disponible" && (
              <span className="badge available">Disponible</span>
            )}
            {!home.archived && home.state === "Occupée" && (
              <span className="badge occupied">Occupée</span>
            )}
          </h3>

          <p className="info">
            {home.NmbrePieces} pièces | {home.categorie}
          </p>
          <p className="rent">
            {home.rent
              ? `${parseInt(home.rent).toLocaleString()} F CFA`
              : "Prix non défini"}
          </p>
          <p className="description">{home.description}</p>
          <p className="addresse">{home.addressHome}</p>
          <p className="guarantee">Caution: {home.guarantee}</p>

          <button className="btn-duplicate"
            onClick={() => {
              setSelectedHome(home);
              setShowDuplicateModal(true);
            }}><i className="fa fa-copy"></i> Dupliquer
          </button>
        </div>
      </div>
    ))
  ) : (
    <p>Aucune maison trouvée pour ce projet.</p>
  )}
</div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <form onSubmit={handleSubmit} className="form">
              <h1 className="page-title"><i className="fa-solid fa-house"></i> Ajouter une propriété</h1>

              {/* Informations générales */}
              <section className="form-section">
                <h3 className="form-section__title">Informations générales</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Nom du logement</label>
                    <input type="text" className="form-input" value={nameHome} onChange={(e) => setNameHome(e.target.value)} required />
                  </div>
                  <div className="form-col">
                    <label>Référence (N° Porte)</label>
                    <input type="text" className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Catégorie</label>
                    <select className="form-input" value={categorie} onChange={(e) => { setCategorie(e.target.value); SetNmbrePieces(""); }} required>
                      <option value="">Sélectionner</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Studio">Studio</option>
                      <option value="Villa">Villa</option>
                    </select>
                  </div>
                  <div className="form-col">
                    <label>Nombre de pièces</label>
                    <select className="form-input" value={NmbrePieces} onChange={(e) => SetNmbrePieces(e.target.value)} required disabled={!categorie}>
                      <option value="">Sélectionner</option>
                      {categorie && piecesOptions[categorie].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <label>Description</label>
                <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} />
              </section>

              {/* Localisation */}
              <section className="form-section">
                <h3 className="form-section__title">Localisation</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Ville</label>
                    <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Quartier</label>
                    <input type="text" className="form-input" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Adresse</label>
                    <input type="text" className="form-input" value={addressHome} onChange={(e) => setAddressHome(e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Financier */}
              <section className="form-section">
                <h3 className="form-section__title">Financier</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Loyer mensuel (FCFA)</label>
                    <input type="text" className="form-input" value={rent} onChange={(e) => setRent(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Caution</label>
                    <input type="text" className="form-input" value={guarantee} onChange={(e) => setGuarantee(e.target.value)} />
                  </div>
                </div>
              </section>
              <section>
                <label>Observations</label>
                <textarea className="form-input" value={observations} onChange={(e) => setObservations(e.target.value)} />
              </section>

              <section>
                <div className="form-col">
                  <label>Disponibilité</label>
                  <select className="form-input" value={state} onChange={(e) => setState(e.target.value)} required>
                    <option value="">Sélectionner</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Occupé">Occupé</option>
                  </select>
                </div>
              </section>

              {/* Images */}
              <section className="form-section">
                <h3 className="form-section__title">Images</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Image principale</label>
                    <input type="file" onChange={handleMainImageChange} />
                  </div>
                  <div className="form-col">
                    <label>Images secondaires</label>
                    <input type="file" multiple onChange={handleFileChange} />
                  </div>
                </div>
              </section>

              <button type="submit" className="btn-add-home">Ajouter la maison</button>
            </form>
          </div>
        </div>
      )}

      {showDuplicateModal && selectedHome && (
        <DuplicateHomeModal
          home={selectedHome}
          projectId={projectId}
          adminId={user._id}
          onClose={() => {
            setShowDuplicateModal(false);
            setSelectedHome(null);
          }}
          onDuplicated={(newHome) => setHomes((prev) => [...prev, newHome])}
        />
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 10px;
          max-width: 800px;
          width: 90%;
          max-height: 90%;
          overflow-y: auto;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .stats-gauges {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .gauge-card {
          flex: 1;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }
        .gauge-bar {
          width: 100%;
          height: 15px;
          background: #e9ecef;
          border-radius: 8px;
          margin: 8px 0;
          overflow: hidden;
        }
        .gauge-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.5s ease-in-out;
        }
        .badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 12px;
          margin-left: 8px;
          color: white;
        }
        .badge.available { background-color: #28a745; }
        .badge.occupied { background-color: #dc3545; }
        .badge.archived { background-color: #6c757d; }

        .filter-section {
  background: #f8f9fa;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.filter-col {
  flex: 1;
  min-width: 200px;
}
.filter-col label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
}
  .btn-reset-filter {
  background-color: #6f42c1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
}
.btn-reset-filter:hover {
  background-color: #4b00cc;
}
  .home-image.default-image {
  object-fit: contain;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
}
      `}</style>
    </>
  );
}