import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";
// import DuplicateShopModal from "./DuplicateShopModal";

export default function DetailMagasin() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [project, setProject] = useState(null);
  const [shops, setShops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  useEffect(() => {
    if (!user?.token) return;
    fetch(`https://backend-ged-immo.onrender.com/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProject(data.project);
        setShops(data.homes || []); // même champ que "homes" pour magasins
      })
      .catch((err) => console.error("Erreur récupération magasin:", err));
  }, [projectId, user?.token]);

  const handleAddShop = async (e) => {
    e.preventDefault();
    if (!user?.token) return toast.error("Non connecté !");
    const formData = new FormData(e.target);

    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/newHome/${projectId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Magasin ajouté avec succès !");
        setShops((prev) => [...prev, data.home]);
        setShowModal(false);
        e.target.reset();
      } else {
        toast.error(data.message || "Erreur lors de l'ajout du magasin");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur lors de l'ajout du magasin");
    }
  };

  const activeShops = shops.filter((s) => !s.archived);
  const occupied = activeShops.filter((s) => s.state === "Occupé").length;
  const available = activeShops.length - occupied;

  const filteredShops = activeShops.filter((shop) => {
    const matchState = !filterState || shop.state === filterState;
    const matchCity = !filterCity || shop.city?.toLowerCase().includes(filterCity.toLowerCase());
    return matchState && matchCity;
  });

  return (
    <>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            <div className="header">
              <h1>
                <i className="fa-solid fa-store"></i>{" "}
                {project ? `Magasins du projet : ${project.name}` : "Chargement..."}
              </h1>
              <div className="actions">
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  <i className="fa-solid fa-plus"></i> Ajouter un magasin
                </button>
                <button onClick={() => navigate("/Mes__archives")} className="btn-archives">
                  <i className="fa-solid fa-box-archive"></i> Archives
                </button>
              </div>
            </div>

            {/* --- Statistiques --- */}
            <div className="stats">
              <div className="stat-card">
                <h4>Total Magasins</h4>
                <span>{activeShops.length}</span>
              </div>
              <div className="stat-card">
                <h4>Disponibles</h4>
                <span>{available}</span>
              </div>
              <div className="stat-card">
                <h4>Occupés</h4>
                <span>{occupied}</span>
              </div>
            </div>

            {/* --- Filtres --- */}
            <div className="filter-bar">
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="form-input"
              >
                <option value="">Tous les statuts</option>
                <option value="Disponible">Disponible</option>
                <option value="Occupé">Occupé</option>
              </select>

              <input
                type="text"
                placeholder="Ville..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="form-input"
              />

              <button onClick={() => { setFilterCity(""); setFilterState(""); }} className="btn-reset">
                Réinitialiser
              </button>
            </div>

            {/* --- Liste des magasins --- */}
            <div className="shops-grid">
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <div key={shop._id} className="shop-card">
                    <div className="shop-image">
                      <Link to={`/detailShop/${shop._id}`}>
                        <img
                          src={
                            shop.img
                              ? `https://backend-ged-immo.onrender.com/${shop.img}`
                              : "/logo4 copie.jpg"
                          }
                          alt={shop.nameHome}
                        />
                      </Link>
                    </div>
                    <div className="shop-content">
                      <h3>
                        {shop.nameHome}
                        {shop.state === "Disponible" ? (
                          <span className="badge available">Disponible</span>
                        ) : (
                          <span className="badge occupied">Occupé</span>
                        )}
                      </h3>
                      <p><strong>Ville :</strong> {shop.city || "—"}</p>
                      <p><strong>Quartier :</strong> {shop.quarter || "—"}</p>
                      <p><strong>Loyer :</strong> {shop.rent?.toLocaleString()} FCFA</p>
                      <p><strong>Surface :</strong> {shop.surface || "N/A"} m²</p>
                      <p className="desc">{shop.description}</p>

                      <button
                        className="btn-duplicate"
                        onClick={() => {
                          setSelectedShop(shop);
                          setShowDuplicateModal(true);
                        }}
                      >
                        <i className="fa fa-copy"></i> Dupliquer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucun magasin trouvé.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* --- Modal ajout magasin --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2>Ajouter un magasin</h2>
            <form onSubmit={handleAddShop}>
              <label>Nom du magasin</label>
              <input type="text" name="nameHome" required />

              <label>Référence</label>
              <input type="text" name="reference" />

              <label>Ville</label>
              <input type="text" name="city" />

              <label>Quartier</label>
              <input type="text" name="quarter" />

              <label>Adresse</label>
              <input type="text" name="addressHome" />

              <label>Loyer (FCFA)</label>
              <input type="number" name="rent" />

              <label>Description</label>
              <textarea name="description" rows="3"></textarea>

              <label>Image principale</label>
              <input type="file" name="img" />

              <button type="submit" className="btn-primary">Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal duplication --- */}
      {/* {showDuplicateModal && selectedShop && (
        <DuplicateShopModal
          shop={selectedShop}
          projectId={projectId}
          adminId={user._id}
          onClose={() => {
            setShowDuplicateModal(false);
            setSelectedShop(null);
          }}
          onDuplicated={(newShop) => setShops((prev) => [...prev, newShop])}
        />
      )} */}

      <style jsx>{`
        .stats {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          flex: 1;
          background: #f8f9fa;
          border-radius: 10px;
          text-align: center;
          padding: 15px;
        }
        .shops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .shop-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .shop-card:hover {
          transform: scale(1.02);
        }
        .shop-image img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .shop-content {
          padding: 15px;
        }
        .badge {
          margin-left: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
        }
        .badge.available {
          background: #28a745;
          color: white;
        }
        .badge.occupied {
          background: #dc3545;
          color: white;
        }
      `}</style>
    </>
  );
}