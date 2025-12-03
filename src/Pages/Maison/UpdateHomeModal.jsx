import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
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
    // Booleans (par sécurité on initialise à false si undefined)
    climatisation: !!home.climatisation,
    salleReunion: !!home.salleReunion,
    parking: !!home.parking,
    fibreOptique: !!home.fibreOptique,
    vitrine: !!home.vitrine,
    zoneCommerciale: !!home.zoneCommerciale,
    accesCamion: !!home.accesCamion,
    securite: !!home.securite,
  });

  // Main image (file) et preview (base64 ou url)
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(
    home.img ? (home.img.startsWith("http") ? home.img : `https://backend-ged-immo.onrender.com/${home.img}`) : null
  );

  // Images secondaires existantes (full URLs) et nouvelles images
  const [existingImages, setExistingImages] = useState(
    Array.isArray(home.images)
      ? home.images.map((p) => (p.startsWith("http") ? p : `https://backend-ged-immo.onrender.com/${p}`))
      : []
  );
  const [images, setImages] = useState([]); // File[]
  const [imagesPreview, setImagesPreview] = useState([]); // url previews

  // Gestion champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Main image change
  const handleMainImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Format d'image invalide !");
    if (file.size > MAX_FILE_SIZE) return toast.error("Image trop lourde (max 5 Mo) !");
    setImg(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Secondary images add
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = [];
    const previews = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name} : format invalide`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} : fichier trop lourd (max 5 Mo)`);
        continue;
      }
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    if (valid.length) {
      setImages((prev) => [...prev, ...valid]);
      setImagesPreview((prev) => [...prev, ...previews]);
    }
  };

  // Remove existing image by index
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove new image by index
  const handleRemoveNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form to original home values
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
      climatisation: !!home.climatisation,
      salleReunion: !!home.salleReunion,
      parking: !!home.parking,
      fibreOptique: !!home.fibreOptique,
      vitrine: !!home.vitrine,
      zoneCommerciale: !!home.zoneCommerciale,
      accesCamion: !!home.accesCamion,
      securite: !!home.securite,
    });
    setImg(null);
    setImgPreview(home.img ? (home.img.startsWith("http") ? home.img : `https://backend-ged-immo.onrender.com/${home.img}`) : null);
    setExistingImages(Array.isArray(home.images) ? home.images.map((p) => (p.startsWith("http") ? p : `https://backend-ged-immo.onrender.com/${p}`)) : []);
    setImages([]);
    setImagesPreview([]);
    toast.info("Formulaire réinitialisé");
  };

  // Build FormData but only with relevant keys (to avoid touching unrelated fields)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // base fields always allowed
      const baseFields = ["nameHome", "description", "addressHome", "city", "quarter", "observations", "state", "reference"];
      // type-specific mapping
      const type = (formData.nameHomeType || "").toLowerCase();
      const typeFields = {
        appartement: ["rent", "guarantee", "NmbrePieces"],
        maison: ["rent", "guarantee", "NmbrePieces"],
        villa: ["rent", "guarantee", "NmbrePieces"],
        bureau: ["surfaceBureau", "NmbreBureaux", "climatisation", "salleReunion", "parking", "fibreOptique"],
        magasin: ["surfaceMagasin", "vitrine", "zoneCommerciale"],
        entrepot: ["surfaceEntrepot", "capaciteStockage", "accesCamion", "securite"],
        "entrepôt": ["surfaceEntrepot", "capaciteStockage", "accesCamion", "securite"],
      };

      const allowedKeys = [...baseFields, ...(typeFields[type] || [])];

      for (const key of allowedKeys) {
        const val = formData[key];
        // append booleans and non-empty strings only
        if (typeof val === "boolean") {
          data.append(key, val);
        } else if (val !== undefined && val !== null && String(val).trim() !== "") {
          data.append(key, val);
        }
      }

      // images handling
      if (img) data.append("img", img);

      // existingImages: remove base URL and send relative paths (same format as backend expects)
      existingImages.forEach((p) => {
        const relative = p.replace("https://backend-ged-immo.onrender.com/", "").replace("https://backend-ged-immo.onrender.com/", "");
        data.append("existingImages[]", relative);
      });

      // new images
      images.forEach((f) => data.append("images", f));

      // call backend
      const res = await fetch(`https://backend-ged-immo.onrender.com/homes/${home._id}/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        const message = result?.message || (result?.error ? result.error : `HTTP ${res.status}`);
        throw new Error(message);
      }

      toast.success("✅ Bien mis à jour !");
      onUpdated(result.home);
      onClose();
    } catch (err) {
      console.error("UpdateHomeModal submit error:", err);
      toast.error("Erreur lors de la mise à jour : " + (err.message || "Erreur serveur"));
    }
  };

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    const type = (formData.nameHomeType || "").toLowerCase();
    switch (type) {
      case "appartement":
      case "maison":
      case "villa":
        return (
          <div className="form-row">
            <div className="form-col">
              <label>Loyer mensuel (FCFA)</label>
              <input name="rent" className="form-input" value={formData.rent} onChange={handleChange} />
            </div>
            <div className="form-col">
              <label>Garantie</label>
              <input name="guarantee" className="form-input" value={formData.guarantee} onChange={handleChange} />
            </div>
            <div className="form-col">
              <label>Nombre de pièces</label>
              <input name="NmbrePieces" className="form-input" value={formData.NmbrePieces} onChange={handleChange} />
            </div>
          </div>
        );
      case "bureau":
        return (
          <>
            <div className="form-row">
              <div className="form-col">
                <label>Surface (m²)</label>
                <input name="surfaceBureau" className="form-input" value={formData.surfaceBureau} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label>Nombre de bureaux</label>
                <input name="NmbreBureaux" className="form-input" value={formData.NmbreBureaux} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <label><input type="checkbox" name="climatisation" checked={!!formData.climatisation} onChange={handleChange} /> Climatisation</label>
              <label><input type="checkbox" name="salleReunion" checked={!!formData.salleReunion} onChange={handleChange} /> Salle de réunion</label>
              <label><input type="checkbox" name="parking" checked={!!formData.parking} onChange={handleChange} /> Parking</label>
            </div>
          </>
        );
      case "magasin":
        return (
          <>
            <div className="form-row">
              <div className="form-col">
                <label>Surface (m²)</label>
                <input name="surfaceMagasin" className="form-input" value={formData.surfaceMagasin} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <label><input type="checkbox" name="vitrine" checked={!!formData.vitrine} onChange={handleChange} /> Vitrine</label>
              <label><input type="checkbox" name="zoneCommerciale" checked={!!formData.zoneCommerciale} onChange={handleChange} /> Zone commerciale</label>
            </div>
          </>
        );
      case "entrepôt":
      case "entrepot":
        return (
          <>
            <div className="form-row">
              <div className="form-col">
                <label>Surface (m²)</label>
                <input name="surfaceEntrepot" className="form-input" value={formData.surfaceEntrepot} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label>Capacité de stockage</label>
                <input name="capaciteStockage" className="form-input" value={formData.capaciteStockage} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <label><input type="checkbox" name="accesCamion" checked={!!formData.accesCamion} onChange={handleChange} /> Accès camion</label>
              <label><input type="checkbox" name="securite" checked={!!formData.securite} onChange={handleChange} /> Sécurité</label>
            </div>
          </>
        );
      default:
        return <p style={{ color: "#888" }}>Aucun champ spécifique pour ce type.</p>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h1 className="page-title">Modifier : {formData.nameHome}</h1>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-section">
            <label>Type de bien</label>
            <input
              name="nameHomeType"
              className="form-input"
              value={formData.nameHomeType}
              onChange={handleChange}
              disabled
            />

            <label>Nom du bien</label>
            <input name="nameHome" className="form-input" value={formData.nameHome} onChange={handleChange} />

            <label>Description</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} />

            <div className="form-row">
              <div className="form-col">
                <label>Adresse</label>
                <input name="addressHome" className="form-input" value={formData.addressHome} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label>Ville</label>
                <input name="city" className="form-input" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label>Quartier</label>
                <input name="quarter" className="form-input" value={formData.quarter} onChange={handleChange} />
              </div>
            </div>

            {renderTypeSpecificFields()}
          </div>

          {/* -------------------- IMAGES SECTION -------------------- */}
          <section className="form-section">
            <h3 className="form-section__title">Images</h3>

            {/* Image principale */}
            <div className="form-col">
              <label>Image principale</label>
              <input type="file" accept="image/*" onChange={handleMainImageChange} />
              {imgPreview && <img src={imgPreview} alt="Preview" className="preview-img" />}
            </div>

            {/* Images secondaires existantes */}
            <label style={{ marginTop: 12 }}>Images secondaires existantes</label>
            {existingImages.length > 0 ? (
              <div className="image-gallery">
                {existingImages.map((src, idx) => (
                  <div key={idx} className="image-box">
                    <img src={src} alt={`exist-${idx}`} className="thumb-img" />
                    <button type="button" className="delete-btn" onClick={() => handleRemoveExistingImage(idx)}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune image existante.</p>
            )}

            {/* Ajouter de nouvelles images */}
            <label style={{ marginTop: 12 }}>Ajouter de nouvelles images (max 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
            {imagesPreview.length > 0 && (
              <div className="image-gallery">
                {imagesPreview.map((src, idx) => (
                  <div key={idx} className="image-box">
                    <img src={src} alt={`new-${idx}`} className="thumb-img" />
                    <button type="button" className="delete-btn" onClick={() => handleRemoveNewImage(idx)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="modal-actions">
            <button type="button" className="btn-reset" onClick={resetForm}>Réinitialiser</button>
            <button type="submit" className="btn-add-home">Sauvegarder</button>
          </div>
        </form>
      </div>

      {/* ------- CSS intégré prêt à coller ------- */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
        }
        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 8px 30px rgba(2,6,23,0.2);
          animation: slideDown 0.22s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; }
        }
        .modal-close {
          position: absolute;
          top: 12px;
          right: 14px;
          background: transparent;
          border: none;
          font-size: 1.4rem;
          color: #374151;
          cursor: pointer;
        }
        .page-title {
          margin: 0 0 12px 0;
          font-size: 1.25rem;
          font-weight: 700;
          color:#0f172a;
        }
        .form-section {
          margin-bottom: 14px;
        }
        .form-section__title {
          font-weight: 700;
          margin-bottom: 8px;
          color: #1f2937;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-top: 6px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        textarea.form-input {
          min-height: 80px;
          resize: vertical;
        }
        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .form-col { flex: 1; }
        .image-gallery { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; }
        .image-box { position: relative; width: 100px; height: 100px; border-radius:8px; overflow:hidden; border:1px solid #e6e7ea; }
        .thumb-img { width:100%; height:100%; object-fit:cover; display:block; }
        .preview-img { width:120px; height:auto; margin-top:8px; border-radius:8px; object-fit:cover; }
        .delete-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.66);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
        }
        .modal-actions {
          display:flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
        }
        .btn-add-home {
          background: #2563eb;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 700;
        }
        .btn-reset {
          background: #6b7280;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 700;
        }
        label { font-weight: 600; font-size: 13px; color:#374151; display:block; margin-top:8px; }
        input[type="file"] { margin-top: 6px; }
        input[type="checkbox"] { margin-right: 8px; transform: translateY(2px); }
      `}</style>
    </div>
  );
}

export default UpdateHomeModal;