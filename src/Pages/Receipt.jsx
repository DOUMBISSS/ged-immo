import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Navbar from "./Navbar";
import Footer from "../Pages/Footer";
import { toast, Toaster } from "react-hot-toast";
import EmailModal from "./Email/EmailModal";
import { useUserContext } from "../contexts/UserContext";
import { QRCodeCanvas } from "qrcode.react";
import printJS from 'print-js';

const API = "http://localhost:4000";

export default function Receipt({ admin }) {
  
  const formatCurrency = (amount) => Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "N/A");
  const formatMonth = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      : "N/A";
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
  const [adminLogo, setAdminLogo] = useState(null);
  

  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const componentRef = useRef(null);


  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ✅ nouveau format
    documentTitle: person
      ? `Reçu - ${person.name} ${person.lastname} du (${formatMonth(rental?.month)})`
      : "Reçu",

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
      setAdminLogo(data?.rental?.adminId?.companyInfo?.logo || null);

      // ⚡ Récupérer aussi les infos complètes du locataire (loyer inclus)
      if (data.person?._id) {
        await fetchPersonData(data.person._id);
      }

      // 🔹 Ancienne récupération de signature admin (désactivée)
      // if (data.rental?.adminId) {
      //   const adminIdStr = typeof data.rental.adminId === "string"
      //     ? data.rental.adminId
      //     : data.rental.adminId._id;
      //
      //   const sigRes = await fetch(`${API}/admin/${adminIdStr}/signatures`);
      //   if (sigRes.ok) {
      //     const sigData = await sigRes.json();
      //     setAdminSignature(sigData.signature || null);
      //   }
      // }

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

    // 🔹 Fonction de normalisation du numéro AVEC LOGS
    const normalizePhone = (raw, defaultCC = "+225") => {
      if (!raw) return "";

      console.group("📞 Normalisation du numéro WhatsApp");
      console.log("Numéro brut reçu :", raw);

      let phone = raw.trim().replace(/\s+/g, "").replace(/[^\d+]/g, "");
      const variants = new Set();

      // ✅ 1. Format brut s’il commence par +
      if (phone.startsWith("+")) {
        variants.add(phone);
        variants.add(phone.replace(/^(\+\d{1,3})0+/, "$1")); // sans 0 après indicatif
      }

      // ✅ 2. Format 00 → +
      if (phone.startsWith("00")) {
        const v = "+" + phone.slice(2);
        variants.add(v);
        variants.add(v.replace(/^(\+\d{1,3})0+/, "$1"));
      }

      // ✅ 3. Format commençant par 0 → ajouter indicatif
      if (phone.startsWith("0")) {
        const cc = defaultCC.replace(/\D/g, "");
        variants.add(`+${cc}${phone.replace(/^0+/, "")}`);
      }

      // ✅ 4. Format sans indicatif
      if (!phone.startsWith("+") && !phone.startsWith("00")) {
        const cc = defaultCC.replace(/\D/g, "");
        variants.add(`+${cc}${phone}`);
      }

      console.log("🔍 Variantes générées :", Array.from(variants));

      // On choisit la plus longue (souvent la bonne)
      const final = Array.from(variants).sort((a, b) => b.length - a.length)[0];
      console.log("✅ Variante choisie :", final);
      console.groupEnd();

      return final;
    };

    // 🔹 Extraction du numéro du locataire
    const locataireRaw =
      personParam.tel || personParam.number || personParam.contact || "";

    const locataireDigits = normalizePhone(locataireRaw, defaultCountryCode);

    console.log("✅ Numéro final normalisé :", locataireDigits);

    // 🔹 Validation du format final
    if (!/^\+\d{8,15}$/.test(locataireDigits)) {
      console.warn("❌ Numéro rejeté (format invalide WhatsApp) :", locataireDigits);
      return toast.error("Numéro du locataire invalide pour WhatsApp.");
    }

    // 🔹 Génération du lien temporaire
    const res = await fetch(`${apiBase}/rents/${rentIdParam}/temp-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Impossible de générer le lien temporaire.");
    const { tempUrl } = await res.json();
    if (!tempUrl) throw new Error("Le serveur n'a pas retourné de tempUrl.");

    // 🔹 Correction de l'URL absolue
    const ensureAbsoluteUrl = (u) => {
      try {
        return new URL(u).href;
      } catch {
        return (
          window.location.origin.replace(/\/$/, "") +
          "/" +
          u.replace(/^\//, "")
        );
      }
    };

    const finalTempUrl = ensureAbsoluteUrl(tempUrl);

    // 🔹 Message WhatsApp
   const message = [
  `Bonjour ${personParam.name || personParam.nom || ""} ${personParam.prenom || ""}`.trim(),
  "",
  "Votre reçu de paiement est disponible ici :",
  "",
  finalTempUrl, // bien séparé sur une ligne seule
  "",
  "Si le lien ne s'ouvre pas, copiez-collez-le dans votre navigateur."
].filter(Boolean).join("\n");

    // ✅ Correction ici : on n’encode pas entièrement l’URL pour la garder cliquable
    const encodedMessage = message
      .split(finalTempUrl)
      .map((part) => encodeURIComponent(part))
      .join(finalTempUrl);

    // 🔹 Détection mobile / desktop
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const baseUrl = isMobile
      ? "https://api.whatsapp.com/send"
      : "https://web.whatsapp.com/send";

    const whatsappUrl = `${baseUrl}?phone=${locataireDigits.replace(
      /\+/g,
      ""
    )}&text=${encodedMessage}`;

    console.log("🌍 URL WhatsApp générée :", whatsappUrl);

    // 🔹 Ouverture de WhatsApp
    const opened = window.open(
      whatsappUrl,
      openInNewTab ? "_blank" : "_self",
      "noopener,noreferrer"
    );

    if (!opened) {
      await navigator.clipboard.writeText(message);
      toast.success(
        "WhatsApp n'a pas pu s'ouvrir (pop-up bloquée). Le message a été copié."
      );
    } else {
      toast.success("WhatsApp ouvert — cliquez sur Envoyer.");
    }
  } catch (err) {
    console.error("❌ handleSendWhatsapp error:", err);
    toast.error(err.message || "Erreur lors de l'envoi via WhatsApp.");
  }
};

const handleSendEmail = async () => {
  try {
    if (!person) return toast.error("Données du locataire manquantes.");
    const email = person.email || "";
    if (!email) return toast.error("Email du locataire manquant.");

    setSendingEmail(true);

    const res = await fetch(`${API}/rents/${rentId}/send-receipt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        person_email: email,
        rentId,
        adminName: user?.name || "",
        adminEmail: user?.email || "",
      }),
    });

    // 🛑 Gestion permission refusée (403)
    if (res.status === 403) {
      const data = await res.json(); // ← OK car on ne fera PAS res.json() une 2e fois
      toast.error(data?.message || "❌ Permission refusée.");
      return;
    }

    // 🛑 Gestion non authentifié (401)
    if (res.status === 401) {
      const data = await res.json();
      toast.error(data?.message || "❌ Vous devez vous reconnecter.");
      return;
    }

    // 🛑 Erreurs générales
    if (!res.ok) {
      const errData = await res.json();
      toast.error(errData?.message || "Erreur lors de l'envoi du mail");
      return;
    }

    // 🟢 Succès
    const data = await res.json();
    toast.success(data.message || "Email envoyé avec succès !");
  } catch (err) {
    console.error("handleSendEmail error:", err);
    toast.error("Erreur lors de l'envoi du mail");
  } finally {
    setSendingEmail(false);
  }
};
  

// Déterminer le watermark (logo admin ou logo par défaut)
const watermarkLogo =
  adminLogo && adminLogo.startsWith("http")
    ? adminLogo
    : adminLogo
    ? `${API}/${adminLogo}`
    : "/logo4 copie.jpg";

  return (
    <>
      <Navbar />
      <div className="receipt-xxl-container">
        <div className="receipt-xxl-card" ref={componentRef}>
{/* 🔹 Logos en-tête : Admin + GED IMMO */}

         

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

          <div className="receipt-header-logos">
  
  {/* Logo Admin */}
  {/* {adminLogo ? (
    <img
  src={adminLogo?.startsWith("http") ? adminLogo : `${API}/${adminLogo}`}
  alt="Logo Admin"
  className="admin-logo-header"
/>
  ) : (
    <div className="admin-logo-placeholder">Logo admin indisponible</div>
  )} */}

  {/* Logo plateforme GED IMMO */}
  <img
    src="/logo4 copie.jpg"
    alt="Logo GED IMMO"
    className="platform-logo-header"
  />
</div>

           <div className="receipt-xxl-header">
            <h3>Reçu paiement N° {rental.receipt_number || rental._id}</h3>
          </div>

          <div className="receipt-xxl-section">
  <div>
    <h5>Le propriétaire</h5>
    <p><strong>{rental?.adminId?.fullname || "Néant"}</strong></p>
    <p><strong>{rental?.adminId?.number || "Néant"}</strong></p>
    <p><strong>{rental?.adminId?.email || "Néant"}</strong></p>
    <p><strong>{rental?.adminId?.address || "Néant"}</strong></p>
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
            <h6>Vérification du reçu</h6>
            <QRCodeCanvas value={`${API}/receipt/${rental._id}`} size={50} />
          </div>

          <div className="receipt-legal">
            <p>Ce reçu est généré électroniquement par <strong>{rental?.adminId?.fullname || "l'Administrateur"}</strong> via <strong>GED IMMO</strong>.</p>
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
        .receipt-xxl-card::before {
  content: "";
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
  width: 400px;
  height: 400px;
  background-image: url('${watermarkLogo}');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.07;
  z-index: 0;
  pointer-events: none;
}
        .receipt-xxl-header { text-align: center; margin-bottom: 1rem;font-weight: bold; }
        .receipt-xxl-header h1 { font-size: 2.5rem; color: #4b00cc; margin: 0; }
        .receipt-xxl-section { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .receipt-xxl-section div { width: 48%; background: #fafafa; padding: 1rem; border-radius: 10px; border: 1px solid #eee; }
        .receipt-xxl-section h5 { color: #4b00cc; margin-bottom: 0.8rem; font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 0.3rem; }
        .receipt-xxl-description { background: #fdfdfd; padding: 1.5rem; border-radius: 10px; border: 1px solid #ddd; }
        .receipt-xxl-description p { margin: 0.7rem 0; font-size: 1rem; }
        .receipt-xxl-description strong { color: #000; }
        .receipt-xxl-footer { margin-top: 2rem; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
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
        /* ---- LOGOS HEADER ---- */
.receipt-header-logos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0,7rem;
  padding: 0 1rem;
}

.admin-logo-header,
.platform-logo-header {
  height: 70px;
  width: auto;
  object-fit: contain;
}

.admin-logo-placeholder {
  height: 70px;
  width: 140px;
  font-size: 0.9rem;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #aaa;
  border-radius: 8px;
}

/* Impression */
@media print {
  .admin-logo-header,
  .platform-logo-header {
    height: 60px !important;
  }
}
      `}</style>
    </>
  );
}