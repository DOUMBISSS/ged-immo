import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PaiementDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState({});
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/detail/person/${id}`);
      if (!res.ok) throw new Error("Erreur récupération locataire");

      const text = await res.text();
      const data = text ? JSON.parse(text) : { homes: {}, rentals: [] };
      setPerson(data);

      // Récupération documents
      const docRes = await fetch(`http://localhost:4000/persons/${id}/documents`);
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData.success && docData.documents) {
          setDocuments(docData.documents);
        } else {
          setDocuments({ CNI: null, Contrat: null });
        }
      }
    } catch (e) {
      console.error("Erreur fetchPersonData:", e);
      toast.error("Impossible de récupérer les données du locataire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonData();
  }, [id]);

  // Impression
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: person.name + " " + person.prenom,
  });

  return (
    <div>
      <Navbar />
      <div className="saas-container">
        {loading ? (
          <div className="loading">
            <TailSpin height="80" width="80" color="#4fa94d" />
          </div>
        ) : (
          <div className="saas-card">
            <nav aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/Accueil">Accueil</Link></li>
                <li><Link to="/users">Locataires</Link></li>
                <li>Détails du profil</li>
                <li>Détails des paiements</li>
              </ol>
            </nav>

            <div className="header-actions">
              <button className="btn-print" onClick={handlePrint}>
                <i className="fa-solid fa-print"></i> Imprimer
              </button>
            </div>

            <div ref={componentRef} className="saas-content">
              {/* Bloc infos en flex */}
              <div className="info-blocks">
                {/* Infos locataire */}
                <div className="info-block">
                  <h3>Informations du locataire</h3>
                  <p><strong>Nom :</strong> {person.name}</p>
                  <p><strong>Prénom :</strong> {person.prenom}</p>
                  <p><strong>Né(e) :</strong> {person.birth}</p>
                  <p><strong>Nationalité :</strong> {person.nationality}</p>
                  <p><strong>Email :</strong> {person.email}</p>
                  <p><strong>Téléphone :</strong> {person.tel}</p>
                  <p><strong>Profession :</strong> {person.profession}</p>
                  <p><strong>Domicile :</strong> {person.address}</p>
                  <p><strong>CNI/PAS :</strong> {person.piece}</p>
                  <p><strong>Date d'entrée :</strong> {person.date_entrance}</p>
                </div>

                {/* Infos logement */}
                {person.homes && (
                  <div className="info-block">
                    <h3>Logement occupé</h3>
                    <p><strong>Catégorie :</strong> {person.homes.categorie}</p>
                    <p><strong>Adresse :</strong> {person.homes.addressHome}</p>
                    <p><strong>Loyer mensuel :</strong> {person.homes.rent ? `${person.homes.rent} FCFA` : 'N/A'}</p>
                    <p><strong>Surface :</strong> {person.homes.surface || 'Non renseignée'} m²</p>
                    <p><strong>Nombre de pièces :</strong> {person.homes.rooms || 'Non renseigné'}</p>
                    <p><strong>Étage :</strong> {person.homes.floor || 'Non renseigné'}</p>
                    <p><strong>Type de bail :</strong> {person.homes.bailType || 'Non renseigné'}</p>
                    <p><strong>Disponibilité :</strong> {person.homes.disponible ? 'Oui' : 'Non'}</p>
                  </div>
                )}
              </div>

              {/* Paiements */}
              <div className="payment-section">
                <h3>Détails des paiements</h3>
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Heure</th>
                      <th>Date</th>
                      <th>Mois</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {person.rentals?.map((rental) => (
                      <tr key={rental._id}>
                        <td>{rental.time}</td>
                        <td>
                          {rental.date_of_payment
                            ? new Date(rental.date_of_payment).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>
                          {rental.month
                            ? new Date(rental.month).toLocaleString("default", { month: "long" })
                            : "N/A"}
                        </td>
                        <td>{person.homes?.rent ? `${person.homes.rent} FCFA` : "N/A"}</td>
                        <td>
                          <span className={`status ${rental.status === "payé" ? "paid" : "pending"}`}>
                            {rental.status}
                          </span>
                        </td>
                        <td>{rental.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Documents */}
              <div className="documents-section">
                <h3>Documents</h3>
                <ul>
                  <li><strong>CNI :</strong> {documents.CNI ? <a href={documents.CNI} target="_blank" rel="noreferrer">Voir</a> : "Non disponible"}</li>
                  <li><strong>Contrat :</strong> {documents.Contrat ? <a href={documents.Contrat} target="_blank" rel="noreferrer">Voir</a> : "Non disponible"}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* --- CSS intégré --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb ol { display: flex; list-style: none; padding: 0; gap: .5rem; font-size: 14px; }
        .breadcrumb a { text-decoration: none; color: #2563eb; }
        .header-actions { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
        .btn-print { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btn-print:hover { background: #1e40af; }
        .info-blocks { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .info-block { flex: 1; min-width: 250px; background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; }
        .info-block h3 { margin-bottom: 1rem; }
        .info-block p { margin: .3rem 0; font-size: 14px; }
        .payment-section h3, .documents-section h3 { margin-bottom: 1rem; color: #111827; }
        .payment-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .payment-table th, .payment-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .payment-table th { background: #f1f5f9; }
        .status { padding: .2rem .6rem; border-radius: 12px; font-size: 12px; }
        .status.paid { background: #dcfce7; color: #166534; }
        .status.pending { background: #fef9c3; color: #854d0e; }
        .documents-section ul { list-style: none; padding: 0; }
        .documents-section li { margin-bottom: .5rem; font-size: 14px; }
      `}</style>
    </div>
  );
}