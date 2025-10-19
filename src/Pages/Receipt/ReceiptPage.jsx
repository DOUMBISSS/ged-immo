import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";

const API = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

export default function ReceiptPage() {
  const { token } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  // 📌 Génération du PDF
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: receipt
      ? `Reçu_${receipt.tenantName || "locataire"}_${receipt.homeName || ""}`
      : "Reçu",
  });

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`${API}/api/receipt/${token}`);
        if (!res.ok) throw new Error("Impossible de récupérer le reçu");
        const data = await res.json();
        setReceipt(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchReceipt();
  }, [token]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <div className="spinner" />
        <p>Chargement du reçu...</p>
      </div>
    );

  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!receipt) return <p style={{ textAlign: "center" }}>Lien invalide ou expiré ❌</p>;

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "N/A";
  const formatMonth = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })
      : "N/A";

  return (
    <>
    <div className="receipt-xxl-container">
      <div className="receipt-xxl-card" ref={componentRef}>
        <div className="receipt-xxl-header">
          <h3>Reçu paiement N° {receipt.receipt_number || "—"}</h3>
        </div>

        <div className="receipt-xxl-section">
          <div>
            <h5>Le propriétaire</h5>
            <p><strong>{receipt.adminName || "N/A"}</strong></p>
            <p><strong>{receipt.adminPhone || "N/A"}</strong></p>
            <p><strong>{receipt.adminEmail || "N/A"}</strong></p>
            <p><strong>{receipt.adminAddress || "N/A"}</strong></p>
          </div>
          <div>
            <h5>Le locataire</h5>
            <p>
              <strong>
                Mme/M. {receipt.tenantName || "N/A"}
              </strong>
            </p>
            <p><strong>{receipt.tenantPhone || "N/A"}</strong></p>
            <p><strong>{receipt.tenantEmail || "N/A"}</strong></p>
            <p>
              <strong>
                {receipt.tenantAddress || "N/A"}
              </strong>
            </p>
          </div>
        </div>

        <div className="receipt-xxl-description">
          <p>
            Reçu de <strong>{receipt.tenantName || "N/A"}</strong>
          </p>
 La somme de <strong>{formatCurrency(receipt?.amount)}</strong>    <p>
            Le <strong>{formatDate(receipt.paymentDate)}</strong>
          </p>
<p>
  Pour le loyer du/de{" "}
  <strong>
    {receipt.homeCategorie || "Logement"}{" "}
    - <strong>{receipt.homeReference}</strong> - {receipt.homeRooms ? `(${receipt.homeRooms} pièces)` : ""}
  </strong>{" "}
  situé à : <strong>{receipt.homeAddress || "N/A"}</strong>
  {receipt.homeQuarter && (
    <>
      {" "}, Quartier : <strong>{receipt.homeQuarter}</strong>
    </>
  )}
  {/* {receipt.homeReference && (
    <>
      {" "}— Référence : <strong>{receipt.homeReference}</strong>
    </>
  )} */}
  {/* {receipt.homeCategorie && (
    <>
      {" "}— Logement : <strong>{receipt.homeName}</strong>
    </>
  )} */}
</p>
          <p>
            Paiement du mois de : <strong>{formatMonth(receipt.paymentDate)}</strong>
          </p>
          <p>
            Paiement par <strong>{receipt.mode || "N/A"}</strong>
          </p>

               <div className="receipt-xxl-footer">
          <p>
            Fait le <strong>{formatDate(receipt.paymentDate)}</strong>
          </p>
          <p>
            <strong>Cachet & Signature du Propriétaire</strong>
          </p>
            {receipt.adminSelectedSignature ? (
    <img
      src={receipt.adminSelectedSignature}
      alt="Signature Admin"
      style={{ maxWidth: '200px', marginTop: '1rem' }}
    />
  ) : (
    <p>Signature non disponible</p>
  )}
        </div>
        </div>

     
          <div className="receipt-xxl-qr">
          <h5>Vérification du reçu</h5>
          <QRCodeCanvas value={`${API}/receipt/${receipt._id || token}`} size={120} />
        </div>

            <div className="receipt-legal">
            <p>Ce reçu est généré électroniquement par <strong>{receipt.adminName  || "l'Administrateur"}</strong>.</p>
            <p>Toute falsification est passible de sanctions.</p>
          </div>
      </div>
      

      {/* ✅ Bouton PDF téléchargeable */}
      
   <style>{`
        .spinner { border: 6px solid #f3f3f3; border-top: 6px solid #4b00cc; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto 1rem auto; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg); } }
        .receipt-xxl-container { display: flex; justify-content: center; padding: 3rem; background: linear-gradient(135deg, #f5f7fa, #e6e9f0); min-height: 100vh; }
        .receipt-xxl-card { background: #fff; width: 950px; padding: 2.5rem 3rem; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); font-family: 'Montserrat', sans-serif; color: #2c3e50; line-height: 1.8;position: relative; }
      .receipt-xxl-card::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
  width: 400px;  /* ajustez selon votre logo */
  height: 400px;
  background-image: url('/logo4 copie.jpg'); /* chemin vers votre logo */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.1; /* effet filigrane */
  z-index: 0;
  pointer-events: none; /* ne gêne pas les clics */
}
        .receipt-xxl-header { text-align: center; margin-bottom: 2rem; }
        .receipt-xxl-header h1 { font-size: 2.5rem; color: #4b00cc; margin: 0; }
        .receipt-xxl-section { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .receipt-xxl-section div { width: 48%; background: #fafafa; padding: 1rem; border-radius: 10px; border: 1px solid #eee; }
        .receipt-xxl-section h5 { color: #4b00cc; margin-bottom: 0.8rem; font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 0.3rem; }
        .receipt-xxl-description { background: #fdfdfd; padding: 1.5rem; border-radius: 10px; border: 1px solid #ddd; }
        .receipt-xxl-description p { margin: 0.7rem 0; font-size: 1rem; }
        .receipt-xxl-description strong { color: #000; }
        .receipt-xxl-footer { margin-top: 3rem; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
        .receipt-xxl-footer img { margin-top: 1rem; max-width: 200px; }
        .btn__print, .btn__email, .btn__whatsapp { padding: 0.7rem 1.5rem; border: none; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 0 0.5rem 2rem 0; transition: 0.3s; }
        .btn__print { background-color: #4b00cc; color: #fff; }
        .btn__print:hover { background-color: #3a0080; }
        .btn__email { background-color: #007bff; color: #fff; }
        .btn__email:hover { background-color: #0056b3; }
        .btn__whatsapp { background-color: #25D366; color: #fff; }
        .btn__whatsapp:hover { background-color: #128C7E; }
        .container__print { display: flex; justify-content: center; margin-bottom: 1rem; }
        .signature-section { margin: 2rem 0; text-align: center; }
        .btn-save { margin-top: 1rem; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; background-color: #4b00cc; color: #fff; font-weight: bold; }
        .btn-save:hover { background-color: #3a0080; }
        .signature-list { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 1rem; }
        @media print {
          .btn__print, .btn__email, .btn__whatsapp, nav, footer, .breadcrumb, .signature-section { display: none !important; }
          .receipt-xxl-card { box-shadow: none; width: 100%; padding: 1rem; }
        }
          .receipt-legal {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  border-top: 1px dashed #ccc;
  padding-top: 0.5rem;
}
  .receipt-xxl-qr {
          margin-top: 2rem;
          text-align: center;
        }
        .receipt-xxl-qr h5 {
          color: #4b00cc;
          margin-bottom: 0.5rem;
        }
          
      `}</style>
    </div>
    <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={handlePrint} className="btn__print">
          <i className="fa-solid fa-print"></i> Télécharger le reçu (PDF)
        </button>
      </div>
</>
  );
}