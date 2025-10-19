import React ,{ useState, useEffect, useRef } from "react";
import { useParams,Link} from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useReactToPrint } from "react-to-print";
import NavbarLoc from "./NavbarLoc";
import Footer from "../Pages/Footer";

export default function DetailLocataire() {
  const { id } = useParams();
  const [person, setPerson] = useState({ homeId: {}, rentals: [] });
  const [works, setWorks] = useState([]);
  const [documents, setDocuments] = useState({ CNI: null, Contrat: null });
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: person.name || "Détails locataire",
  });

  // 🔹 Récupération loyers payés
  const fetchRents = async () => {
    try {
      const res = await fetch(`http://localhost:4000/rents/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPerson((prev) => ({
          ...prev,
          rentals: data.rents || [],
        }));
      } else {
        setPerson((prev) => ({ ...prev, rentals: [] }));
      }
    } catch (err) {
      console.error("Erreur fetchRents:", err);
      toast.error("Impossible de récupérer les loyers du locataire");
    }
  };

  // 🔹 Récupération des données principales du locataire
  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/detail/locataire/${id}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : { homeId: {}, rentals: [] };
      setPerson(data);

      // Documents
      const docRes = await fetch(`http://localhost:4000/locataire/${id}/documents`);
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData.success && docData.documents) setDocuments(docData.documents);
      }

      // Loyers
      await fetchRents();

      // Travaux
      await fetchWorks();
    } catch (err) {
      console.error("Erreur fetchPersonData:", err);
      toast.error("Impossible de récupérer les données du locataire");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Travaux liés au locataire
  const fetchWorks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/works/${id}`);
      const data = await res.json();
      if (res.ok && data.success) setWorks(data.works || []);
    } catch (err) {
      console.error("Erreur fetchWorks:", err);
      toast.error("Erreur serveur lors du chargement des travaux");
    }
  };

  useEffect(() => {
    if (id) fetchPersonData();
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString("fr-FR");
  };

  // 🔹 State pour gérer quelles années sont ouvertes (au niveau du composant)
const [openYears, setOpenYears] = useState({});

// 🔹 Fonction pour basculer l'année
const toggleYear = (year) => {
  setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
};

  return (
    <div>
      <NavbarLoc />
      <div className="detail-container">
        {loading ? (
          <p className="loading">Chargement des informations...</p>
        ) : (
          <div className="detail-wrapper" ref={componentRef}>
            <h2 className="title">
              {person.name || "N/A"} {person.lastname || ""}
            </h2>

            {/* Informations personnelles */}
            <div className="section">
              <h3>Informations personnelles</h3>
              <div className="info-grid">
                <p><strong>Nom :</strong> {person.name || "N/A"}</p>
                <p><strong>Prénom :</strong> {person.lastname || "N/A"}</p>
                <p><strong>Date de naissance :</strong> {formatDate(person.birth)}</p>
                  <p><strong>Lieu :</strong>  {person.lieu || "N/A"}</p>
                <p><strong>Sexe :</strong> {person.sexe || "N/A"}</p>
                <p><strong>Téléphone :</strong> {person.tel || "N/A"}</p>
                <p><strong>Email :</strong> {person.email || "N/A"}</p>
                <p><strong>Profession :</strong> {person.profession || "N/A"}</p>
                  <p><strong>Ville :</strong> {person.city || "N/A"}</p>
                <p><strong>Adresse :</strong> {person.address || "N/A"}</p>
                    <p><strong>Situation :</strong> {person.situation || "N/A"}</p>
                <p><strong>N° CNI/PAS :</strong> {person.pieces || "N/A"}</p>
                <p><strong>Date émission :</strong> {formatDate(person.date_emission)}</p>
                <p><strong>Date expiration :</strong> {formatDate(person.date_expiration)}</p>
                <p><strong>Date d’entrée :</strong> {formatDate(person.date_entrance)}</p>
                  <p><strong>Date de sortie :</strong> {person.release_date || "N/A"}</p>
              </div>
            </div>

            {/* Logement */}
            <div className="section">
              <h3>Logement attribué</h3>
              {person.homeId ? (
                <div className="home-card">
                  <div className="images">
                    {person.homeId.img && (
                      <img
                        src={person.homeId.img.startsWith("http")
                          ? person.homeId.img
                          : `http://localhost:4000/${person.homeId.img}`}
                        alt="Maison principale"
                      />
                    )}
                    {Array.isArray(person.homeId.images) &&
                      person.homeId.images.map((url, i) => (
                        <img
                          key={i}
                          src={url.startsWith("http")
                            ? url
                            : `http://localhost:4000/${url}`}
                          alt={`Image ${i}`}
                        />
                      ))}
                  </div>
                  <div className="home-info">
                    <p><strong>Nom :</strong> {person.homeId.nameHome || "N/A"}</p>
                    <p><strong>Référence :</strong> {person.homeId.reference || "N/A"}</p>
                    <p><strong>Type :</strong> {person.homeId.categorie || "N/A"}</p>
                    <p><strong>Adresse :</strong> {person.homeId.addressHome || "N/A"}</p>
                    <p><strong>Ville :</strong> {person.homeId.city || "N/A"}</p>
                    <p><strong>Nombre de pièces :</strong> {person.homeId.NmbrePieces || "N/A"}</p>
                    <p><strong>Loyer :</strong> {person.homeId.rent ? `${person.homeId.rent.toLocaleString()} FCFA` : "N/A"}</p>
                    <p><strong>Caution :</strong> {person.homeId.guarantee ? `${person.homeId.guarantee.toLocaleString()} FCFA` : "N/A"}</p>
                    <p><strong>Description :</strong> {person.homeId.description || "Aucune"}</p>
                  </div>
                </div>
              ) : (
                <p>Aucun logement attribué</p>
              )}
            </div>

              {/* Accès */}
                  <div className="tenant-section">
                    <h3 className="section-title">Accès</h3>
                    <div className="info-grid">
                      <p><span>Username :</span> {person.username || "N/A"}</p>
                      <p><span>Password :</span> {person.password || "N/A"}</p>
                    </div>
                  </div>

            {/* Travaux */}
            <div className="section">
              <h3>Travaux effectués</h3>
              {works.length === 0 ? (
                <p>Aucun travail enregistré</p>
              ) : (
                <div className="works-list">
                  {works.map((w) => (
                    <div key={w._id} className="work-card">
                      <p><strong>Titre :</strong> {w.title}</p>
                      <p><strong>Description :</strong> {w.description}</p>
                      <p><strong>Coût :</strong> {w.cost ? `${w.cost} FCFA` : "N/A"}</p>
                      <p><strong>Date :</strong> {formatDate(w.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paiements */}
{/* Paiements */}
<div className="section">
  <h3>Historique des paiements</h3>
  {person.rentals && person.rentals.length > 0 ? (
    <table className="table">
      <thead>
        <tr>
          <th>Date paiement</th>
          <th>Mois</th>
          <th>Montant</th>
          <th>Mode</th>
          <th>Statut</th>
          <th>Imprimer</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const groupedByYear = person.rentals.reduce((groups, rent) => {
            const year = rent.month ? new Date(rent.month).getFullYear() : "Inconnue";
            if (!groups[year]) groups[year] = [];
            groups[year].push(rent);
            return groups;
          }, {});

          return Object.keys(groupedByYear)
            .sort((a, b) => b - a)
            .map((year) => (
              <React.Fragment key={year}>
                {/* Ligne de l'année, cliquable */}
                <tr
                  onClick={() => toggleYear(year)}
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    background: "#f0f4ff",
                    color: "#2563eb",
                  }}
                >
                  <td colSpan={6}>
                    {openYears[year] ? "▼" : "▶"} Paiements de l’année {year}
                  </td>
                </tr>

                {/* Lignes des paiements */}
                {openYears[year] &&
                  groupedByYear[year]
                    .sort((a, b) => new Date(b.month) - new Date(a.month))
                    .map((r) => (
                      <tr key={r._id}>
                        <td>{r.date_of_payment ? new Date(r.date_of_payment).toLocaleDateString("fr-FR") : "N/A"}</td>
                        <td>{r.month ? new Date(r.month).toLocaleString("default", { month: "long", year: "numeric" }) : "N/A"}</td>
                        <td>{r.amount ? `${r.amount.toLocaleString()} FCFA` : "N/A"}</td>
                        <td>{r.mode || "N/A"}</td>
                        <td>{r.status || "N/A"}</td>
                        <td>
                         <Link to={`/Mon__recu/fr/${r._id}`}>
                  <i className="fa-solid fa-print"></i>
                </Link>
                        </td>
                      </tr>
                    ))}
              </React.Fragment>
            ));
        })()}
      </tbody>
    </table>
  ) : (
    <p>Aucun paiement trouvé</p>
  )}
</div>


            {/* Documents */}
            <div className="section">
              <h3>Documents</h3>
              <div className="doc-grid">
                <p><strong>Carte d’identité :</strong> {documents.CNI ? <a href={`http://localhost:4000/${documents.CNI}`} target="_blank">Voir</a> : "Aucun document"}</p>
                <p><strong>Contrat de bail :</strong> {documents.Contrat ? <a href={`http://localhost:4000/${documents.Contrat}`} target="_blank">Voir</a> : "Aucun document"}</p>
              </div>
            </div>

            <button className="print-btn" onClick={handlePrint}>🖨️ Imprimer</button>
          </div>
        )}
      </div>
      <Footer />

      <style>{`
        .detail-container { padding: 2rem; background: #f8fafc; }
        .detail-wrapper { background: #fff; border-radius: 10px; padding: 2rem; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .title { color: #1e3a8a; margin-bottom: 20px; }
        .section { margin-bottom: 2rem; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
        .info-grid p { background: #f9fafb; padding: 8px; border-radius: 5px; }
        .home-card { display: flex; flex-wrap: wrap; gap: 1rem; }
        .home-card img { width: 150px; height: 150px; border-radius: 6px; object-fit: cover; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .works-list { display: grid; gap: 10px; }
        .work-card { background: #f9f9f9; padding: 10px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .print-btn {
          background: #2563eb;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
          .year-row {
  background: #f0f4ff;
  color: #2563eb;
  font-weight: bold;
}
  .accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.35s ease;
  padding: 0 0;
}

.accordion-content.open {
  max-height: 1000px; /* assez grand pour contenir ton tableau */
  padding: 10px 0; /* ajoute un petit padding lors de l'ouverture */
}
 
      `}</style>
    </div>
  );
}