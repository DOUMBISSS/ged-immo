import React, { useState } from "react";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function UpdateHomeModal({ home, onClose, onUpdated, token }) {
  const [formData, setFormData] = useState({
    reference: home.reference || "",
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
    NmbrePieces: home.NmbrePieces || "",
  });

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(
    home.img ? `https://backend-ged-immo.onrender.com/${home.img}` : null
  );

  const [existingImages, setExistingImages] = useState(
    home.images ? home.images.map((img) => `https://backend-ged-immo.onrender.com/${img}`) : []
  );

  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const piecesOptions = {
    Appartement: ["2", "3", "4", "5", "6", "7"],
    Maison: ["3", "4", "5", "6", "7", "8"],
    Studio: ["1"],
    Villa: ["3", "4", "5", "6", "7", "8"],
  };

  // 🔹 Gestion des champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Image principale
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type))
      return toast.error("Format d'image invalide !");
    if (file.size > MAX_FILE_SIZE)
      return toast.error("Image trop lourde (max 5 Mo) !");
    setImg(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 🔹 Images secondaires
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

  // 🔹 Suppression d’image secondaire existante
  const handleRemoveExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  // 🔹 Suppression d’image ajoutée récemment
  const handleRemoveNewImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = imagesPreview.filter((_, i) => i !== index);
    setImages(updatedImages);
    setImagesPreview(updatedPreviews);
  };

  // 🔹 Réinitialiser
  const resetForm = () => {
    setFormData({
      reference: home.reference || "",
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
      NmbrePieces: home.NmbrePieces || "",
    });
    setImg(null);
    setImgPreview(home.img ? `http://localhost:4000/${home.img}` : null);
    setExistingImages(
      home.images ? home.images.map((img) => `http://localhost:4000/${img}`) : []
    );
    setImages([]);
    setImagesPreview([]);
    toast.info("Formulaire réinitialisé");
  };

  // 🔹 Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));

      if (img) data.append("img", img);
      if (images.length > 0) images.forEach((f) => data.append("images", f));

      // inclure les images secondaires restantes
      existingImages.forEach((imgPath) =>
        data.append("existingImages[]", imgPath.replace("http://localhost:4000/", ""))
      );

      const res = await fetch(`http://localhost:4000/homes/${home._id}/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("✅ Maison mise à jour avec succès !");
      onUpdated(result.home);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <form onSubmit={handleSubmit} className="form">
          <h1 className="page-title">
            <i className="fa fa-pen"></i> Modifier la propriété
          </h1>

          <p style={{ color: '#555', fontStyle: 'italic', marginBottom: '1rem' }}>
            ⚠️ Seuls les champs modifiables sont affichés ci-dessous.
          </p>

          <section className="form-section">
            <h3 className="form-section__title">Informations générales</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Nom du logement</label>
                <input
                  name="nameHome"
                  className="form-input"
                  value={formData.nameHome}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* <div className="form-col">
                <label>Catégorie</label>
                <select
                  name="categorie"
                  className="form-input"
                  value={formData.categorie}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      categorie: e.target.value,
                      NmbrePieces: "",
                    }))
                  }
                >
                  <option value="">Sélectionner</option>
                  {Object.keys(piecesOptions).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-col">
                <label>Nombre de pièces</label>
                <select
                  name="NmbrePieces"
                  className="form-input"
                  value={formData.NmbrePieces}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner</option>
                  {formData.categorie &&
                    piecesOptions[formData.categorie]?.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                </select>
              </div> */}
            </div>

            <div className="form-row">
              <div className="form-col">
                <label>Adresse</label>
                <input
                  name="addressHome"
                  className="form-input"
                  value={formData.addressHome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-col">
                <label>Ville</label>
                <input
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-col">
                <label>Quartier</label>
                <input
                  name="quarter"
                  className="form-input"
                  value={formData.quarter}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Description</label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
            />
          </section>

          <section className="form-section">
            <h3 className="form-section__title">Images</h3>

            <div className="form-col">
              <label>Image principale</label>
              <input type="file" onChange={handleMainImageChange} />
              {imgPreview && (
                <img src={imgPreview} alt="Preview" className="preview-img" />
              )}
            </div>

            <label>Images secondaires existantes</label>
            {existingImages.length > 0 ? (
              <div className="image-gallery">
                {existingImages.map((src, idx) => (
                  <div key={idx} className="image-box">
                    <img src={src} alt="" className="thumb-img" />
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleRemoveExistingImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune image existante.</p>
            )}

            <label>Ajouter de nouvelles images</label>
            <input type="file" multiple onChange={handleFileChange} />
            {imagesPreview.length > 0 && (
              <div className="image-gallery">
                {imagesPreview.map((src, idx) => (
                  <div key={idx} className="image-box">
                    <img src={src} alt="" className="thumb-img" />
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleRemoveNewImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="modal-actions">
            <button type="button" className="btn-reset" onClick={resetForm}>
              Réinitialiser
            </button>
            <button type="submit" className="btn-add-home">
              Sauvegarder
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          border-radius: 10px;
          padding: 2rem;
          width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          animation: fadeIn 0.3s ease;
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #333;
          cursor: pointer;
        }
        .page-title {
          margin-bottom: 1rem;
          font-size: 1.4rem;
          font-weight: 600;
          color: #2c3e50;
        }
        .form-section {
          margin-bottom: 1.5rem;
        }
        .form-section__title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #34495e;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .form-col {
          flex: 1;
        }
        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .image-box {
          position: relative;
        }
        .thumb-img {
          width: 100px;
          height: 100px;
          border-radius: 6px;
          object-fit: cover;
        }
        .preview-img {
          width: 120px;
          margin-top: 10px;
          border-radius: 8px;
        }
        .delete-btn {
          position: absolute;
          top: -5px;
          right: -5px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          cursor: pointer;
          font-size: 14px;
        }
        .modal-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        .btn-add-home {
          background: #3498db;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-reset {
          background: #95a5a6;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}