import { useState } from "react";
import { toast } from "react-toastify";

export default function SectionBureau({ project }) {
  const [formData, setFormData] = useState({
    nomBureau: "",
    nbPostes: "",
    openSpace: false,
    sallesReunion: "",
    wifiIncluded: true,
    superficie: "",
    loyer: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/newBureau/${project._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) toast.success("🏢 Bureau ajouté avec succès !");
      else toast.error(data.message || "Erreur d'ajout");
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="form-section">
      <h3>🏢 Bureau</h3>

      <input name="nomBureau" placeholder="Nom du bureau" value={formData.nomBureau} onChange={handleChange} required />
      <input name="nbPostes" type="number" placeholder="Nombre de postes" value={formData.nbPostes} onChange={handleChange} />
      <label>
        <input type="checkbox" name="openSpace" checked={formData.openSpace} onChange={handleChange} /> Open space
      </label>
      <input name="sallesReunion" type="number" placeholder="Nombre de salles de réunion" value={formData.sallesReunion} onChange={handleChange} />
      <label>
        <input type="checkbox" name="wifiIncluded" checked={formData.wifiIncluded} onChange={handleChange} /> Wifi inclus
      </label>
      <input name="superficie" type="number" placeholder="Superficie (m²)" value={formData.superficie} onChange={handleChange} />
      <input name="loyer" placeholder="Loyer (FCFA)" value={formData.loyer} onChange={handleChange} />
      <textarea name="description" placeholder="Description du bureau" value={formData.description} onChange={handleChange}></textarea>

      <button type="submit" className="btn-add-home">Ajouter</button>
    </form>
       <style>{`
        /* Container général du formulaire */
.form-section {
  background-color: #fff;
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  max-width: 500px;
  margin: 20px auto;
  font-family: 'Inter', sans-serif;
}

/* Titre du formulaire */
.form-section h3 {
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: #333;
}

/* Inputs et textarea */
.form-section input,
.form-section textarea {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s ease;
}

.form-section input:focus,
.form-section textarea:focus {
  border-color: #4f46e5;
  outline: none;
}

/* Checkbox & label */
.form-section label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: #555;
}

.form-section input[type="checkbox"] {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  accent-color: #4f46e5;
}

/* Bouton */
.btn-add-home {
  width: 100%;
  padding: 12px;
  background-color: #4f46e5;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-add-home:hover {
  background-color: #3730a3;
}

/* Pour textarea */
.form-section textarea {
  resize: vertical;
  min-height: 80px;
}

/* Responsive */
@media (max-width: 600px) {
  .form-section {
    padding: 15px;
  }
}
      `}</style>
    </>
  );
}

