import { useState } from "react";
import { toast } from "react-toastify";

export default function HomeForm({ onSubmit, onClose, initialData = {} }) {
  const piecesOptions = { 
    Appartement:["2","3","4","5","6","7","8","9","10"], 
    Maison:["3","4","5","6","7","8","9","10"], 
    Studio:["1"], 
    Villa:["3","4","5","6","7","8","9","10"] 
  };

  // 🔹 Champs principaux
  const [nameHome, setNameHome] = useState(initialData.nameHome ?? "");
  const [reference, setReference] = useState(initialData.reference ?? "");
  const [sousCategorie, setSousCategorie] = useState(initialData.sousCategorie ?? "");
  const [NmbrePieces, setNmbrePieces] = useState(initialData.NmbrePieces ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [observations, setObservations] = useState(initialData.observations ?? "");

  // 📍 Localisation
  const [addressHome, setAddressHome] = useState(initialData.addressHome ?? "");
  const [city, setCity] = useState(initialData.city ?? "");
  const [quarter, setQuarter] = useState(initialData.quarter ?? "");
  const [codePostal, setCodePostal] = useState(initialData.codePostal ?? "");

  // 💰 Financier
  const [rent, setRent] = useState(initialData.rent ?? "");
  const [guarantee, setGuarantee] = useState(initialData.guarantee ?? "");
  const [charges, setCharges] = useState(initialData.charges ?? "");

  // 🏠 Caractéristiques
  const [nombreCles, setNombreCles] = useState(initialData.nombreCles ?? 1);
  const [terrasse, setTerrasse] = useState(initialData.terrasse ?? false);
  const [etage, setEtage] = useState(initialData.etage ?? "");
  const [jardin, setJardin] = useState(initialData.jardin ?? false);
  const [balcon, setBalcon] = useState(initialData.balcon ?? false);
  const [piscine, setPiscine] = useState(initialData.piscine ?? false);
  const [garage, setGarage] = useState(initialData.garage ?? false);
  const [serviceSecurite, setServiceSecurite] = useState(initialData.serviceSecurite ?? false);
const [ascenseur, setAscenseur] = useState(initialData.ascenseur ?? false);

  // 📊 Disponibilité
  const [state, setState] = useState(initialData.state ?? "Disponible");

  // 🖼️ Images
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);

const handleSubmitForm = (e) => {
  e.preventDefault();

  if (!nameHome || !sousCategorie || !NmbrePieces || !addressHome || !city || !rent) {
    return toast.error("Veuillez remplir tous les champs obligatoires !");
  }

  const formData = new FormData();
  formData.append("nameHome", nameHome);
  formData.append("reference", reference);
  formData.append("sousCategorie", sousCategorie);
  formData.append("NmbrePieces", NmbrePieces);
  formData.append("description", description);
  formData.append("observations", observations);
  formData.append("addressHome", addressHome);
  formData.append("city", city);
  formData.append("quarter", quarter);
  formData.append("codePostal", codePostal);
  formData.append("rent", rent);
  formData.append("guarantee", guarantee);
  formData.append("charges", charges);
  formData.append("state", state);
  formData.append("nombreCles", nombreCles);
  formData.append("terrasse", terrasse);
  formData.append("jardin", jardin);
  formData.append("balcon", balcon);
  formData.append("piscine", piscine);
  formData.append("garage", garage);
  formData.append("serviceSecurite", serviceSecurite);
  formData.append("etage", etage);
  formData.append("ascenseur", ascenseur);

  if (img) formData.append("img", img);
  if (images.length > 0) Array.from(images).forEach(file => formData.append("images", file));

  // ✅ Appel à la fonction parent avec le FormData
  onSubmit(formData);
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <form onSubmit={handleSubmitForm} className="form">
          <h1 className="page-title"><i className="fa-solid fa-house"></i> Ajouter une propriété</h1>

          {/* Informations générales */}
          <section className="form-section">
            <h3 className="form-section__title">Informations générales</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Nom du logement</label>
                <input type="text" className="form-input" value={nameHome} onChange={e => setNameHome(e.target.value)} required />
              </div>
              <div className="form-col">
                <label>Référence (N° Porte)</label>
                <input type="text" className="form-input" value={reference} onChange={e => setReference(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Type de Maison</label>
                <select className="form-input" value={sousCategorie} onChange={e => { setSousCategorie(e.target.value); setNmbrePieces(""); }} required>
                  <option value="">Sélectionner</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Maison">Maison</option>
                  <option value="Studio">Studio</option>
                  <option value="Villa">Villa Basse</option>
                  <option value="Villa">Villa Duplex</option>
                </select>
              </div>
              <div className="form-col">
                <label>Nombre de pièces</label>
                <select className="form-input" value={NmbrePieces} onChange={e => setNmbrePieces(e.target.value)} required disabled={!sousCategorie}>
                  <option value="">Sélectionner</option>
                  {sousCategorie && piecesOptions[sousCategorie]?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <label>Description</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </section>

          {/* Localisation */}
          <section className="form-section">
            <h3 className="form-section__title">Localisation</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Ville</label>
                <input type="text" className="form-input" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-col">
                <label>Quartier</label>
                <input type="text" className="form-input" value={quarter} onChange={e => setQuarter(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Adresse</label>
                <input type="text" className="form-input" value={addressHome} onChange={e => setAddressHome(e.target.value)} required />
              </div>
              <div className="form-col">
                <label>Code postal</label>
                <input type="text" className="form-input" value={codePostal} onChange={e => setCodePostal(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Financier */}
          <section className="form-section">
            <h3 className="form-section__title">Financier</h3>
            <div className="form-row">
              <div className="form-col">
                <label>Loyer mensuel (FCFA)</label>
                <input type="number" className="form-input" value={rent} onChange={e => setRent(e.target.value)} required />
              </div>
              <div className="form-col">
                <label>Caution</label>
                <input type="number" className="form-input" value={guarantee} onChange={e => setGuarantee(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Charges</label>
                <input type="text" className="form-input" value={charges} onChange={e => setCharges(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Disponibilité</label>
                <select className="form-input" value={state} onChange={e => setState(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Occupé">Occupé</option>
                </select>
              </div>
            </div>
          </section>

          {/* Caractéristiques (checkbox) */}
<section className="form-section">
  <h3 className="form-section__title">Caractéristiques</h3>
  <div className="checkbox-card">
    <label>
      <input
        type="checkbox"
        checked={terrasse}
        onChange={e => setTerrasse(e.target.checked)}
      /> Terrasse
    </label>
    <label>
      <input
        type="checkbox"
        checked={jardin}
        onChange={e => setJardin(e.target.checked)}
      /> Jardin
    </label>
    <label>
      <input
        type="checkbox"
        checked={balcon}
        onChange={e => setBalcon(e.target.checked)}
      /> Balcon
    </label>
    <label>
      <input
        type="checkbox"
        checked={piscine}
        onChange={e => setPiscine(e.target.checked)}
      /> Piscine
    </label>
    <label>
      <input
        type="checkbox"
        checked={garage}
        onChange={e => setGarage(e.target.checked)}
      /> Garage
    </label>
    <label>
      <input
        type="checkbox"
        checked={serviceSecurite}
        onChange={e => setServiceSecurite(e.target.checked)}
      /> Service Sécurité
    </label>
    <label>
      <input
        type="checkbox"
        checked={ascenseur}
        onChange={e => setAscenseur(e.target.checked)}
      /> Ascenseur
    </label>
  </div>
</section>

          {/* Observations */}
          <section>
            <label>Observations</label>
            <textarea className="form-input" value={observations} onChange={e => setObservations(e.target.value)} />
          </section>

          {/* Images et nombre de clés */}
          <section className="form-section">
            <div className="form-row">
              <div className="form-col">
                <label>Nombre de clés</label>
                <select className="form-input" value={nombreCles} onChange={e => setNombreCles(e.target.value)}>
                  {Array.from({length:10}, (_, i)=>i+1).map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
              <div className="form-col">
                <label>Image principale</label>
                <input type="file" onChange={e => setImg(e.target.files[0])} />
              </div>
              <div className="form-col">
                <label>Images secondaires</label>
                <input type="file" multiple onChange={e => setImages(e.target.files)} />
              </div>
            </div>
          </section>

          <button type="submit" className="btn-add-home">Ajouter la propriété</button>
        </form>
      </div>
      <style>{`
    /* Container des checkbox */
.checkbox-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* Label de chaque checkbox */
.checkbox-card label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

/* Effet hover sur le label */
.checkbox-card label:hover {
  background: #4b00cc;
  color: #fff;
}

/* Style de l’input checkbox */
.checkbox-card input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #4b00cc;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

/* Checkbox cochée */
.checkbox-card input[type="checkbox"]:checked {
  background: #4b00cc;
  border-color: #4b00cc;
}

/* Petit checkmark */
.checkbox-card input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 6px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Réduction de l’espacement pour mobile */
@media (max-width: 768px) {
  .checkbox-card {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
      `}</style>
    </div>
  );
}