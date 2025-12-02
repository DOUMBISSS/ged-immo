import { useState } from "react";
import { toast } from "react-toastify";

export default function SectionImmobilier({ project }) {
  const [reference, setReference] = useState("");
  const [nameHome, setNameHome] = useState("");
  const [categorie, setCategorie] = useState("");
  const [addressHome, setAddressHome] = useState("");
  const [city, setCity] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [guarantee, setGuarantee] = useState("");
  const [observations, setObservations] = useState("");
  const [state, setState] = useState("Disponible");
  const [NmbrePieces, SetNmbrePieces] = useState("");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);

  const piecesOptions = {
    Appartement: ["2","3","4", "5", "6","7", "8", "9","10"],
    Maison: ["3","4", "5", "6","7", "8", "9","10"],
    Studio: ["1"],
    Villa: ["3","4", "5", "6","7", "8", "9","10"],
  };

  const handleMainImageChange = (e) => setImg(e.target.files[0]);
  const handleFileChange = (e) => setImages(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameHome || !categorie || !addressHome || !city || !rent) {
      return toast.error("Veuillez remplir tous les champs obligatoires !");
    }

    try {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("nameHome", nameHome);
      formData.append("categorie", categorie);
      formData.append("addressHome", addressHome);
      formData.append("city", city);
      formData.append("quarter", quarter || "");
      formData.append("rent", rent);
      formData.append("description", description || "");
      formData.append("guarantee", guarantee || "");
      formData.append("observations", observations || "");
      formData.append("state", state || "Disponible");
      formData.append("NmbrePieces", NmbrePieces || "");
      if (img) formData.append("img", img);
      if (images.length > 0)
        Array.from(images).forEach((file) => formData.append("images", file));

      const response = await fetch(`https://backend-ged-immo.onrender.com/newHome/${project._id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("🏠 Maison ajoutée avec succès !");
        setReference("");
        setNameHome("");
        setCategorie("");
        setAddressHome("");
        setCity("");
        setQuarter("");
        setRent("");
        setDescription("");
        setGuarantee("");
        setObservations("");
        setState("Disponible");
        SetNmbrePieces("");
        setImg(null);
        setImages([]);
      } else {
        toast.error(data.message || "Erreur lors de l'ajout de la maison");
      }
    } catch (err) {
      console.error("Erreur ajout maison:", err);
      toast.error("Erreur serveur lors de l'ajout de la maison");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h1 className="page-title">
        <i className="fa-solid fa-house"></i> Ajouter une propriété
      </h1>

      {/* 🏘 Informations générales */}
      <section className="form-section">
        <h3 className="form-section__title">Informations générales</h3>
        <div className="form-row">
          <div className="form-col">
            <label>Nom du logement</label>
            <input type="text" className="form-input" value={nameHome} onChange={(e) => setNameHome(e.target.value)} required />
          </div>
          <div className="form-col">
            <label>Référence (N° Porte)</label>
            <input type="text" className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="form-col">
            <label>Catégorie</label>
            <select
              className="form-input"
              value={categorie}
              onChange={(e) => {
                setCategorie(e.target.value);
                SetNmbrePieces("");
              }}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Studio">Studio</option>
              <option value="Villa">Villa</option>
            </select>
          </div>
          <div className="form-col">
            <label>Nombre de pièces</label>
            <select
              className="form-input"
              value={NmbrePieces}
              onChange={(e) => SetNmbrePieces(e.target.value)}
              required
              disabled={!categorie}
            >
              <option value="">Sélectionner</option>
              {categorie &&
                piecesOptions[categorie].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <label>Description</label>
        <textarea
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      {/* 📍 Localisation */}
      <section className="form-section">
        <h3 className="form-section__title">Localisation</h3>
        <div className="form-row">
          <div className="form-col">
            <label>Ville</label>
            <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-col">
            <label>Quartier</label>
            <input type="text" className="form-input" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
          </div>
          <div className="form-col">
            <label>Adresse</label>
            <input type="text" className="form-input" value={addressHome} onChange={(e) => setAddressHome(e.target.value)} />
          </div>
        </div>
      </section>

      {/* 💰 Financier */}
      <section className="form-section">
        <h3 className="form-section__title">Financier</h3>
        <div className="form-row">
          <div className="form-col">
            <label>Loyer mensuel (FCFA)</label>
            <input type="text" className="form-input" value={rent} onChange={(e) => setRent(e.target.value)} />
          </div>
          <div className="form-col">
            <label>Caution</label>
            <input type="text" className="form-input" value={guarantee} onChange={(e) => setGuarantee(e.target.value)} />
          </div>
        </div>
      </section>

      {/* 🧾 Observations */}
      <section>
        <label>Observations</label>
        <textarea className="form-input" value={observations} onChange={(e) => setObservations(e.target.value)} />
      </section>

      {/* ⚙️ Disponibilité */}
      <section>
        <div className="form-col">
          <label>Disponibilité</label>
          <select className="form-input" value={state} onChange={(e) => setState(e.target.value)} required>
            <option value="">Sélectionner</option>
            <option value="Disponible">Disponible</option>
            <option value="Occupé">Occupé</option>
          </select>
        </div>
      </section>

      {/* 🖼 Images */}
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
      </section>

      <button type="submit" className="btn-add-home">Ajouter la maison</button>
    </form>
  );
}