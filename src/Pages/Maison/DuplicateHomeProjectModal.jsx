import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function DuplicateHomeProjectModal({ home, isOpen, onClose, API, onDuplicated }) {
  const { user ,getAuthHeaders} = useUserContext();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    reference: "",
    nameHome: "",
    categorie: "",
    addressHome: "",
    city: "",
    quarter: "",
    rent: "",
    description: "",
    guarantee: "",
    observations: "",
    state: "Disponible",
    NmbrePieces: "",
    works: [],
  });

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const piecesOptions = {
    Appartement: ["2", "3", "4", "5", "6", "7", "8", "9", "10"],
    Maison: ["3", "4", "5", "6", "7", "8", "9", "10"],
    Studio: ["1"],
    Villa: ["3", "4", "5", "6", "7", "8", "9", "10"],
  };

  // 🔹 Initialiser le formData quand home est défini
  useEffect(() => {
    if (!home) return;
    setFormData({
      reference: home?.reference ? `${home.reference}-copie` : "",
      nameHome: home?.nameHome || "",
      categorie: home?.categorie || "",
      addressHome: home?.addressHome || "",
      city: home?.city || "",
      quarter: home?.quarter || "",
      rent: home?.rent || "",
      description: home?.description || "",
      guarantee: home?.guarantee || "",
      observations: home?.observations || "",
      state: "Disponible",
      NmbrePieces: home?.NmbrePieces || "",
      works: home?.works || [],
    });

    setImgPreview(home?.img || null);
    setImagesPreview(home?.images || []);
  }, [home]);

  // 🔹 Charger les projets de l'admin
  useEffect(() => {
    if (!isOpen || !user?._id) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API}/projects/admin/${user._id}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (res.ok) setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des projets.");
      }
    };
    fetchProjects();
  }, [isOpen, user, API]);

  // 🔹 Gestion des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Image principale
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Format d'image invalide !");
    if (file.size > MAX_FILE_SIZE) return toast.error("Image trop lourde (max 5 Mo) !");
    setImg(file);
    setImgPreview(URL.createObjectURL(file));
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

  // 🔹 Soumission formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return toast.warn("Veuillez sélectionner un projet de destination.");
    if (!user?.token) return toast.error("Session expirée, veuillez vous reconnecter.");

    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) form.append(key, JSON.stringify(value));
        else form.append(key, value);
      });
      if (img) form.append("img", img);
      if (images.length > 0) images.forEach((f) => form.append("images", f));

      const res = await fetch(`${API}/homes/${home?._id}/duplicate/${selectedProject}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la duplication");
      toast.success("🏠 Maison dupliquée avec succès !");
      onDuplicated && onDuplicated(data.home);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">📋 Dupliquer une maison vers un autre projet</h2>

        <form onSubmit={handleSubmit}>
          {/* Projet cible */}
          <div className="form-group">
            <label>Projet cible</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required>
              <option value="">-- Choisir un projet --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.type || "Type inconnu"})</option>
              ))}
            </select>
          </div>

          <label>Nom du logement</label>
          <input name="nameHome" value={formData.nameHome} onChange={handleChange} required />

          <label>Référence</label>
          <input name="reference" value={formData.reference} onChange={handleChange} />

          <label>Catégorie</label>
          <select
            name="categorie"
            value={formData.categorie}
            onChange={(e) => setFormData((prev) => ({ ...prev, categorie: e.target.value, NmbrePieces: "" }))}
            required
          >
            <option value="">Sélectionner</option>
            {Object.keys(piecesOptions).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Nombre de pièces</label>
          <select
            name="NmbrePieces"
            value={formData.NmbrePieces}
            onChange={handleChange}
            disabled={!formData.categorie}
            required
          >
            <option value="">Sélectionner</option>
            {formData.categorie && piecesOptions[formData.categorie].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Images */}
          <label>Image principale</label>
          <input type="file" onChange={handleMainImageChange} />
          {imgPreview && <img src={imgPreview} alt="preview" style={{ width: 150, borderRadius: 8 }} />}

          <label>Images secondaires</label>
          <input type="file" multiple onChange={handleFileChange} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {imagesPreview.map((src, i) => <img key={i} src={src} alt="preview" style={{ width: 100, borderRadius: 5 }} />)}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Duplication..." : "Confirmer la duplication"}
          </button>
        </form>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; justify-content: center; align-items: center; z-index: 2000; }
        .modal-content { background: #fff; border-radius: 10px; padding: 25px 30px; width: 90%; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; animation: fadeInUp 0.3s ease; }
        .modal-close { position: absolute; top: 10px; right: 15px; border: none; background: none; font-size: 26px; cursor: pointer; }
        .modal-title { text-align: center; color: #4b00cc; margin-bottom: 20px; }
        .form-group, label { display: block; margin-bottom: 10px; color: #333; font-weight: 500; }
        input, select, textarea { width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #ccc; margin-bottom: 15px; }
        .btn-submit { width: 100%; background: #6f42c1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; transition: background 0.3s; }
        .btn-submit:hover { background: #4b00cc; }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}