import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:4000";
// const API = "https://backend-ged-immo.onrender.com"

export default function DetailMagasin() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [project, setProject] = useState(null);
  const [magasins, setMagasins] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Formulaire
  const [reference, setReference] = useState("");
  const [nameHome, setNameHome] = useState("");
  const [addressHome, setAddressHome] = useState("");
  const [city, setCity] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [guarantee, setGuarantee] = useState("");
  const [surfaceMagasin, setSurfaceMagasin] = useState("");
  const [accesRoutier, setAccesRoutier] = useState("");
  const [vitrine, setVitrine] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(false);
  const [zoneCommerciale, setZoneCommerciale] = useState(false);
    const [mezanine, setMezanine] = useState(false);
      const [NmbrePieces, SetNmbrePieces] = useState("");
  const [state, setState] = useState("Disponible");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
const [archiveModalOpen, setArchiveModalOpen] = useState(false);
const [newProjectName, setNewProjectName] = useState("");
const [nombreCles, setNombreCles] = useState(1);
const [salleBain, setSalleBain] = useState(1);
const [parking, setParking] = useState(false);
const [ascenseur, setAscenseur] = useState(false);
const [serviceSecurite, setServiceSecurite] = useState(false);
 const [charges, setCharges] = useState("");

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setMagasins(data.homes || []);
        }
      })
      .catch((err) => console.error("Erreur chargement projet:", err));
  }, [projectId, user?.token]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!reference || !nameHome || !addressHome || !city || !rent) {
    toast.error("Veuillez remplir tous les champs obligatoires !");
    return;
  }

  try {
    const formData = new FormData();

    // 🔹 Champs généraux
    formData.append("reference", reference);
    formData.append("nameHome", nameHome);
    formData.append("categorie", "magasin");
    formData.append("addressHome", addressHome);
    formData.append("city", city);
    formData.append("quarter", quarter);
    formData.append("rent", rent);
    formData.append("guarantee", guarantee || "");
    formData.append("surfaceMagasin", surfaceMagasin || "");
    formData.append("description", description || "");
    formData.append("state", state);
    formData.append("NmbrePieces", NmbrePieces || "");
    formData.append("nombreCles", nombreCles || 1);
    formData.append("salleBain", salleBain || 1);
    formData.append("charges", charges); 

    // 🔹 Checkbox → toujours envoyer en string "true" ou "false"
    // formData.append("vitrine", vitrine.toString());
    // formData.append("stockDisponible", stockDisponible.toString());
    // formData.append("zoneCommerciale", zoneCommerciale.toString());
    formData.append("mezanine", mezanine.toString());
    formData.append("parking", parking.toString());
    formData.append("ascenseur", ascenseur.toString());
    formData.append("serviceSecurite", serviceSecurite.toString());

    // 🔹 Autres champs spécifiques
    formData.append("accesRoutier", accesRoutier || "");

    // 🔹 Images
    if (img) formData.append("img", img);
    if (images.length > 0) Array.from(images).forEach(f => formData.append("images", f));

    // 🔹 Envoi au backend
    const res = await fetch(`${API}/newHome/${projectId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      toast.success("🏬 Magasin ajouté avec succès !");
      setMagasins(prev => [...prev, data.home]);
      setShowModal(false);
    } else {
      toast.error(data.message || "Erreur lors de l’ajout du magasin");
    }

  } catch (err) {
    console.error("Erreur ajout magasin:", err);
    toast.error("Erreur serveur.");
  }
};

  return (
    <>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            <div
              className="renthome-header"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <h1>
                <i className="fa-solid fa-store"></i>{" "}
                {project ? `Magasins du projet : ${project.name}` : "Chargement..."}
              </h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-add-home" onClick={() => setShowModal(true)}>
                  <i className="fa-solid fa-plus"></i> Ajouter un magasin
                </button>
                 <button
  className="btn-arc-maj"
  onClick={() => {
    setNewProjectName(project?.name || "");
    setUpdateModalOpen(true);
  }}
>
  <i className="fa-solid fa-pen"></i> Mise à jour
</button>

<button
  className="btn-arc-maj"
  onClick={() => setArchiveModalOpen(true)}
>
  <i className="fa-solid fa-archive"></i> Archiver
</button>
              </div>
            </div>

            {/* === Section Statistiques Magasin === */}
<div className="stats-section">
  <h3>📊 Statistiques des magasins</h3>
  <div className="stats-grid">
    <div className="stat-card total">
      <h4>Total</h4>
      <p>{magasins.length}</p>
    </div>
    <div className="stat-card occupe">
      <h4>Occupés</h4>
      <p>{magasins.filter((m) => m.state?.toLowerCase() === "occupé" || m.state?.toLowerCase() === "loué").length}</p>
    </div>
    <div className="stat-card disponible">
      <h4>Disponibles</h4>
      <p>{magasins.filter((m) => m.state?.toLowerCase() === "disponible").length}</p>
    </div>
    <div className="stat-card taux">
      <h4>Taux d’occupation</h4>
      <p>
        {magasins.length > 0
          ? `${Math.round(
              (magasins.filter((m) => m.state?.toLowerCase() === "occupé" || m.state?.toLowerCase() === "loué").length /
                magasins.length) *
                100
            )}%`
          : "0%"}
      </p>
    </div>
  </div>
</div>

           <div className="magasin-table-section mt-4">
  <h3>🏪 Liste des magasins</h3>

  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Nom du magasin</th>
          <th>Référence</th>
          <th>Ville</th>
          <th>Surface</th>
          <th>Zone commerciale</th>
          {/* <th>Vitrine</th> */}
          <th>Loyer mensuel</th>
          <th>Détails</th>
        </tr>
      </thead>
      <tbody>
        {magasins.length > 0 ? (
          magasins.map((m) => (
            <tr key={m._id}>
              <td>
                <img
                  src={m.img ? `${API}/${m.img}` : "/logo4 copie.jpg"}
                  alt={m.nameHome}
                  className="table-img"
                />
              </td>
              <td>{m.nameHome}</td>
              <td>{m.reference}</td>
              <td>{m.city || "N/A"}</td>
              <td>{m.surfaceMagasin ? `${m.surfaceMagasin} m²` : "N/A"}</td>
              <td>{m.zoneCommerciale ? "Oui" : "Non"}</td>
              {/* <td>{m.vitrine ? "Oui" : "Non"}</td> */}
              <td>
                {m.rent
                  ? `${parseInt(m.rent).toLocaleString()} F CFA`
                  : "Non défini"}
              </td>
              <td>
                <Link to={`/detailHome/${m._id}`}>
                  <button className="btn-details">
                    <i className="fa-solid fa-eye"></i> Voir
                  </button>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center">
              Aucun magasin trouvé pour ce projet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
          </div>
        </div>
      </div>
      <Footer />

      {/* MODAL */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close" onClick={() => setShowModal(false)}>
        &times;
      </button>

      <form onSubmit={handleSubmit} className="form">
        <h1 className="page-title"><i className="fa-solid fa-store"></i> Ajouter un magasin</h1>

        {/* Champs généraux */}
        <div className="form-row">
          <label>Nom du magasin*</label>
          <input type="text" value={nameHome} onChange={e => setNameHome(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>Référence*</label>
          <input type="text" value={reference} onChange={e => setReference(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>Surface (m²)</label>
          <input type="number" value={surfaceMagasin} onChange={e => setSurfaceMagasin(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Ville*</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>Quartier</label>
          <input type="text" value={quarter} onChange={e => setQuarter(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Adresse</label>
          <input type="text" value={addressHome} onChange={e => setAddressHome(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Loyer (FCFA)*</label>
          <input type="text" value={rent} onChange={e => setRent(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>Caution (FCFA)</label>
          <input type="text" value={guarantee} onChange={e => setGuarantee(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Nombre de pièces</label>
          <input type="number" value={NmbrePieces} onChange={e => SetNmbrePieces(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Nombre de clés</label>
          <input type="number" value={nombreCles} onChange={e => setNombreCles(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Nombre de salles de bain</label>
          <input type="number" value={salleBain} onChange={e => setSalleBain(e.target.value)} />
        </div>

        {/* ✅ Checkbox équipements et caractéristiques */}
        <section className="form-section">
          <h3 className="form-section__title">Équipements et caractéristiques</h3>
          <div className="checkbox-card">
            <label>
              <input type="checkbox" checked={vitrine} onChange={e => setVitrine(e.target.checked)} />
              Vitrine
            </label>
            {/* <label>
              <input type="checkbox" checked={stockDisponible} onChange={e => setStockDisponible(e.target.checked)} />
              Stock disponible
            </label>
            <label>
              <input type="checkbox" checked={zoneCommerciale} onChange={e => setZoneCommerciale(e.target.checked)} />
              Zone commerciale
            </label> */}
            <label>
              <input type="checkbox" checked={mezanine} onChange={e => setMezanine(e.target.checked)} />
              Mezanine
            </label>
            <label>
              <input type="checkbox" checked={parking} onChange={e => setParking(e.target.checked)} />
              Parking
            </label>
            <label>
              <input type="checkbox" checked={ascenseur} onChange={e => setAscenseur(e.target.checked)} />
              Ascenseur
            </label>
            <label>
              <input type="checkbox" checked={serviceSecurite} onChange={e => setServiceSecurite(e.target.checked)} />
              Service de sécurité
            </label>
          </div>
        </section>
         <div className="form-row">
          <label>Charges</label>
          <textarea value={charges} onChange={e => setCharges(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Photo principale</label>
          <input type="file" onChange={e => setImg(e.target.files[0])} />
        </div>

        <div className="form-row">
          <label>Photos secondaires</label>
          <input type="file" multiple onChange={e => setImages(e.target.files)} />
        </div>

        <button type="submit" className="btn-add-home">Ajouter le magasin</button>
      </form>
    </div>
  </div>
)}

          {updateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setUpdateModalOpen(false)}>
              &times;
            </button>
            <h2>Modifier le nom du projet</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
             <button
  className="btn-confirm"
  onClick={async () => {
    try {
      const res = await fetch(`${API}/projects/${project._id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          originalProjectId: project._id, // 🔹 Obligatoire pour le backend
          name: project.name,            // optionnel selon ton backend
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Projet archivé !");
        setArchiveModalOpen(false);
        navigate("/Mes__archives");
      } else {
        toast.error(data.message || "Erreur lors de l'archivage");
      }
    } catch (err) {
      console.error("Erreur archivage projet :", err);
      toast.error("Erreur serveur");
    }
  }}
>
  Confirmer
</button>
              <button className="btn-cancel" onClick={() => setUpdateModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {archiveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setArchiveModalOpen(false)}>
              &times;
            </button>
            <h2>Confirmer l'archivage</h2>
            <p>Voulez-vous vraiment archiver ce projet ?</p>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                className="btn-confirm"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API}/projects/${project._id}/archive`, {
                      method: "PATCH",
                      headers: {
                        Authorization: `Bearer ${user.token}`,
                      },
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success("Projet archivé !");
                      setArchiveModalOpen(false);
                      navigate("/Mes__archives");
                    } else {
                      toast.error(data.message || "Erreur lors de l'archivage");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur serveur");
                  }
                }}
              >
                Confirmer
              </button>
              <button className="btn-cancel" onClick={() => setArchiveModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

        <style>{`
          .btn-arc-maj {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white; padding: 20px; border-radius: 10px;
          max-width: 700px; width: 90%; max-height: 90%; overflow-y: auto;
        }
        .form-row { margin-bottom: 10px; display: flex; flex-direction: column; }
        .checkbox-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin: 10px 0; }
        .btn-add-home {
          background: #2563eb; color: #fff; border: none;
          padding: 10px 15px; border-radius: 6px; cursor: pointer;
        }
          /* Section titre */
.magasin-table-section, .entrepot-table-section {
  margin-top: 2rem;
}

.magasin-table-section h3,
.entrepot-table-section h3 {
  margin-bottom: 1rem;
  color: #1e3a8a;
  font-weight: 600;
}

/* Table */
.table-responsive {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.table thead {
  background-color: #f3f4f6;
  font-weight: bold;
}

.table th,
.table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.table tr:nth-child(even) {
  background-color: #f9fafb;
}

.table tr:hover {
  background-color: #f1f5f9;
  transition: background-color 0.2s ease;
}

/* Image miniature */
.table-img {
  width: 65px;
  height: 65px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Bouton Voir */
.btn-details {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-details:hover {
  background: #1e40af;
}
  /* === Section Statistiques === */
.stats-section {
  margin: 30px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stats-section h3 {
  margin-bottom: 15px;
  font-weight: 600;
  color: #1e3a8a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
}

.stat-card {
  background: #fff;
  padding: 15px 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stat-card h4 {
  font-size: 1em;
  color: #374151;
  margin-bottom: 5px;
}

.stat-card p {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0;
}

/* Couleurs par type */
.stat-card.total { border-top: 4px solid #2563eb; }
.stat-card.occupe { border-top: 4px solid #f97316; }
.stat-card.disponible { border-top: 4px solid #10b981; }
.stat-card.taux { border-top: 4px solid #9333ea; }
 /* Container des checkbox */
.checkbox-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* Label de chaque checkbox */
.checkbox-card label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

/* Effet hover sur le label */
.checkbox-card label:hover {
  background: #4b00cc;
  color: #fff;
}

/* Style de l’input checkbox */
.checkbox-card input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #4b00cc;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

/* Checkbox cochée */
.checkbox-card input[type="checkbox"]:checked {
  background: #4b00cc;
  border-color: #4b00cc;
}

/* Petit checkmark */
.checkbox-card input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 6px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Réduction de l’espacement pour mobile */
@media (max-width: 768px) {
  .checkbox-card {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
      `}</style>
    </>
  );
}