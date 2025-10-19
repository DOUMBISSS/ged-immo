import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Pages/Navbar";
import Footer from "../Pages/Footer";
import toast, { Toaster } from "react-hot-toast";
import { Blocks } from "react-loader-spinner";

export default function DetailArchivedHome() {
  const { id } = useParams();
  const [home, setHome] = useState({ archived: true, rentals: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/detail/homeArchive/${id}`);
      if (!res.ok) throw new Error("Erreur récupération maison");

      const text = await res.text();
      const data = text ? JSON.parse(text) : { archived: true, rentals: [] };
      setHome(data);
    } catch (e) {
      console.error("Erreur fetchHomeData:", e);
      toast.error("Impossible de récupérer les données de la maison");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [id]);

  // 🔹 Restaurer une maison archivée
const restoreHome = (homeId, projectId) => {
  toast((t) => (
    <span>
      Voulez-vous vraiment restaurer cette maison ?
      <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
        <button
          style={{ background: "#ef4444", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
          onClick={async () => {
            try {
              const res = await fetch(`http://localhost:4000/homes/${homeId}/restore`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Erreur restauration");

              toast.success("Maison restaurée avec succès !");
              
              // 🔹 Redirection vers le projet
              navigate('/Mes__archives');
            } catch (err) {
              console.error(err);
              toast.error("Impossible de restaurer la maison");
            } finally {
              toast.dismiss(t.id);
            }
          }}
        >
          ✅ Oui
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{ background: "#6b7280", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
        >
          ❌ Non
        </button>
      </div>
    </span>
  ), { duration: 50000 });
};

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date) ? dateStr : date.toLocaleDateString("fr-FR");
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            {loading ? (
              <Blocks height="80" width="100%" color="#4fa94d" ariaLabel="loading" radius="1" visible={true} />
            ) : (
              <div className="detail-home-wrapper">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/homes-archives">Home</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Détails de la maison</li>
                  </ol>
                </nav>

                <div className="home-card">
                  <div className="home-header">
                    <h2 className="home-title">{home.nameHome || "N/A"}</h2>
                    <button className="details__btn btn-restore" onClick={() => restoreHome(home._id, home.projectId)}>
                      Restaurer
                    </button>
                  </div>

                  {/* Infos maison */}
                  <div className="home-section">
                    <h3 className="section-title">Informations principales</h3>
                    <div className="info-grid">
                      <p><span>Référence :</span> {home.reference || "N/A"}</p>
                      <p><span>Type :</span> {home.categorie || "N/A"}</p>
                      <p><span>Adresse :</span> {home.addressHome || "N/A"}</p>
                      <p><span>Quartier :</span> {home.quarter || "N/A"}</p>
                      <p><span>Ville :</span> {home.city || "N/A"}</p>
                      <p><span>Nombre de pièces :</span> {home.NmbrePieces || "N/A"}</p>
                      <p><span>Loyer :</span> {home.rent ? `${Number(home.rent).toLocaleString()} FCFA` : "N/A"}</p>
                      <p><span>Caution :</span> {home.guarantee ? `${Number(home.guarantee).toLocaleString()} FCFA` : "N/A"}</p>
                      <p><span>Observations :</span> {home.observations || "Aucune observation"}</p>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="home-section">
                    <h3 className="section-title">Images</h3>
                    <div className="home-images">
                      {home.img && (
                        <img
                          src={home.img.startsWith("http") ? home.img : `http://localhost:4000/${home.img}`}
                          alt="Image principale"
                          style={{ width: "150px", height: "150px", objectFit: "cover", marginRight: "8px" }}
                        />
                      )}
                      {Array.isArray(home.images) && home.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.startsWith("http") ? img : `http://localhost:4000/${img}`}
                          alt={`Image secondaire ${idx}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "5px" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Historique des locataires */}
                  <div className="home-section">
                    <h3 className="section-title">Historique des locataires</h3>
                    {home.rentals && home.rentals.length > 0 ? (
                      <ul>
                        {home.rentals.map((rental) => (
                          <li key={rental._id}>
                            {rental.name} {rental.prenom} - Entrée: {formatDate(rental.date_entrance)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucun locataire enregistré</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
      <Footer />
    </div>
  );
}