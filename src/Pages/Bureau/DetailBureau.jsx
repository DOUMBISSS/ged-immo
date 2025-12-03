import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../../contexts/UserContext";

// const API = "http://localhost:4000";
const API ="https://backend-ged-immo.onrender.com"

export default function DetailBureau() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [project, setProject] = useState(null);
  const [bureaux, setBureaux] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Champs du formulaire
  const [reference, setReference] = useState("");
  const [nameHome, setNameHome] = useState("");
  const [addressHome, setAddressHome] = useState("");
  const [city, setCity] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [guarantee, setGuarantee] = useState("");
  const [surfaceBureau, setSurfaceBureau] = useState("");
  const [NmbreBureaux, setNmbreBureaux] = useState("");
  const [salleReunion, setSalleReunion] = useState(false);
  const [climatisation, setClimatisation] = useState(false);
  const [fibreOptique, setFibreOptique] = useState(false);
  const [parking, setParking] = useState(false);
  const [ascenseur, setAscenseur] = useState(false);
  const [state, setState] = useState("Disponible");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setBureaux(data.homes || []);
        }
      })
      .catch((err) => console.error("Erreur chargement projet:", err));
  }, [projectId, user?.token]);

  const handleFileChange = (e) => setImages(e.target.files);
  const handleMainImageChange = (e) => setImg(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reference || !nameHome || !addressHome || !city || !rent) {
      toast.error("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("nameHome", nameHome);
      formData.append("categorie", "bureau");
      formData.append("addressHome", addressHome);
      formData.append("city", city);
      formData.append("quarter", quarter);
      formData.append("rent", rent);
      formData.append("description", description);
      formData.append("guarantee", guarantee);
      formData.append("surfaceBureau", surfaceBureau);
      formData.append("NmbreBureaux", NmbreBureaux);
      formData.append("salleReunion", salleReunion);
      formData.append("climatisation", climatisation);
      formData.append("fibreOptique", fibreOptique);
      formData.append("parking", parking);
      formData.append("ascenseur", ascenseur);
      formData.append("state", state);

      if (img) formData.append("img", img);
      if (images.length > 0) Array.from(images).forEach((f) => formData.append("images", f));

      const res = await fetch(`${API}/newHome/${projectId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("🏢 Bureau ajouté avec succès !");
        setBureaux((prev) => [...prev, data.home]);
        setShowModal(false);
      } else {
        toast.error(data.message || "Erreur lors de l’ajout du bureau");
      }
    } catch (err) {
      console.error("Erreur ajout bureau:", err);
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
                <i className="fa-solid fa-building"></i>{" "}
                {project ? `Bureaux du projet : ${project.name}` : "Chargement..."}
              </h1>
              <div style={{ display: "flex", gap: "10px" }}>
                {project && (
                  <button className="btn-add-home" onClick={() => setShowModal(true)}>
                    <i className="fa-solid fa-plus"></i> Ajouter un bureau
                  </button>
                )}
                {/* <button
                  className="btn-archives"
                  onClick={() => navigate("/Mes__archives")}
                >
                  <i className="fa-solid fa-archive"></i> Voir archives
                </button> */}
              </div>
            </div>

            {/* === Section Statistiques === */}
<div className="stats-section">
  <h3>📊 Statistiques du parc de bureaux</h3>
  <div className="stats-grid">
    <div className="stat-card total">
      <h4>Total</h4>
      <p>{bureaux.length}</p>
    </div>
    <div className="stat-card occupe">
      <h4>Occupés</h4>
      <p>{bureaux.filter((b) => b.state?.toLowerCase() === "occupé" || b.state?.toLowerCase() === "loué").length}</p>
    </div>
    <div className="stat-card disponible">
      <h4>Disponibles</h4>
      <p>{bureaux.filter((b) => b.state?.toLowerCase() === "disponible").length}</p>
    </div>
    <div className="stat-card taux">
      <h4>Taux d’occupation</h4>
      <p>
        {bureaux.length > 0
          ? `${Math.round(
              (bureaux.filter((b) => b.state?.toLowerCase() === "occupé" || b.state?.toLowerCase() === "loué").length /
                bureaux.length) *
                100
            )}%`
          : "0%"}
      </p>
    </div>
  </div>
</div>


 <div className="bureau-table-section mt-4">
  <h3>🏢 Liste des bureaux</h3>

  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Nom du bureau</th>
          <th>Référence</th>
          <th>Ville</th>
          <th>Surface</th>
          <th>Nombre de bureaux</th>
          <th>Loyer mensuel</th>
          <th>Équipements</th>
          <th>Détails</th>
        </tr>
      </thead>
      <tbody>
        {bureaux.length > 0 ? (
          bureaux.map((b) => (
            <tr key={b._id}>
              <td>
                <img
                  src={b.img ? `${API}/${b.img}` : "/logo4 copie.jpg"}
                  alt={b.nameHome}
                  className="table-img"
                />
              </td>
              <td>{b.nameHome}</td>
              <td>{b.reference}</td>
              <td>{b.city || "N/A"}</td>
              <td>{b.surfaceBureau ? `${b.surfaceBureau} m²` : "N/A"}</td>
              <td>{b.NmbreBureaux || b.NmbrePieces || "N/A"}</td>
              <td>
                {b.rent
                  ? `${parseInt(b.rent).toLocaleString()} F CFA`
                  : "Non défini"}
              </td>
              <td>
                {[
                  b.salleReunion && "Salle de réunion",
                  b.climatisation && "Climatisation",
                  b.fibreOptique && "Fibre optique",
                  b.parking && "Parking",
                  b.ascenseur && "Ascenseur",
                ]
                  .filter(Boolean)
                  .join(", ") || "Aucun"}
              </td>
              <td>
                <Link to={`/detailHome/${b._id}`}>
                  <button className="btn-details">
                    <i className="fa-solid fa-eye"></i> Voir
                  </button>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" style={{ textAlign: "center" }}>
              Aucun bureau trouvé pour ce projet.
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

      {/* MODAL AJOUT BUREAU */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <form onSubmit={handleSubmit} className="form">
              <h1 className="page-title">
                <i className="fa-solid fa-building"></i> Ajouter un bureau
              </h1>

              <div className="form-row">
                <label>Nom du bureau</label>
                <input type="text" value={nameHome} onChange={(e) => setNameHome(e.target.value)} required />
              </div>

              <div className="form-row">
                <label>Référence</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} required />
              </div>

              <div className="form-row">
                <label>Ville</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>

              <div className="form-row">
                <label>Quartier</label>
                <input type="text" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
              </div>

              <div className="form-row">
                <label>Adresse</label>
                <input type="text" value={addressHome} onChange={(e) => setAddressHome(e.target.value)} />
              </div>

              <div className="form-row">
                <label>Loyer (FCFA)</label>
                <input type="text" value={rent} onChange={(e) => setRent(e.target.value)} />
              </div>

              <div className="form-row">
                <label>Surface (m²)</label>
                <input type="text" value={surfaceBureau} onChange={(e) => setSurfaceBureau(e.target.value)} />
              </div>

              <div className="form-row">
                <label>Nombre de bureaux</label>
                <input type="text" value={NmbreBureaux} onChange={(e) => setNmbreBureaux(e.target.value)} />
              </div>

              <div className="checkbox-grid">
                <label><input type="checkbox" checked={salleReunion} onChange={() => setSalleReunion(!salleReunion)} /> Salle de réunion</label>
                <label><input type="checkbox" checked={climatisation} onChange={() => setClimatisation(!climatisation)} /> Climatisation</label>
                <label><input type="checkbox" checked={fibreOptique} onChange={() => setFibreOptique(!fibreOptique)} /> Fibre optique</label>
                <label><input type="checkbox" checked={parking} onChange={() => setParking(!parking)} /> Parking</label>
                <label><input type="checkbox" checked={ascenseur} onChange={() => setAscenseur(!ascenseur)} /> Ascenseur</label>
              </div>

              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

              <label>Caution (FCFA)</label>
              <input type="text" value={guarantee} onChange={(e) => setGuarantee(e.target.value)} />

              <div className="form-row">
                <label>Image principale</label>
                <input type="file" onChange={handleMainImageChange} />
              </div>

              <div className="form-row">
                <label>Images secondaires</label>
                <input type="file" multiple onChange={handleFileChange} />
              </div>

              <button type="submit" className="btn-add-home">Ajouter le bureau</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
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
          .brochure-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
  margin-top: 30px;
}

.brochure-card {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  width: 100%;
  max-width: 700px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.brochure-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
}

.brochure-image {
  flex: 1;
  min-width: 200px;
  max-width: 250px;
  height: 180px;
  overflow: hidden;
}

.brochure-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brochure-content {
  flex: 2;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brochure-content h3 {
  margin-top: 0;
  font-size: 1.3em;
  color: #2563eb;
}

.brochure-content p {
  margin: 5px 0;
  color: #444;
  font-size: 0.95em;
}

.address {
  margin-top: 10px;
  font-style: italic;
  color: #555;
}

.brochure-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-view,
.btn-contact {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-view {
  background: #2563eb;
  color: white;
}

.btn-contact {
  background: #10b981;
  color: white;
}

.btn-view:hover {
  background: #1e4fcc;
}

.btn-contact:hover {
  background: #0a946a;
}
 .bureau-table-section {
  margin-top: 2rem;
}

.bureau-table-section h3 {
  margin-bottom: 1rem;
  color: #1e3a8a; /* bleu foncé élégant */
  font-weight: 600;
}

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

.table-img {
  width: 65px;
  height: 65px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

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
      `}</style>
    </>
  );
}