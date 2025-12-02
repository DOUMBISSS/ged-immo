import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:4000";

export default function DetailEntrepot() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [project, setProject] = useState(null);
  const [entrepots, setEntrepots] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [reference, setReference] = useState("");
  const [nameHome, setNameHome] = useState("");
  const [addressHome, setAddressHome] = useState("");
  const [city, setCity] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [surfaceEntrepot, setSurfaceEntrepot] = useState("");
  const [hauteurSousPlafond, setHauteurSousPlafond] = useState("");
  const [capaciteStockage, setCapaciteStockage] = useState("");
  const [quaiChargement, setQuaiChargement] = useState(false);
  const [securite, setSecurite] = useState(false);
  const [accesCamion, setAccesCamion] = useState(false);
  const [ventilation, setVentilation] = useState(false);
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
          setEntrepots(data.homes || []);
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
      formData.append("reference", reference);
      formData.append("nameHome", nameHome);
      formData.append("categorie", "entrepot");
      formData.append("addressHome", addressHome);
      formData.append("city", city);
      formData.append("quarter", quarter);
      formData.append("rent", rent);
      formData.append("description", description);
      formData.append("surfaceEntrepot", surfaceEntrepot);
      formData.append("hauteurSousPlafond", hauteurSousPlafond);
      formData.append("capaciteStockage", capaciteStockage);
      formData.append("quaiChargement", quaiChargement);
      formData.append("securite", securite);
      formData.append("accesCamion", accesCamion);
      formData.append("ventilation", ventilation);
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
        toast.success("🏗️ Entrepôt ajouté avec succès !");
        setEntrepots((prev) => [...prev, data.home]);
        setShowModal(false);
      } else {
        toast.error(data.message || "Erreur lors de l’ajout de l’entrepôt");
      }
    } catch (err) {
      console.error("Erreur ajout entrepôt:", err);
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
                <i className="fa-solid fa-warehouse"></i>{" "}
                {project ? `Entrepôts du projet : ${project.name}` : "Chargement..."}
              </h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-add-home" onClick={() => setShowModal(true)}>
                  <i className="fa-solid fa-plus"></i> Ajouter un entrepôt
                </button>
              </div>
            </div>

            {/* === Section Statistiques Entrepôt === */}
<div className="stats-section">
  <h3>📊 Statistiques des entrepôts</h3>
  <div className="stats-grid">
    <div className="stat-card total">
      <h4>Total</h4>
      <p>{entrepots.length}</p>
    </div>
    <div className="stat-card occupe">
      <h4>Occupés</h4>
      <p>{entrepots.filter((e) => e.state?.toLowerCase() === "occupé" || e.state?.toLowerCase() === "loué").length}</p>
    </div>
    <div className="stat-card disponible">
      <h4>Disponibles</h4>
      <p>{entrepots.filter((e) => e.state?.toLowerCase() === "disponible").length}</p>
    </div>
    <div className="stat-card taux">
      <h4>Taux d’occupation</h4>
      <p>
        {entrepots.length > 0
          ? `${Math.round(
              (entrepots.filter((e) => e.state?.toLowerCase() === "occupé" || e.state?.toLowerCase() === "loué").length /
                entrepots.length) *
                100
            )}%`
          : "0%"}
      </p>
    </div>
  </div>
</div>

       <div className="entrepot-table-section mt-4">
  <h3>🏭 Liste des entrepôts</h3>

  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Nom</th>
          <th>Référence</th>
          <th>Ville</th>
          <th>Surface</th>
          <th>Hauteur</th>
          <th>Capacité</th>
          <th>Loyer mensuel</th>
          <th>Équipements</th>
          <th>Détails</th>
        </tr>
      </thead>
      <tbody>
        {entrepots.length > 0 ? (
          entrepots.map((e) => (
            <tr key={e._id}>
              <td>
                <img
                  src={e.img ? `${API}/${e.img}` : "/logo4 copie.jpg"}
                  alt={e.nameHome}
                  className="table-img"
                />
              </td>
              <td>{e.nameHome}</td>
              <td>{e.reference}</td>
              <td>{e.city || "N/A"}</td>
              <td>{e.surfaceEntrepot ? `${e.surfaceEntrepot} m²` : "N/A"}</td>
              <td>{e.hauteurSousPlafond || "N/A"}</td>
              <td>{e.capaciteStockage || "N/A"}</td>
              <td>
                {e.rent
                  ? `${parseInt(e.rent).toLocaleString()} F CFA`
                  : "Non défini"}
              </td>
              <td>
                {[
                  e.quaiChargement && "Quai",
                  e.securite && "Sécurité",
                  e.accesCamion && "Accès camion",
                  e.ventilation && "Ventilation",
                ]
                  .filter(Boolean)
                  .join(", ") || "Aucun"}
              </td>
              <td>
                <Link to={`/detailHome/${e._id}`}>
                  <button className="btn-details">
                    <i className="fa-solid fa-eye"></i> Voir
                  </button>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="10" className="text-center">
              Aucun entrepôt trouvé pour ce projet.
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

      {/* Modal ajout */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <form onSubmit={handleSubmit} className="form">
              <h1 className="page-title"><i className="fa-solid fa-warehouse"></i> Ajouter un entrepôt</h1>

              <label>Nom</label>
              <input type="text" value={nameHome} onChange={(e) => setNameHome(e.target.value)} required />

              <label>Référence</label>
              <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} required />

              <label>Surface (m²)</label>
              <input type="text" value={surfaceEntrepot} onChange={(e) => setSurfaceEntrepot(e.target.value)} />

              <label>Hauteur sous plafond</label>
              <input type="text" value={hauteurSousPlafond} onChange={(e) => setHauteurSousPlafond(e.target.value)} />

              <label>Capacité de stockage</label>
              <input type="text" value={capaciteStockage} onChange={(e) => setCapaciteStockage(e.target.value)} />

              <div className="checkbox-grid">
                <label><input type="checkbox" checked={quaiChargement} onChange={() => setQuaiChargement(!quaiChargement)} /> Quai de chargement</label>
                <label><input type="checkbox" checked={securite} onChange={() => setSecurite(!securite)} /> Sécurité</label>
                <label><input type="checkbox" checked={accesCamion} onChange={() => setAccesCamion(!accesCamion)} /> Accès camion</label>
                <label><input type="checkbox" checked={ventilation} onChange={() => setVentilation(!ventilation)} /> Ventilation</label>
              </div>

              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

              <button type="submit" className="btn-add-home">Ajouter</button>
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
      `}</style>
    </>
  );
}