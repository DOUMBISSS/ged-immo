import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import Navbar from "./Navbar";
import Footer from "../Pages/Footer";
import "react-toastify/dist/ReactToastify.css";
import EmailModal from "./Email/EmailModal";
import { useUserContext } from "../contexts/UserContext";
import { QRCodeCanvas } from "qrcode.react";

const API = "http://localhost:4000";

export default function Receipt({ admin }) {
  const { rentId } = useParams();
  const { user } = useUserContext();
  const token = user?.token;

  const [person, setPerson] = useState(null);
  const [rental, setRental] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: person ? `${person.name} ${person.prenom} - Reçu` : "Reçu",
  });

  // 🔹 Récupération complète locataire et son logement
  const fetchPersonData = async (id) => {
    try {
      const res = await fetch(`${API}/detail/locataire/${id}`);
      if (!res.ok) throw new Error("Erreur récupération locataire");

      const text = await res.text();
      const data = text ? JSON.parse(text) : { home_id: [], rentals: [] };
      setPerson(data);
    } catch (e) {
      console.error("Erreur fetchPersonData:", e);
      toast.error("Impossible de récupérer les données du locataire");
    }
  };

  // 🔹 Récupération du paiement + locataire
  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/rents/receipt/${rentId}`);
        if (!res.ok) throw new Error("Impossible de récupérer les données.");
        const data = await res.json();

        setRental(data.rental || data);
        setPerson(data.person || null);

        // ⚡ Récupérer aussi les infos complètes du locataire (loyer inclus)
        if (data.person?._id) {
          await fetchPersonData(data.person._id);
        }

       if (data.rental?.adminId) {
  // S'assurer que c'est une string
  const adminIdStr = typeof data.rental.adminId === "string"
    ? data.rental.adminId
    : data.rental.adminId._id;

  const sigRes = await fetch(`${API}/admin/${adminIdStr}/signature`);
  if (sigRes.ok) {
    const sigData = await sigRes.json();
    setAdminSignature(sigData.signature || null);
  }
}
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error("Erreur lors de la récupération du reçu.");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [rentId]);

  // --- Charger les signatures de l’admin depuis le backend ---
  useEffect(() => {
    const fetchAdminSignatures = async () => {
      if (!user?._id) return;

      try {
        const res = await fetch(`${API}/${user._id}/signatures`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Impossible de récupérer les signatures admin");
        const data = await res.json();
        const sigArray = Array.isArray(data.signatures) ? data.signatures : [];

        setSignatures(sigArray);
        setSelectedSignature(sigArray[0] || null);
      } catch (err) {
        console.error("Erreur fetchAdminSignatures:", err);
        toast.error("Impossible de charger les signatures de l'admin.");
      }
    };

    fetchAdminSignatures();
  }, [user, token]);

  // ✍️ Gestion du canvas pour signature
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };
  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };
  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };
  const handleResetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ✅ Gestion signatures locales avec limite à 3
  // --- Ajouter une signature depuis le canvas ---
  const handleSaveSignature = async () => {
    if (signatures.length >= 3) {
      return toast.error("Vous ne pouvez enregistrer que 3 signatures maximum.");
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append("signature", blob, "signature.png");

    try {
      const res = await fetch(`${API}/${user._id}/upload-signature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de l'envoi de la signature");
      }

      const updated = await res.json();
      setSignatures(updated.signatures);
      setSelectedSignature(updated.signatures[updated.signatures.length - 1]);
      toast.success("Signature ajoutée ✅");
    } catch (err) {
      console.error("Erreur handleSaveSignature:", err);
      toast.error(err.message);
    }
  };

  // --- Supprimer une signature ---
const handleDeleteSignature = async (index) => {
  const sigToDelete = signatures[index];
  if (!sigToDelete) return;

  try {
    const res = await fetch(`${API}/${user._id}/signatures/${index}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Impossible de supprimer la signature");

    const data = await res.json();
    setSignatures(data.signatures);
    if (selectedSignature === sigToDelete) setSelectedSignature(null);
    toast.success("Signature supprimée ✅");
  } catch (err) {
    console.error("Erreur handleDeleteSignature:", err);
    toast.error(err.message);
  }
};

  // --- Drag & drop ---
  const handleDragStart = (e, index) => e.dataTransfer.setData("dragIndex", index);
  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");
    if (dragIndex === null) return;

    const updated = [...signatures];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setSignatures(updated);
  };

  const handleSelectSignature = async (sig) => {
    setSelectedSignature(sig);
    try {
      const res = await fetch(`${API}/admin/${user._id}/select-signature`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signature: sig }),
      });
      if (!res.ok) throw new Error("Impossible de sélectionner la signature");
      const data = await res.json();
      setAdminSignature(data.selectedSignature);
      toast.success("Signature sélectionnée ✅");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <div className="spinner" />
        <p>Chargement du reçu...</p>
      </div>
    );
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!person || !rental) return <p style={{ textAlign: "center" }}>Aucune donnée disponible</p>;

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "N/A");
  const formatMonth = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      : "N/A";

  const home = person.homeId || {};

  const handleSendWhatsapp = async ({
    rentIdParam = rentId,
    personParam = person,
    adminParam = user,
    apiBase = API,
    defaultCountryCode = "+225",
    openInNewTab = true,
  } = {}) => {
    try {
      if (!rentIdParam) return toast.error("ID du reçu manquant.");
      if (!personParam) return toast.error("Données du locataire manquantes.");

      const normalizePhone = (raw, defaultCC = "+225") => {
        if (!raw) return "";
        let digits = (raw + "").trim().replace(/\D/g, "");
        if (digits.startsWith("00")) digits = digits.replace(/^00/, "");
        const defaultDigits = defaultCC.replace(/\D/g, "");
        if (/^0/.test(digits)) digits = defaultDigits + digits.replace(/^0+/, "");
        if (!digits.startsWith("+")) digits = "+" + digits;
        if (digits.length > 15) digits = digits.slice(0, 15);
        return digits;
      };

      const locataireRaw = personParam.tel || personParam.number || personParam.contact || "";
      const locataireDigits = normalizePhone(locataireRaw, defaultCountryCode);
      if (!locataireDigits || locataireDigits.length < 8 || locataireDigits.length > 15) {
        return toast.error("Numéro du locataire invalide / mal formaté.");
      }

      const res = await fetch(`${apiBase}/rents/${rentIdParam}/temp-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Impossible de générer le lien temporaire.");
      const { tempUrl } = await res.json();
      if (!tempUrl) throw new Error("Le serveur n'a pas retourné de tempUrl.");

      const ensureAbsoluteUrl = (u) => {
        try { return new URL(u).href; } catch (e) { return window.location.origin.replace(/\/$/, "") + "/" + u.replace(/^\//, ""); }
      };
      const finalTempUrl = ensureAbsoluteUrl(tempUrl);

      const messageLines = [
        `Bonjour ${personParam.name || personParam.nom || ""} ${personParam.prenom || ""}`.trim(),
        "",
        `Votre reçu de paiement est disponible ici :`,
        finalTempUrl,
        "",
        "Si le lien ne s'ouvre pas, copiez-collez-le dans votre navigateur."
      ];
      const message = messageLines.filter(Boolean).join("\n");
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${locataireDigits.replace(/\+/g, '')}&text=${encodeURIComponent(message)}`;

      const opened = window.open(whatsappUrl, openInNewTab ? "_blank" : "_self", "noopener,noreferrer");
      if (!opened) {
        try {
          await navigator.clipboard.writeText(message);
          toast.success("Impossible d'ouvrir WhatsApp (pop-up bloqué). Le message a été copié dans le presse-papier.");
        } catch (e) {
          console.log("Temp link:", finalTempUrl);
          toast.error("Impossible d'ouvrir WhatsApp automatiquement. Lien affiché dans la console.");
        }
      } else {
        toast.success("WhatsApp ouvert — vérifiez l'onglet et cliquez sur Envoyer.");
      }
    } catch (err) {
      console.error("handleSendWhatsapp error:", err);
      toast.error(err.message || "Erreur envoi du reçu WhatsApp.");
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!person) return toast.error("Données du locataire manquantes.");
      const email = Array.isArray(person) ? person[0]?.email || "" : person.email || "";
      if (!email) return toast.error("Email du locataire manquant.");

      setSendingEmail(true);

      const body = {
        person_email: email,
        rentId: rentId,
        adminName: user?.name || "",
        adminEmail: user?.email || "",
      };

      const res = await fetch(`${API}/rents/${rentId}/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Erreur lors de l'envoi du mail");
      }

      const data = await res.json();
      toast.success(data.message || "Email envoyé avec succès ✅");
    } catch (err) {
      console.error("handleSendEmail error:", err);
      toast.error(err.message || "Erreur lors de l'envoi du mail");
    } finally {
      setSendingEmail(false);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="receipt-xxl-container">
        <div className="receipt-xxl-card" ref={componentRef}>
          <div className="receipt-xxl-header">
            <h3>Reçu paiement N° {rental.receipt_number || rental._id}</h3>
          </div>

          <div className="container__print">
            <button className="btn__print" onClick={handlePrint}>
              <i className="fa-solid fa-print"></i> Imprimer / Télécharger PDF
            </button>
            <button onClick={handleSendEmail} className="btn__email" disabled={sendingEmail}>
              {sendingEmail ? (
                <>
                  <div className="spinner"></div> Envoi en cours...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-envelope"></i> Envoyer le reçu par mail
                </>
              )}
            </button>
            <button className="btn__whatsapp" onClick={handleSendWhatsapp}>
              <i className="fa-brands fa-whatsapp"></i> Envoyer sur WhatsApp
            </button>
          </div>

          <div className="receipt-xxl-section">
            <div>
              <h5>Le propriétaire</h5>
              <p><strong>{user?.fullname || "Néant"}</strong></p>
              <p><strong>{user?.number || "Néant"}</strong></p>
              <p><strong>{user?.email || "Néant"}</strong></p>
              <p><strong>{user?.address || "Néant"}</strong></p>
            </div>
            <div>
              <h5>Le locataire</h5>
              <p><strong>Mme/M. {person.name || "N/A"} {person.prenom || ""}</strong></p>
              <p><strong>{person.tel || person.number || "N/A"}</strong></p>
              <p><strong>{person.email || "N/A"}</strong></p>
              <p><strong>{person.address || "N/A"}</strong></p>
            </div>
          </div>

          <div className="receipt-xxl-description">
            <p>Reçu de <strong>Mme/M. {person?.name || ""} {person?.lastname || ""}</strong></p>
            <p>La somme de <strong>{formatCurrency(rental?.amount || home?.rent)}</strong></p>
            <p>Le <strong>{formatDate(rental?.date_of_payment)}</strong></p>
            <p>
              Pour le loyer du/de <strong>{home?.categorie || "Logement"} {home?.NmbrePieces ? `(${home.NmbrePieces} pièces)` : ""}</strong> situé à : <strong>{home?.addressHome || "N/A"}</strong>
              {home?.quarter && <> , Quartier : <strong>{home.quarter}</strong></>}
            </p>
            {home?.rent && (
              <p>Loyer mensuel : <strong>{Number(home.rent).toLocaleString()} FCFA</strong></p>
            )}
            <p>Paiement du mois de : <strong>{formatMonth(rental?.month)}</strong></p>
            <p>Paiement par <strong>{rental?.mode || "N/A"}</strong></p>

            <div className="receipt-xxl-footer">
              <p>Fait à Abidjan le <strong>{formatDate(rental?.date_of_payment)}</strong></p>
              <p><strong>Cachet & Signature du Propriétaire</strong></p>
              {selectedSignature ? (
                <img src={selectedSignature} alt="Signature Admin" />
              ) : adminSignature ? (
                <img src={adminSignature} alt="Signature Admin" />
              ) : (
                <p>Signature non disponible</p>
              )}
            </div>
          </div>

          {/* ✅ Ajout du QR Code */}
          <div className="receipt-xxl-qr">
            <h5>Vérification du reçu</h5>
            <QRCodeCanvas value={`${API}/receipt/${rental._id}`} size={120} />
          </div>

          <div className="receipt-legal">
            <p>Ce reçu est généré électroniquement par <strong>{user?.fullname || "l'Administrateur"}</strong>.</p>
            <p>Toute falsification est passible de sanctions.</p>
          </div>
        </div>
      </div>

      {/* ✅ Section signatures */}
      {/* ✅ Section signatures */}
<div className="signature-section">
  <h2>Signature</h2>
  <canvas
    ref={canvasRef}
    width={window.innerWidth > 768 ? 600 : 300}
    height={150}
    onMouseDown={startDrawing}
    onMouseMove={draw}
    onMouseUp={stopDrawing}
    onMouseLeave={stopDrawing}
    onTouchStart={startDrawing}
    onTouchMove={draw}
    onTouchEnd={stopDrawing}
    className="signature-canvas"
    style={{ border: "1px solid #ccc", borderRadius: 5, touchAction: "none" }}
  />
  <div style={{ marginTop: 10 }}>
    <button onClick={handleSaveSignature} className="btn-save">
      Enregistrer la signature
    </button>
    <button
      onClick={handleResetCanvas}
      className="btn-save"
      style={{ backgroundColor: "#e74c3c", marginLeft: 10 }}
    >
      Réinitialiser
    </button>
  </div>

  {signatures.length > 0 && (
   <div className="signature-list">
  {signatures.map((sig, index) => (
    <div
      key={index}
      className="signature-item"
      style={{
        display: "inline-block",
        margin: 5,
        cursor: "pointer",
        border: selectedSignature === sig ? "2px solid #4b00cc" : "1px solid #ccc",
        padding: 3,
        borderRadius: 5,
      }}
    >
      <img
        src={sig}
        alt={`Signature ${index + 1}`}
        style={{ width: 100, height: 50, objectFit: "contain" }}
      />
      <button
        onClick={() => handleSelectSignature(sig)}  // ✅ ici on appelle handleSelectSignature
        style={{
          display: "block",
          marginTop: 3,
          width: "100%",
          background: "#4b00cc",
          color: "#fff",
          border: "none",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        Sélectionner
      </button>
      <button
        onClick={() => handleDeleteSignature(index)}
        style={{
          display: "block",
          marginTop: 3,
          width: "100%",
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: 3,
          cursor: "pointer",
        }}>
        Supprimer
      </button>
    </div>
  ))}
</div>
  )}

{/* <select onChange={(e) => handleSelectSignature(e.target.value)}>
  {signatures.map((sig, index) => (
    <option key={index} value={sig}>{`Signature ${index + 1}`}</option>
  ))}
</select> */}
</div>

      <Footer />
      <EmailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rentId={rentId} adminEmail={admin?.email || ""} tenantEmail={person?.email || ""} />

      <style>{`
        .spinner { border: 6px solid #f3f3f3; border-top: 6px solid #4b00cc; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto 1rem auto; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg); } }
        .receipt-xxl-container { display: flex; justify-content: center; padding: 3rem; background: linear-gradient(135deg, #f5f7fa, #e6e9f0); min-height: 100vh; }
        .receipt-xxl-card { background: #fff; width: 950px; padding: 2.5rem 3rem; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); font-family: 'Montserrat', sans-serif; color: #2c3e50; line-height: 1.8;position: relative; }
        .receipt-xxl-card::before { content: ""; position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%) rotate(0deg); width: 400px; height: 400px; background-image: url('/logo4 copie.jpg'); background-size: contain; background-repeat: no-repeat; background-position: center; opacity: 0.1; z-index: 0; pointer-events: none; }
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
          .receipt-xxl-card { box-shadow: none; width: 100%; padding: 1rem }
        }
        .receipt-legal { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #777; border-top: 1px dashed #ccc; padding-top: 0.5rem; }
        .receipt-xxl-qr { margin-top: 1rem; text-align: center; }
        .receipt-xxl-qr h5 { color: #4b00cc; margin-bottom: 0.5rem; }
      `}</style>
    </>
  );
}