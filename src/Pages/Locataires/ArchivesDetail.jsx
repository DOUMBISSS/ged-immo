import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function ArchivesDetail() {
  const { id } = useParams();
  const [archive, setArchive] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchArchiveData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/archives/locataire/${id}`);
      if (!res.ok) throw new Error("Erreur récupération archive");

      const data = await res.json();
      setArchive(data);
    } catch (e) {
      console.error("Erreur fetchArchiveData:", e);
      toast.error("Impossible de récupérer les données de l'archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, [id]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${archive.name || ""} ${archive.lastname || ""}`,
  });

  const totalPaiements = archive.rentalIds?.reduce(
    (sum, p) => sum + (p.amountPaid || 0),
    0
  );

    const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

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
                <li><Link to="/archives">Archives</Link></li>
                <li>Détails du locataire</li>
              </ol>
            </nav>

            <div className="header-actions">
              <button className="btn-print" onClick={handlePrint}>
                <i className="fa-solid fa-print"></i> Imprimer
              </button>
            </div>

            <div ref={componentRef} className="saas-content">
              {/* Bloc Infos principales */}
              <div className="info-blocks">
                {/* Infos locataire */}
                <div className="info-block">
                  <h3>Informations du locataire</h3>
                  <p><strong>Nom :</strong> {archive.name}</p>
                  <p><strong>Prénom :</strong> {archive.lastname}</p>
                  <p><strong>Date de naissance :</strong> {formatDate(archive.birth || "N/A")}</p>
                  <p><strong>Nationalité :</strong> {archive.nationality || "N/A"}</p>
                  <p><strong>Email :</strong> {archive.email || "N/A"}</p>
                  <p><strong>Téléphone :</strong> {archive.tel || "N/A"}</p>
                  <p><strong>Profession :</strong> {archive.profession || "N/A"}</p>
                  <p><strong>Domicile :</strong> {archive.address || "N/A"}</p>
                  <p><strong>Date d'entrée :</strong> {formatDate(archive.date_entrance || "N/A")}</p>
                  <p><strong>Date de libération :</strong> {formatDate(archive.release_date)}</p>
                  <p><strong>Raison de départ :</strong> {archive.reason || "Non précisée"}</p>
                </div>

                {/* Infos logement */}
                <div className="info-block">
  <h3>Logement occupé</h3>
  <p><strong>Nom du logement :</strong> {archive.homeInfo.nameHome || "N/A"}</p>
  <p><strong>Référence :</strong> {archive.homeInfo.reference || "N/A"}</p>
  <p><strong>Catégorie :</strong> {archive.homeInfo.categorie || "N/A"}</p>
  <p><strong>Adresse :</strong> {archive.homeInfo.addressHome || "N/A"}</p>
  <p><strong>Quartier :</strong> {archive.homeInfo.quarter || "N/A"}</p>
  <p><strong>Ville :</strong> {archive.homeInfo.city || "N/A"}</p>
  <p><strong>Nombre de pièces :</strong> {archive.homeInfo.NmbrePieces || "N/A"}</p>
  <p><strong>Loyer mensuel :</strong> {archive.homeInfo.rent ? `${parseInt(archive.homeInfo.rent).toLocaleString()} FCFA` : "N/A"}</p>
  <p><strong>Caution :</strong> {archive.homeInfo.guarantee ? `${parseInt(archive.homeInfo.guarantee).toLocaleString()} FCFA` : "N/A"}</p>
  <p><strong>Observations :</strong> {archive.homeInfo.observations || "Aucune observation"}</p>

  {/* 🔹 Images principales et secondaires */}
  <div style={{ marginTop: "10px" }}>
    <strong>Images du logement :</strong>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
      {archive.homeInfo.img && (
        <img
          src={archive.homeInfo.img.startsWith("http")
            ? archive.homeInfo.img
            : `http://localhost:4000/${archive.homeInfo.img}`}
          alt="Image principale"
          style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
        />
      )}
      {Array.isArray(archive.homeInfo.images) &&
        archive.homeInfo.images.map((img, idx) => (
          <img
            key={idx}
            src={img.startsWith("http") ? img : `http://localhost:4000/${img}`}
            alt={`Image secondaire ${idx + 1}`}
            style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }}
          />
        ))}
    </div>
  </div>
</div>
              </div>

              {/* Paiements */}
              <div className="payment-section">
                <h3>Détails des paiements</h3>

                {archive.rentalIds?.length > 0 ? (
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Date de paiement</th>
                        <th>Mois concerné</th>
                        <th>Montant payé</th>
                        <th>Statut</th>
                        <th>Mode de paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archive.rentalIds.map((rental) => (
                        <tr key={rental._id}>
                          <td>{rental.time || "—"}</td>
                          <td>
                            {rental.date_of_payment
                              ? new Date(rental.date_of_payment).toLocaleDateString("fr-FR")
                              : "N/A"}
                          </td>
                          <td>
                            {rental.month
                              ? new Date(rental.month).toLocaleString("fr-FR", { month: "long", year: "numeric" })
                              : "N/A"}
                          </td>
                          <td>
                            {rental.amountPaid
                              ? `${rental.amountPaid.toLocaleString()} FCFA`
                              : "—"}
                          </td>
                          <td>
                            <span
                              className={`status ${rental.status === "payé" ? "paid" : "pending"}`}
                            >
                              {rental.status || "Inconnu"}
                            </span>
                          </td>
                          <td>{rental.mode || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Aucun paiement enregistré pour ce locataire.</p>
                )}

                {archive.rentalIds?.length > 0 && (
                  <div className="total-section">
                    <strong>Total payé :</strong>{" "}
                    <span className="total-value">{totalPaiements.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

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
        .payment-section h3 { margin-bottom: 1rem; color: #111827; }
        .payment-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 1rem; }
        .payment-table th, .payment-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .payment-table th { background: #f1f5f9; }
        .status { padding: .2rem .6rem; border-radius: 12px; font-size: 12px; }
        .status.paid { background: #dcfce7; color: #166534; }
        .status.pending { background: #fef9c3; color: #854d0e; }
        .total-section { text-align: right; font-size: 16px; margin-top: 1rem; }
        .total-value { color: #2563eb; font-weight: bold; }
      `}</style>
    </div>
  );
}