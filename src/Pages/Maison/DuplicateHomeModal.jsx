// src/Pages/Maison/DuplicateHomeModal.jsx
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";

/**
 * DuplicateHomeModal.jsx
 * - Option B: show ONLY the fields for home.category (immobilier | bureau | magasin | entrepot)
 * - XXL SaaS styling (self-contained CSS)
 * - Image validation (size + type), previews
 * - Sends FormData to backend: POST /homes/:id/duplicate with Authorization Bearer token
 *
 * Usage:
 * <DuplicateHomeModal home={home} projectId={projectId} onClose={...} onDuplicated={newHome => {...}} />
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function DuplicateHomeModal({ home = {}, projectId, onClose, onDuplicated }) {
  const { user } = useUserContext();

  // Fields per category (only these will be rendered)
  const fieldsByCategory = useMemo(() => ({
    immobilier: [
      { name: "nameHome", label: "Nom du logement", type: "text", required: true },
      { name: "reference", label: "Référence", type: "text" },
      { name: "sousCategorie", label: "Type de logement", type: "select", options: ["Appartement","Maison","Studio","Villa Basse","Villa Duplex"], required:true },
      { name: "NmbrePieces", label: "Nombre de pièces", type: "select", optionsMapping:{ Appartement:["2","3","4"], Maison:["3","4","5"], Studio:["1"], "Villa Basse":["3","4"], "Villa Duplex":["4","5"] } },
      { name: "rent", label: "Loyer (FCFA)", type: "text" },
      { name: "guarantee", label: "Caution", type: "text" },
      { name: "charges", label: "Charges", type: "text" },
      { name: "works", label: "Travaux (séparés par virgules)", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "city", label: "Ville", type: "text" },
      { name: "quarter", label: "Quartier", type: "text" },
      { name: "addressHome", label: "Adresse", type: "text" },
      { name: "codePostal", label: "Code postal", type: "text" },
      { name: "observations", label: "Observations", type: "textarea" },
      { name: "state", label: "Disponibilité", type: "select", options: ["Disponible","Occupé"] },
      { name: "nombreCles", label: "Nombre de clés", type: "number" },
      { name: "terrasse", label: "Terrasse", type: "checkbox" },
      { name: "jardin", label: "Jardin", type: "checkbox" },
      { name: "balcon", label: "Balcon", type: "checkbox" },
      { name: "piscine", label: "Piscine", type: "checkbox" },
      { name: "garage", label: "Garage", type: "checkbox" },
      { name: "serviceSecurite", label: "Service Sécurité", type: "checkbox" },
      { name: "etage", label: "Étage", type: "text" },
      { name: "ascenseur", label: "Ascenseur", type: "checkbox" },
    ],
    bureau: [
  { name: "nameHome", label: "Nom du bureau", type: "text", required: true },
  { name: "reference", label: "Référence", type: "text" },
  { name: "rent", label: "Loyer (FCFA)", type: "text" },
  { name: "guarantee", label: "Caution", type: "text" },
  { name: "charges", label: "Charges", type: "text" },

  { name: "works", label: "Travaux (séparés par virgules)", type: "textarea" },
  { name: "description", label: "Description", type: "textarea" },

  { name: "city", label: "Ville", type: "text" },
  { name: "quarter", label: "Quartier", type: "text" },
  { name: "addressHome", label: "Adresse", type: "text" },
  { name: "codePostal", label: "Code postal", type: "text" },

  { name: "observations", label: "Observations", type: "textarea" },
  { name: "state", label: "Disponibilité", type: "select", options: ["Disponible","Occupé"] },

  // 🔹 Champs spécifiques bureaux
  { name: "NmbreBureaux", label: "Nombre de bureaux", type: "number" },
  { name: "surfaceBureau", label: "Surface du bureau (m²)", type: "number" },

  { name: "salleReunion", label: "Salle de réunion", type: "checkbox" },
  { name: "climatisation", label: "Climatisation", type: "checkbox" },
  { name: "fibreOptique", label: "Fibre optique", type: "checkbox" },
  { name: "accesInternet", label: "Accès Internet", type: "checkbox" },

  { name: "parking", label: "Parking", type: "checkbox" },
  { name: "ascenseur", label: "Ascenseur", type: "checkbox" },
  { name: "mezanine", label: "Mezzanine", type: "checkbox" },

  { name: "serviceSecurite", label: "Service Sécurité", type: "checkbox" },

  { name: "salleBain", label: "Salles de bain", type: "number" },
  { name: "nombreCles", label: "Nombre de clés", type: "number" },
],
    magasin: [
      { name: "nameHome", label: "Nom du magasin", type: "text", required: true },
      { name: "reference", label: "Référence", type: "text" },
      { name: "rent", label: "Loyer (FCFA)", type: "text" },
      { name: "guarantee", label: "Caution", type: "text" },
      { name: "charges", label: "Charges", type: "text" },
      { name: "works", label: "Travaux (séparés par virgules)", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "city", label: "Ville", type: "text" },
      { name: "quarter", label: "Quartier", type: "text" },
      { name: "addressHome", label: "Adresse", type: "text" },
      { name: "codePostal", label: "Code postal", type: "text" },
      { name: "state", label: "Disponibilité", type: "select", options: ["Disponible","Occupé"] },
      { name: "NmbrePieces", label: "Nombre de pièces", type: "text" },
      { name: "surfaceMagasin", label: "Surface magasin (m²)", type: "text" },
      { name: "salleBain", label: "Salle de bain", type: "number" },
      { name: "mezanine", label: "Mezanine", type: "checkbox" },
      { name: "vitrine", label: "Vitrine", type: "checkbox" },
      { name: "climatisation", label: "Climatisation", type: "checkbox" },
      { name: "parking", label: "Parking", type: "checkbox" },
      { name: "ascenseur", label: "Ascenseur", type: "checkbox" },
    ],
    entrepot: [
      { name: "nameHome", label: "Nom de l'entrepôt", type: "text", required: true },
      { name: "reference", label: "Référence", type: "text" },
      { name: "rent", label: "Loyer (FCFA)", type: "text" },
      { name: "guarantee", label: "Caution", type: "text" },
      { name: "charges", label: "Charges", type: "text" },
      { name: "works", label: "Travaux (séparés par virgules)", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "city", label: "Ville", type: "text" },
      { name: "quarter", label: "Quartier", type: "text" },
      { name: "addressHome", label: "Adresse", type: "text" },
      { name: "codePostal", label: "Code postal", type: "text" },
      { name: "state", label: "Disponibilité", type: "select", options: ["Disponible","Occupé"] },
      { name: "NmbrePieces", label: "Nombre de pièces", type: "text" },
      { name: "surfaceEntrepot", label: "Surface entrepôt (m²)", type: "text" },
      { name: "hauteurSousPlafond", label: "Hauteur sous plafond", type: "text" },
      { name: "capaciteStockage", label: "Capacité de stockage", type: "text" },
      { name: "quaiChargement", label: "Quai de chargement", type: "checkbox" },
      { name: "securite", label: "Sécurité", type: "checkbox" },
      { name: "accesCamion", label: "Accès camion", type: "checkbox" },
      { name: "ventilation", label: "Ventilation", type: "checkbox" },
    ],
  }), []);



  const category =
  (home.categorie || home.category || "immobilier")
    .toString()
    .trim()
    .toLowerCase();
  console.log("CATEGORY VALUE =", home.category);
  const categoryFields = fieldsByCategory[category] || fieldsByCategory.immobilier;

  // Initialize form data using only the current category's fields
  const buildInitial = () => {
    const init = {};
    categoryFields.forEach(f => {
      if (f.type === "checkbox") init[f.name] = !!home[f.name];
      else if (Array.isArray(home[f.name])) init[f.name] = home[f.name];
      else init[f.name] = home[f.name] ?? "";
    });
    return init;
  };

  const [formData, setFormData] = useState(buildInitial());
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(home.img ? `${getBaseUrl(home.img)}` : null);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState((home.images || []).map(i => getBaseUrl(i)));
  const [loading, setLoading] = useState(false);

  // Helpers
  function getBaseUrl(path) {
    // If path already absolute, return it; otherwise assume localhost:4000
    if (!path) return null;
    return path.startsWith("http") ? path : `http://localhost:4000/${path}`;
  }

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    // For number inputs, keep value as-is (backend will handle parse)
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleWorksChangeLocal = (e) => {
    const val = e.target.value;
    // keep as array internally
    setFormData(prev => ({ ...prev, works: val.split(",").map(s => s.trim()).filter(Boolean) }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format d'image non supporté.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Taille d'image trop grande (max 5MB).");
      return;
    }
    setImg(file);
    const reader = new FileReader();
    reader.onload = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const rejected = files.filter(f => !ALLOWED_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE);
    if (rejected.length) {
      toast.error("Certaines images sont invalides (taille/type). Elles ont été ignorées.");
    }
    const accepted = files.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE);
    setImages(accepted);
    setImagesPreview(accepted.map(f => URL.createObjectURL(f)));
  };

  const getPiecesOptions = () => {
    const field = categoryFields.find(f => f.name === "NmbrePieces");
    return field?.optionsMapping?.[formData.sousCategorie] || [];
  };

  const validateRequired = () => {
    for (const f of categoryFields) {
      if (f.required) {
        const v = formData[f.name];
        if (v === "" || v == null || (Array.isArray(v) && v.length === 0)) {
          return `${f.label} est requis.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      toast.error("Session expirée, reconnectez-vous.");
      return;
    }
    const missing = validateRequired();
    if (missing) {
      toast.error(missing);
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("projectId", projectId);
      // append only the fields for current category
      for (const f of categoryFields) {
        const val = formData[f.name];
        if (f.type === "checkbox") {
          form.append(f.name, !!val ? "true" : "false");
        } else if (f.type === "textarea" && f.name === "works") {
          // send works as comma separated
          form.append(f.name, Array.isArray(val) ? val.join(",") : (val || ""));
        } else {
          form.append(f.name, val === undefined || val === null ? "" : String(val));
        }
      }

      if (img) form.append("img", img);
      images.forEach(file => form.append("images", file));

      const res = await fetch(`http://localhost:4000/homes/${home._id}/duplicate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la duplication");
      }
      toast.success("✅ Bien dupliqué !");
      onDuplicated && onDuplicated(data.home);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderField = (f) => {
    const value = formData[f.name] ?? "";
    if (f.type === "text" || f.type === "number") {
      return (
        <div className="field" key={f.name}>
          <label className="label">{f.label}{f.required && <span className="required">*</span>}</label>
          <input
            className="input"
            type={f.type}
            name={f.name}
            value={value}
            onChange={handleChange}
            placeholder={f.label}
            required={!!f.required}
          />
        </div>
      );
    }

    if (f.type === "select") {
      const options = f.name === "NmbrePieces" ? getPiecesOptions() : f.options || [];
      return (
        <div className="field" key={f.name}>
          <label className="label">{f.label}{f.required && <span className="required">*</span>}</label>
          <select
            className="select"
            name={f.name}
            value={value}
            onChange={handleChange}
            required={!!f.required}
          >
            <option value="">{`Sélectionner ${f.label}`}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }

    if (f.type === "checkbox") {
      return (
        <label className="checkbox-pill" key={f.name}>
          <input
            type="checkbox"
            name={f.name}
            checked={!!value}
            onChange={handleChange}
          />
          <span className="checkbox-label">{f.label}</span>
        </label>
      );
    }

    if (f.type === "textarea") {
      return (
        <div className="field" key={f.name}>
          <label className="label">{f.label}</label>
          <textarea
            className="textarea"
            name={f.name}
            value={Array.isArray(value) ? value.join(", ") : value}
            onChange={f.name === "works" ? handleWorksChangeLocal : handleChange}
            placeholder={f.label}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button aria-label="close" className="modal-close" onClick={onClose}>&times;</button>
        <header className="modal-header">
          <div>
            <h2 className="title">Dupliquer — <span className="category-pill">{category.toUpperCase()}</span></h2>
            <p className="subtitle">Les champs affichés correspondent uniquement au type <strong>{category}</strong>.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="form-body" noValidate>
          <div className="grid">
            {categoryFields.map(renderField)}
            {/* Images */}
            <div className="field full">
              <label className="label">Image principale</label>
              <input className="file" type="file" accept={ALLOWED_TYPES.join(",")} onChange={handleMainImageChange} />
              {imgPreview && <img className="preview" src={imgPreview} alt="preview" />}
            </div>

            <div className="field full">
              <label className="label">Images secondaires</label>
              <input className="file" type="file" accept={ALLOWED_TYPES.join(",")} multiple onChange={handleFilesChange} />
              <div className="multi-preview">
                {imagesPreview.map((src, i) => <img key={i} className="preview" src={src} alt={`preview-${i}`} />)}
              </div>
            </div>

            <div className="actions full">
              <button type="button" className="btn ghost" onClick={onClose} disabled={loading}>Annuler</button>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "⏳ Duplication..." : "✅ Confirmer la duplication"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ====== Styles (XXL SaaS) ====== */}
      <style jsx>{`
        :root{
          --bg: #0f172a;
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #5b21b6;
          --accent-2: #7c3aed;
          --success: #10b981;
          --danger: #ef4444;
        }
        .modal-overlay{
  position: fixed;
  inset: 0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:32px;
  background: linear-gradient(180deg, rgba(2,6,23,0.6), rgba(2,6,23,0.8));
  z-index: 9999;
  backdrop-filter: blur(4px);
  overflow-y: auto;               /* <-- IMPORTANT */
}
       .modal-content{
  width: 100%;
  max-width: 980px;
  background: var(--card);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(2,6,23,0.5);

  max-height: 90vh;               /* <-- LIMITE LA HAUTEUR */
  overflow-y: auto;               /* <-- ACTIVE LE SCROLL */

  padding: 28px;
  border: 1px solid rgba(124,58,237,0.08);
}
        .modal-close{
          position:absolute;
          right:28px;
          top:24px;
          background:transparent;
          border:none;
          font-size:26px;
          color:var(--muted);
          cursor:pointer;
        }
        .modal-header{
          display:flex;
          gap:20px;
          align-items:flex-start;
          margin-bottom:18px;
        }
        .title{
          font-size:20px;
          margin:0;
          color:#0b1220;
        }
        .subtitle{
          margin:6px 0 0 0;
          color:var(--muted);
          font-size:13px;
        }
        .category-pill{
          display:inline-block;
          background: linear-gradient(90deg,var(--accent),var(--accent-2));
          color:white;
          padding:6px 10px;
          border-radius:999px;
          font-weight:700;
          font-size:12px;
          margin-left:10px;
        }

        .form-body{ width:100%; }
        .grid{
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap:20px;
          align-items:start;
        }
        .field{
          display:flex;
          flex-direction:column;
          gap:8px;
        }
        .field.full{ grid-column: 1 / -1; }
        .label{
          font-weight:600;
          color:#0b1220;
          font-size:14px;
        }
        .required{ color: var(--danger); margin-left:6px; font-weight:700; font-size:12px; }

        .input, .select, .textarea, .file{
          width:100%;
          padding:14px 16px;
          border-radius:12px;
          border:1px solid rgba(15,23,42,0.06);
          background: #fbfbff;
          font-size:15px;
          outline:none;
          transition: box-shadow .18s, transform .12s;
          box-shadow: 0 6px 20px rgba(12,16,42,0.03);
        }
        .input:focus, .select:focus, .textarea:focus {
          box-shadow: 0 8px 30px rgba(124,58,237,0.12);
          border-color: rgba(124,58,237,0.18);
        }
        .select{ appearance:none; }

        .textarea{
          min-height:110px;
          resize:vertical;
          padding:14px;
        }

        /* Checkbox pills (big SaaS style) */
        .checkbox-pill{
          display:inline-flex;
          align-items:center;
          gap:12px;
          padding:12px 14px;
          border-radius:12px;
          border:1px solid rgba(15,23,42,0.06);
          cursor:pointer;
          user-select:none;
          background: #fff;
          box-shadow: 0 6px 18px rgba(12,16,42,0.03);
          transition: all .14s ease;
        }
        .checkbox-pill input{ width:18px;height:18px; }
        .checkbox-pill .checkbox-label{ font-weight:600; color:#0b1220; }
        .checkbox-pill:hover{ transform: translateY(-3px); box-shadow: 0 12px 40px rgba(124,58,237,0.06); }

        /* Previews */
        .preview{
          margin-top:12px;
          width:120px;
          height:90px;
          object-fit:cover;
          border-radius:10px;
          border:1px solid rgba(15,23,42,0.04);
          box-shadow: 0 6px 20px rgba(12,16,42,0.04);
        }
        .multi-preview{ display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }

        /* Actions */
        .actions{
          display:flex;
          justify-content:flex-end;
          gap:12px;
          margin-top:10px;
        }
        .btn{
          padding:12px 18px;
          border-radius:12px;
          font-weight:700;
          border:none;
          cursor:pointer;
          min-width:140px;
          font-size:15px;
        }
        .btn.ghost{
          background:transparent;
          border:1px solid rgba(15,23,42,0.06);
          color:#0b1220;
        }
        .btn.primary{
          background: linear-gradient(90deg,var(--accent),var(--accent-2));
          color:white;
          box-shadow: 0 12px 40px rgba(124,58,237,0.18);
        }
        .btn:disabled{ opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }

        /* Responsive */
        @media (max-width: 920px){
          .grid{ grid-template-columns: 1fr; }
          .modal-content{ padding:20px; }
          .modal-close{ right:18px; top:18px; }
        }
      `}</style>
    </div>
  );
}