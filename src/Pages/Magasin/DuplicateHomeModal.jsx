import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function DuplicateHomeModal({
  home,
  projectId,
  adminId,
  onClose,
  onDuplicated,
}) {
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
    state: "Disponible",
    NmbrePieces: home.NmbrePieces || "",
    works: home.works || [],
  });

  const { user } = useUserContext(); // ✅ récupère le user connecté
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const piecesOptions = {
    Appartement: ["2","3","4","5","6","7","8","9","10"],
    Maison: ["3","4","5","6","7","8","9","10"],
    Studio: ["1"],
    Villa: ["3","4","5","6","7","8","9","10"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Image principale
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

  // 🔹 Images secondaires
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => {
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
    setImagesPreview(validFiles.map(f => URL.createObjectURL(f)));
  };

  // 🔹 Champs tableau works
  const handleWorksChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      works: value.split(",").map(s => s.trim())
    }));
  };

  const resetForm = () => {
    setFormData({
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
      state: "Disponible",
      NmbrePieces: home.NmbrePieces || "",
      works: home.works || [],
    });
    setImg(null);
    setImgPreview(null);
    setImages([]);
    setImagesPreview([]);
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user?.token) {
    return toast.error("Session expirée ou utilisateur non connecté !");
  }

  try {
    const form = new FormData();
    form.append("projectId", projectId);

    // Champs modifiables
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value);
      }
    });

    // Images
    if (img) form.append("img", img);
    if (images.length > 0) images.forEach((file) => form.append("images", file));

    const response = await fetch(
      `https://backend-ged-immo.onrender.com/homes/${home._id}/duplicate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`, // ✅ token pour authenticate()
        },
        body: form,
      }
    );

    const data = await response.json();

    if (data.success) {
      toast.success("Maison dupliquée avec succès !");
      onDuplicated(data.home);
      resetForm();
      onClose();
    } else {
      toast.error(data.message || "Erreur lors de la duplication");
    }
  } catch (err) {
    console.error("Erreur duplication maison :", err);
    toast.error("Erreur lors de la duplication de la maison");
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <form onSubmit={handleSubmit} className="form">
          <h1 className="page-title"><i className="fa fa-copy"></i> Dupliquer une propriété</h1>

          {/* Informations générales */}
          <section className="form-section">
            <h3 className="form-section__title">Informations générales</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Nom du logement</label>
                <input
                  name="nameHome"
                  type="text"
                  className="form-input"
                  value={formData.nameHome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-col">
                <label>Référence (N° Porte)</label>
                <input
                  name="reference"
                  type="text"
                  className="form-input"
                  value={formData.reference}
                  onChange={handleChange}
                />
              </div>
              <div className="form-col">
                <label>Catégorie</label>
                <select
                  name="categorie"
                  className="form-input"
                  value={formData.categorie}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      categorie: e.target.value,
                      NmbrePieces: "",
                    }));
                  }}
                  required
                >
                  <option value="">Sélectionner</option>
                  {Object.keys(piecesOptions).map(c => (
                    <option key={c} value={c}>{c}</option>
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
                  required
                  disabled={!formData.categorie}
                >
                  <option value="">Sélectionner</option>
                  {formData.categorie &&
                    piecesOptions[formData.categorie].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                </select>
              </div>
            </div>

            <label>Description</label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
            />

            <label>Travaux (séparés par des virgules)</label>
            <input
              type="text"
              name="works"
              className="form-input"
              value={Array.isArray(formData.works) ? formData.works.join(", ") : formData.works}
              onChange={handleWorksChange}
            />
          </section>

          {/* Localisation */}
          <section className="form-section">
            <h3 className="form-section__title">Localisation</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Ville</label>
                <input
                  name="city"
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-col">
                <label>Quartier</label>
                <input
                  name="quarter"
                  type="text"
                  className="form-input"
                  value={formData.quarter}
                  onChange={handleChange}
                />
              </div>
              <div className="form-col">
                <label>Adresse</label>
                <input
                  name="addressHome"
                  type="text"
                  className="form-input"
                  value={formData.addressHome}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Financier */}
          <section className="form-section">
            <h3 className="form-section__title">Financier</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Loyer mensuel (FCFA)</label>
                <input name="rent" type="text" className="form-input" value={formData.rent} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label>Caution</label>
                <input name="guarantee" type="text" className="form-input" value={formData.guarantee} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Observations */}
          <section>
            <label>Observations</label>
            <textarea name="observations" className="form-input" value={formData.observations} onChange={handleChange} />
          </section>

          {/* Disponibilité */}
          <section>
            <div className="form-col">
              <label>Disponibilité</label>
              <select name="state" className="form-input" value={formData.state} onChange={handleChange} required>
                <option value="Disponible">Disponible</option>
                {/* <option value="Occupé">Occupé</option> */}
              </select>
            </div>
          </section>

          {/* Images */}
          <section className="form-section">
            <h3 className="form-section__title">Images</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Image principale</label>
                <input type="file" onChange={handleMainImageChange} />
              </div>
              <div className="form-col">
                <label>Images secondaires</label>
                <input type="file" multiple onChange={handleFileChange} />
              </div>
            </div>

            {/* Aperçus */}
            <div style={{ marginTop: 10 }}>
              {imgPreview || home.img ? (
                <>
                  <p style={{ color: imgPreview ? "#4b00cc" : "#555" }}>
                    Image principale {imgPreview ? "sélectionnée" : "actuelle"} :
                  </p>
                  <img src={imgPreview || home.img} alt="image principale" style={{ width: 150, borderRadius: 5 }} />
                </>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {(imagesPreview.length > 0 ? imagesPreview : home.images || []).map((src, idx) => (
                  <img key={idx} src={src} alt="image secondaire" style={{ width: 100, borderRadius: 5 }} />
                ))}
              </div>
            </div>
          </section>

          <button type="submit" className="btn-add-home">
            Confirmer la duplication
          </button>
        </form>
      </div>
    </div>
  );
}