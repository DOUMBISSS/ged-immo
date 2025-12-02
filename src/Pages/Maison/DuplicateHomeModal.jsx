import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fieldsByCategory = {
  immobilier: [
    { name: "nameHome", label: "Nom du logement", type: "text", required: true },
    { name: "reference", label: "Référence", type: "text" },
    { name: "NmbrePieces", label: "Nombre de pièces", type: "text" },
    { name: "rent", label: "Loyer (FCFA)", type: "text" },
    { name: "guarantee", label: "Caution", type: "text" },
    { name: "works", label: "Travaux (séparés par virgules)", type: "textarea" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "city", label: "Ville", type: "text" },
    { name: "quarter", label: "Quartier", type: "text" },
    { name: "addressHome", label: "Adresse", type: "text" },
    { name: "observations", label: "Observations", type: "textarea" },
    { name: "state", label: "Disponibilité", type: "select", options: ["Disponible"] },
  ],
  bureau: [
    { name: "nameHome", label: "Nom du bureau", type: "text", required: true },
    { name: "reference", label: "Référence", type: "text" },
    { name: "rent", label: "Loyer (FCFA)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "city", label: "Ville", type: "text" },
    { name: "quarter", label: "Quartier", type: "text" },
    { name: "addressHome", label: "Adresse", type: "text" },
    { name: "state", label: "Disponibilité", type: "select", options: ["Disponible"] },
    { name: "NmbrePieces", label: "Nombre de bureaux", type: "text" },
    { name: "salleReunion", label: "Salle de réunion", type: "checkbox" },
    { name: "climatisation", label: "Climatisation", type: "checkbox" },
    { name: "fibreOptique", label: "Fibre optique", type: "checkbox" },
    { name: "parking", label: "Parking", type: "checkbox" },
    { name: "ascenseur", label: "Ascenseur", type: "checkbox" },
  ],
 magasin: [
    { name: "nameHome", label: "Nom du magasin", type: "text", required: true },
    { name: "reference", label: "Référence", type: "text" },
    { name: "rent", label: "Loyer (FCFA)", type: "text" },
    { name: "surfaceMagasin", label: "Surface (m²)", type: "text" },
    { name: "NmbrePieces", label: "Nombre de pièces", type: "text" },
    { name: "guarantee", label: "Caution", type: "text" },
    { name: "mezanine", label: "Mezanine (m²)", type: "checkbox" },
    { name: "accesRoutier", label: "Accès routier", type: "text" },
    { name: "vitrine", label: "Vitrine", type: "checkbox" },
    { name: "stockDisponible", label: "Stock disponible", type: "checkbox" },
    { name: "zoneCommerciale", label: "Zone commerciale", type: "checkbox" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "city", label: "Ville", type: "text" },
    { name: "quarter", label: "Quartier", type: "text" },
    { name: "addressHome", label: "Adresse", type: "text" },
    { name: "state", label: "Disponibilité", type: "select", options: ["Disponible"] },
  ],
  entrepot: [
    { name: "nameHome", label: "Nom de l'entrepôt", type: "text", required: true },
    { name: "reference", label: "Référence", type: "text" },
    { name: "rent", label: "Loyer (FCFA)", type: "text" },
    { name: "surface", label: "Surface (m²)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "city", label: "Ville", type: "text" },
    { name: "quarter", label: "Quartier", type: "text" },
    { name: "addressHome", label: "Adresse", type: "text" },
    { name: "state", label: "Disponibilité", type: "select", options: ["Disponible"] },
    { name: "NmbrePieces", label: "Nombre de bureaux", type: "text" },
    { name: "salleReunion", label: "Salle de réunion", type: "checkbox" },
    { name: "climatisation", label: "Climatisation", type: "checkbox" },
    { name: "fibreOptique", label: "Fibre optique", type: "checkbox" },
    { name: "parking", label: "Parking", type: "checkbox" },
    { name: "ascenseur", label: "Ascenseur", type: "checkbox" },
  ],
};

export default function DuplicateHomeModal({ home, projectId, onClose, onDuplicated }) {
  const { user } = useUserContext();

// 🔹 formData harmonisé
const [formData, setFormData] = useState({
  reference: home.reference ? `${home.reference}-copie` : "",
  nameHome: home.nameHome || "",
  categorie: home.categorie || "",
  addressHome: home.addressHome || "",
  city: home.city || "",
  quarter: home.quarter || "",
  rent: home.rent || "",
  description: home.description || "",
  guarantee: home.guarantee || "",
  observations: home.observations || "",
  state: home.state || "Disponible",
  NmbrePieces: home.NmbrePieces || "", // pour tous types
  works: home.works || [],
  surface: home.surface || "",
  surfaceMagasin: home.surfaceMagasin || "",
   accesRoutier: home.accesRoutier || "",
  mezanine: home.mezanine || "",
    vitrine: home.vitrine || false,
  stockDisponible: home.stockDisponible || false,
  zoneCommerciale: home.zoneCommerciale || false,
  salleReunion: home.salleReunion || false,
  climatisation: home.climatisation || false,
  fibreOptique: home.fibreOptique || false,
  parking: home.parking || false,
  ascenseur: home.ascenseur || false,
});

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWorksChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, works: value.split(",").map((s) => s.trim()) }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Format d'image invalide !");
    if (file.size > MAX_FILE_SIZE) return toast.error("Image trop lourde (max 5 Mo) !");
    setImg(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name} : format invalide`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} : fichier trop lourd (max 5 Mo)`);
        return false;
      }
      return true;
    });
    setImages(validFiles);
    setImagesPreview(validFiles.map((f) => URL.createObjectURL(f)));
  };

  const mainImage =
    home.img?.startsWith("http") ? home.img : `http://localhost:4000/${home.img}`;
  const existingImages =
    home.images?.map((img) =>
      img.startsWith("http") ? img : `http://localhost:4000/${img}`
    ) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return toast.error("Session expirée ou utilisateur non connecté !");

    try {
      const form = new FormData();
      form.append("projectId", projectId);

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });

      if (img) form.append("img", img);
      images.forEach((f) => form.append("images", f));

      const response = await fetch(`http://localhost:4000/homes/${home._id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: form,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Bien dupliqué avec succès !");
        onDuplicated(data.home);
        onClose();
      } else toast.error(data.message || "Erreur lors de la duplication");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la duplication du bien");
    }
  };

  const currentFields =
    fieldsByCategory[home.categorie?.toLowerCase()] || fieldsByCategory.immobilier;

  return (
    <div className="modal-overlay">
      <div className="modal-content scrollable-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <form onSubmit={handleSubmit} className="form">
          <h2 className="modal-title">📋 Dupliquer la propriété</h2>

          <div className="form-grid">
            {currentFields.map((field) => (
              <div className="form-group" key={field.name}>
                <label>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={field.name === "works" ? handleWorksChange : handleChange}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  >
                    {field.options.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <div className="form-group">
              <label>Image principale</label>
              <input type="file" onChange={handleMainImageChange} />
              {(imgPreview || mainImage) && (
                <img src={imgPreview || mainImage} alt="principale" className="img-preview" />
              )}
            </div>

            <div className="form-group">
              <label>Images secondaires</label>
              <input type="file" multiple onChange={handleFileChange} />
              <div className="images-preview">
                {(imagesPreview.length > 0 ? imagesPreview : existingImages).map((src, idx) => (
                  <img key={idx} src={src} alt="secondaire" className="img-preview" />
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit">✅ Confirmer la duplication</button>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top:0; left:0; width:100%; height:100%;
          background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center;
          z-index:9999; padding:20px;
        }
        .modal-content {
          background:#fff; border-radius:12px; width:100%; max-width:800px;
          box-shadow:0 15px 30px rgba(0,0,0,0.2); overflow:hidden; position:relative;
        }
        .scrollable-modal {
          max-height:90vh; overflow-y:auto; padding:30px;
        }
        .modal-close {
          position:absolute; top:15px; right:15px; font-size:28px; border:none;
          background:none; cursor:pointer; color:#888;
        }
        .modal-title {
          font-size:26px; margin-bottom:25px; text-align:center; color:#333;
        }
        .form-grid {
          display:grid; grid-template-columns:1fr 1fr; gap:20px;
        }
        .form-group {
          display:flex; flex-direction:column;
        }
        .form-group label {
          margin-bottom:6px; font-weight:500; color:#555;
        }
        .form-group input, .form-group textarea, .form-group select {
          padding:10px; border-radius:8px; border:1px solid #ccc;
          font-size:14px; outline:none; transition:0.2s border;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          border-color:#6a1fff;
        }
        .form-group textarea { resize:vertical; min-height:60px; }
        .form-group input[type="checkbox"] { width:20px; height:20px; margin-top:5px; }
        .img-preview { width:80px; border-radius:8px; margin-top:10px; object-fit:cover; }
        .images-preview { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
        .btn-submit {
          grid-column:span 2; margin-top:20px; padding:14px; background:#4b00cc;
          color:#fff; border:none; border-radius:10px; font-size:16px; cursor:pointer;
          transition:0.3s background;
        }
        .btn-submit:hover { background:#6a1fff; }
        @media(max-width:700px) { .form-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}