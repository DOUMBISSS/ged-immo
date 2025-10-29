import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";

const API = "https://backend-ged-immo.onrender.com";

export default function ReceiptLocataire() {
  const { rentId } = useParams();
  const [rental, setRental] = useState(null);
  const [person, setPerson] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [home, setHome] = useState(null);
  const componentRef = useRef();

  // ✅ Utilisation correcte de useReactToPrint avec contentRef (v3)
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ✅ nouveau format
    documentTitle: rental ? `Reçu-${rental._id}` : "Reçu",
  });


  // 🔹 Étape 1 : Charger le paiement (rents/receipt)
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`${API}/rents/receipt/${rentId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du reçu");
        const data = await res.json();
        setRental(data.rental);
        setPerson(data.person);
      } catch (err) {
        console.error("Erreur fetchReceipt:", err);
      }
    };
    fetchReceipt();
  }, [rentId]);

  // 🔹 Étape 2 : Charger les infos complètes du locataire (admin + maison)
  useEffect(() => {
    if (!person?._id) return;
    const fetchLocataire = async () => {
      try {
        const res = await fetch(`${API}/detail/locataire/${person._id}`);
        if (!res.ok) throw new Error("Erreur récupération locataire");
        const data = await res.json();
        setAdmin(data.adminId);
        setHome(data.homeId);
      } catch (err) {
        console.error("Erreur fetchLocataire:", err);
      }
    };
    fetchLocataire();
  }, [person]);

  if (!rental || !person || !admin || !home)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Chargement du reçu...</p>;

  const formatCurrency = (amt) => Number(amt || 0).toLocaleString("fr-FR") + " FCFA";
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";
  const formatMonth = (month) => {
    if (!month) return "N/A";
    const date = new Date(`${month}-01`);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  return (
    <div className="receipt-xxl-container">
      <div className="receipt-xxl-card" ref={componentRef}>
        <div className="receipt-xxl-header">
          <h1>Reçu Paiement N° {rental.receipt_number || rental._id}</h1>
        </div>

        {/* === Infos Propriétaire et Locataire === */}
        <div className="receipt-xxl-section">
          <div>
            <h5>Le propriétaire</h5>
            <p><strong>{admin?.fullname || "Néant"}</strong></p>
            <p><strong>{admin?.number || admin?.phone || "Néant"}</strong></p>
            <p><strong>{admin?.email || "Néant"}</strong></p>
            <p><strong>{admin?.address || "Néant"}</strong></p>
          </div>
          <div>
            <h5>Le locataire</h5>
            <p><strong>{person.name} {person.lastname}</strong></p>
            <p><strong>{person.tel || person.number || "N/A"}</strong></p>
            <p><strong>{person.email || "N/A"}</strong></p>
            <p><strong>{person.address || "N/A"}</strong></p>
          </div>
        </div>

        {/* === Description du paiement === */}
        <div className="receipt-xxl-description">
          <p>Reçu de <strong>{person.name} {person.lastname}</strong></p>
          <p>La somme de <strong>{formatCurrency(rental.amount)}</strong></p>
          <p>Le <strong>{formatDate(rental.date_of_payment)}</strong></p>
          <p>
            Pour le loyer du/de <strong>{home?.categorie || "Logement"} 
            {home?.NmbrePieces ? ` (${home.NmbrePieces} pièces)` : ""}</strong> situé à : <strong>{home?.addressHome || "N/A"}</strong>
            {home?.quarter && <> , Quartier : <strong>{home.quarter}</strong></>}
          </p>
          {home?.rent && (
            <p>Loyer mensuel : <strong>{Number(home.rent).toLocaleString()} FCFA</strong></p>
          )}
          <p>Paiement du mois de : <strong>{formatMonth(rental?.month)}</strong></p>
          <p>Paiement par : <strong>{rental.mode}</strong></p>

          {/* === Signature === */}
         <div className="receipt-xxl-footer">
  <p>Fait à Abidjan le <strong>{formatDate(rental.date_of_payment)}</strong></p>
  <p><strong>Cachet & Signature du Propriétaire</strong></p>

  {admin?.selectedSignature ? (
    <img src={admin.selectedSignature} alt="Signature sélectionnée" />
  ) : admin?.signature ? (
    <img src={admin.signature} alt="Signature par défaut" />
  ) : (
    <p>Signature non disponible</p>
  )}
</div>
        </div>

        {/* === QR Code === */}
        <div className="receipt-xxl-qr">
          <h5>Vérification du reçu</h5>
          <QRCodeCanvas value={`${API}/receipt/${rental._id}`} size={120} />
        </div>

        {/* === Mention légale === */}
        <div className="receipt-legal">
          <p>Ce reçu est généré électroniquement par <strong>{admin?.fullname || "le Propriétaire"}</strong>.</p>
          <p>Toute falsification est passible de sanctions.</p>
        </div>
      </div>

       {/* === BOUTON D'IMPRESSION === */}
      <button className="btn__print" onClick={handlePrint}>
        🖨 Imprimer / Télécharger PDF
      </button>

      {/* === STYLES === */}
      <style>{`
        .receipt-xxl-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; background: linear-gradient(135deg, #f5f7fa, #e6e9f0); min-height: 100vh; }
        .receipt-xxl-card { background: #fff; width: 900px; padding: 2rem 3rem; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); font-family: 'Montserrat', sans-serif; color: #2c3e50; line-height: 1.8; position: relative; margin-bottom: 2rem; }
        .receipt-xxl-card::before { content: ""; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(0deg); width: 400px; height: 400px; background-image: url('/logo4 copie.jpg'); background-size: contain; background-repeat: no-repeat; background-position: center; opacity: 0.1; z-index: 0; pointer-events: none; }
        .receipt-xxl-header { text-align: center; margin-bottom: 2rem; }
        .receipt-xxl-header h1 { font-size: 2.5rem; color: #4b00cc; margin: 0; }
        .receipt-xxl-section { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .receipt-xxl-section div { width: 48%; background: #fafafa; padding: 1rem; border-radius: 10px; border: 1px solid #eee; }
        .receipt-xxl-section h5 { color: #4b00cc; margin-bottom: 0.8rem; font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 0.3rem; }
        .receipt-xxl-description { background: #fdfdfd; padding: 1.5rem; border-radius: 10px; border: 1px solid #ddd; }
        .receipt-xxl-description p { margin: 0.7rem 0; font-size: 1rem; }
        .receipt-xxl-footer { margin-top: 2rem; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
        .receipt-xxl-footer img { margin-top: 1rem; max-width: 200px; }
        .btn__print { padding: 0.7rem 1.5rem; border: none; font-weight: bold; border-radius: 8px; cursor: pointer; background-color: #4b00cc; color: #fff; transition: 0.3s; }
        .btn__print:hover { background-color: #3a0080; }
        .receipt-xxl-qr { margin-top: 1rem; text-align: center; }
        .receipt-xxl-qr h5 { color: #4b00cc; margin-bottom: 0.5rem; }
        .receipt-legal { margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #777; border-top: 1px dashed #ccc; padding-top: 0.5rem; }
        @media print { .btn__print { display: none !important; } .receipt-xxl-card { box-shadow: none; width: 100%; padding: 1rem } }
      `}</style>
    </div>
  );
}