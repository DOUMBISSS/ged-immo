import React, { useState } from "react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function UpdateHomeModal({ home, onClose, onUpdated, token }) {
  const [formData, setFormData] = useState({
    reference: home.reference || "",
    nameHome: home.nameHome || "",
    nameHomeType: home.nameHomeType || "",
    description: home.description || "",
    addressHome: home.addressHome || "",
    city: home.city || "",
    quarter: home.quarter || "",
    rent: home.rent || "",
    guarantee: home.guarantee || "",
    observations: home.observations || "",
    state: home.state || "Disponible",
    NmbrePieces: home.NmbrePieces || "",
    surfaceBureau: home.surfaceBureau || "",
    NmbreBureaux: home.NmbreBureaux || "",
    surfaceEntrepot: home.surfaceEntrepot || "",
    capaciteStockage: home.capaciteStockage || "",
    surfaceMagasin: home.surfaceMagasin || "",
    salleBain: home.salleBain || 1,
    // Booleans
    climatisation: !!home.climatisation,
    salleReunion: !!home.salleReunion,
    parking: !!home.parking,
    fibreOptique: !!home.fibreOptique,
    vitrine: !!home.vitrine,
    zoneCommerciale: !!home.zoneCommerciale,
    accesCamion: !!home.accesCamion,
    securite: !!home.securite,
    ascenseur: !!home.ascenseur,
    mezanine: !!home.mezanine,
    accesInternet: !!home.accesInternet,
    terrasse: !!home.terrasse,
    jardin: !!home.jardin,
    balcon: !!home.balcon,
    piscine: !!home.piscine,
    garage: !!home.garage,
    serviceSecurite: !!home.serviceSecurite,
  });

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(
    home.img ? (home.img.startsWith("http") ? home.img : `https://backend-ged-immo.onrender.com/${home.img}`) : null
  );

  const [existingImages, setExistingImages] = useState(
    Array.isArray(home.images) ? home.images.map((p) => (p.startsWith("http") ? p : `https://backend-ged-immo.onrender.com/${p}`)) : []
  );
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Format d'image invalide !");
    if (file.size > MAX_FILE_SIZE) return toast.error("Image trop lourde (max 5 Mo) !");
    setImg(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = [];
    const previews = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) { toast.error(`${f.name} : format invalide`); continue; }
      if (f.size > MAX_FILE_SIZE) { toast.error(`${f.name} : fichier trop lourd (max 5 Mo)`); continue; }
      valid.push(f); previews.push(URL.createObjectURL(f));
    }
    if (valid.length) { setImages((prev) => [...prev, ...valid]); setImagesPreview((prev) => [...prev, ...previews]); }
  };

  const handleRemoveExistingImage = (index) => setExistingImages((prev) => prev.filter((_, i) => i !== index));
  const handleRemoveNewImage = (index) => { setImages((prev) => prev.filter((_, i) => i !== index)); setImagesPreview((prev) => prev.filter((_, i) => i !== index)); };

  const resetForm = () => {
    setFormData({
      reference: home.reference || "",
      nameHome: home.nameHome || "",
      nameHomeType: home.nameHomeType || "",
      description: home.description || "",
      addressHome: home.addressHome || "",
      city: home.city || "",
      quarter: home.quarter || "",
      rent: home.rent || "",
      guarantee: home.guarantee || "",
      observations: home.observations || "",
      state: home.state || "Disponible",
      NmbrePieces: home.NmbrePieces || "",
      surfaceBureau: home.surfaceBureau || "",
      NmbreBureaux: home.NmbreBureaux || "",
      surfaceEntrepot: home.surfaceEntrepot || "",
      capaciteStockage: home.capaciteStockage || "",
      surfaceMagasin: home.surfaceMagasin || "",
      salleBain: home.salleBain || 1,
      climatisation: !!home.climatisation,
      salleReunion: !!home.salleReunion,
      parking: !!home.parking,
      fibreOptique: !!home.fibreOptique,
      vitrine: !!home.vitrine,
      zoneCommerciale: !!home.zoneCommerciale,
      accesCamion: !!home.accesCamion,
      securite: !!home.securite,
      ascenseur: !!home.ascenseur,
      mezanine: !!home.mezanine,
      accesInternet: !!home.accesInternet,
      terrasse: !!home.terrasse,
      jardin: !!home.jardin,
      balcon: !!home.balcon,
      piscine: !!home.piscine,
      garage: !!home.garage,
      serviceSecurite: !!home.serviceSecurite,
    });
    setImg(null);
    setImgPreview(home.img ? (home.img.startsWith("http") ? home.img : `https://backend-ged-immo.onrender.com/${home.img}`) : null);
    setExistingImages(Array.isArray(home.images) ? home.images.map((p) => (p.startsWith("http") ? p : `https://backend-ged-immo.onrender.com/${p}`)) : []);
    setImages([]); setImagesPreview([]);
    toast.info("Formulaire réinitialisé");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (typeof val === "boolean" || (val !== undefined && val !== null && String(val).trim() !== "")) {
          data.append(key, val);
        }
      });
      if (img) data.append("img", img);
      existingImages.forEach((p) => { const relative = p.replace("http://localhost:4000/", "").replace("http://localhost:4000", ""); data.append("existingImages[]", relative); });
      images.forEach((f) => data.append("images", f));

      const res = await fetch(`http://localhost:4000/homes/${home._id}/update`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: data });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.message || `HTTP ${res.status}`);
      toast.success("✅ Bien mis à jour !");
      onUpdated(result.home); onClose();
    } catch (err) { toast.error("Erreur lors de la mise à jour : " + (err.message || "Erreur serveur")); }
  };

const renderTypeFields = () => {
  const type = (formData.nameHomeType || "").toLowerCase();

  switch (type) {
    // ---------------- IMMOBILIER ----------------
    case "appartement":
    case "maison":
    case "villa":
      return (
        <>
          <div className="grid">
            <div className="field">
              <label>Loyer</label>
              <input name="rent" className="input" value={formData.rent} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Garantie</label>
              <input name="guarantee" className="input" value={formData.guarantee} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Nombre de pièces</label>
              <input name="NmbrePieces" className="input" value={formData.NmbrePieces} onChange={handleChange} />
            </div>
          </div>

          <div className="field full">
            {["terrasse","jardin","balcon","piscine","garage","serviceSecurite"].map((key) => (
              <label key={key} className="checkbox-pill">
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} />
                <span className="checkbox-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>
        </>
      );

    // ---------------- BUREAU ----------------
    case "bureau":
      return (
        <>
          <div className="grid">
            <div className="field">
              <label>Surface (m²)</label>
              <input name="surfaceBureau" className="input" value={formData.surfaceBureau} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Nombre de bureaux</label>
              <input name="NmbreBureaux" className="input" value={formData.NmbreBureaux} onChange={handleChange} />
            </div>
          </div>

          <div className="field full">
            {["climatisation","salleReunion","parking","fibreOptique","ascenseur","mezanine","accesInternet"].map((key) => (
              <label key={key} className="checkbox-pill">
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} />
                <span className="checkbox-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>

          <div className="grid">
            <div className="field">
              <label>Salle de bain</label>
              <input type="number" name="salleBain" className="input" value={formData.salleBain} onChange={handleChange} min={1} />
            </div>
          </div>
        </>
      );

    // ---------------- MAGASIN ----------------
    case "magasin":
      return (
        <>
          <div className="grid">
            <div className="field">
              <label>Surface (m²)</label>
              <input name="surfaceMagasin" className="input" value={formData.surfaceMagasin} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Salle de bain</label>
              <input type="number" name="salleBain" className="input" value={formData.salleBain} onChange={handleChange} min={1} />
            </div>
          </div>

          <div className="field full">
            {["vitrine","zoneCommerciale","mezanine","climatisation","parking","ascenseur","serviceSecurite"].map((key) => (
              <label key={key} className="checkbox-pill">
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} />
                <span className="checkbox-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>
        </>
      );

    // ---------------- ENTREPÔT ----------------
    case "entrepot":
    case "entrepôt":
      return (
        <>
          <div className="grid">
            <div className="field">
              <label>Surface (m²)</label>
              <input name="surfaceEntrepot" className="input" value={formData.surfaceEntrepot} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Capacité de stockage</label>
              <input name="capaciteStockage" className="input" value={formData.capaciteStockage} onChange={handleChange} />
            </div>
          </div>

          <div className="field full">
            {["accesCamion","securite","ventilation"].map((key) => (
              <label key={key} className="checkbox-pill">
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} />
                <span className="checkbox-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>
        </>
      );

    default:
      return null;
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-header">
          <div>
            <h2 className="title">{formData.nameHome}</h2>
            <p className="subtitle">{formData.nameHomeType}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-body">
            <div className="grid">
              <div className="field"><label>Nom du bien</label><input name="nameHome" className="input" value={formData.nameHome} onChange={handleChange} /></div>
              <div className="field"><label>Type</label><input name="nameHomeType" className="input" value={formData.nameHomeType} disabled /></div>
              <div className="field"><label>Adresse</label><input name="addressHome" className="input" value={formData.addressHome} onChange={handleChange} /></div>
              <div className="field"><label>Ville</label><input name="city" className="input" value={formData.city} onChange={handleChange} /></div>
              <div className="field"><label>Quartier</label><input name="quarter" className="input" value={formData.quarter} onChange={handleChange} /></div>
              <div className="field full"><label>Description</label><textarea name="description" className="textarea" value={formData.description} onChange={handleChange} /></div>
            </div>
            {renderTypeFields()}

            {/* Images */}
            <div className="grid">
              <div className="field full">
                <label>Image principale</label>
                <input type="file" accept="image/*" onChange={handleMainImageChange} />
                {imgPreview && <img src={imgPreview} className="preview" alt="Main" />}
              </div>
              <div className="field full">
                <label>Images secondaires</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                <div className="multi-preview">
                  {existingImages.concat(imagesPreview).map((src, idx) => <img key={idx} src={src} className="preview" />)}
                </div>
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn ghost" onClick={resetForm}>Réinitialiser</button>
              <button type="submit" className="btn primary">Sauvegarder</button>
            </div>
          </div>
        </form>
      </div>
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

export default UpdateHomeModal;