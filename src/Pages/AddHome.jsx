import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";

export default function AddHome() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useUserContext();

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
  const [state, setState] = useState("");
  const [NmbrePieces, SetNmbrePieces] = useState("");
  const [img, setImg] = useState(null);
  const [images, setImages] = useState([]);

  const piecesOptions = {
    Appartement: ["1", "2", "3", "4"],
    Maison: ["3", "4", "5", "6"],
    Studio: ["1"],
    Villa: ["4", "5", "6"],
  };

  const handleMainImageChange = (e) => setImg(e.target.files[0]);
  const handleFileChange = (e) => setImages(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return toast.error("Utilisateur non connecté !");

    try {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("nameHome", nameHome);
      formData.append("categorie", categorie);
      formData.append("addressHome", addressHome);
      formData.append("city", city);
      formData.append("quarter", quarter);
      formData.append("rent", rent);
      formData.append("description", description);
      formData.append("guarantee", guarantee);
      formData.append("observations", observations);
      formData.append("state", state);
      formData.append("NmbrePieces", NmbrePieces);
      formData.append("AdminId", user._id);

      if (img) formData.append("img", img);
      Array.from(images).forEach((file) => formData.append("images", file));

      const response = await fetch(`http://localhost:4000/add-home/${projectId}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Maison ajoutée avec succès !");
        // Réinitialiser formulaire
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
        setState("");
        SetNmbrePieces("");
        setImg(null);
        setImages([]);
        setTimeout(() => navigate(`/detail_projet/fr/${projectId}`), 1500);
      } else {
        toast.error(data.message || "Erreur lors de l'ajout de la maison");
      }
    } catch (err) {
      console.error("Erreur ajout maison:", err);
      toast.error("Erreur lors de l'ajout de la maison");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <main className="layout__content">
            <Toaster position="top-right" />
            <h1 className="page-title">
              <i className="fa-solid fa-house"></i> Ajouter une propriété
            </h1>
            <form onSubmit={handleSubmit} className="form">
              <section className="form-section">
                <h3 className="form-section__title">Informations générales</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Nom du logement</label>
                    <input type="text" className="form-input" value={nameHome} onChange={(e) => setNameHome(e.target.value)} required />
                  </div>
                  <div className="form-col">
                    <label>Référence</label>
                    <input type="text" className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Catégorie</label>
                    <select className="form-input" value={categorie} onChange={(e) => { setCategorie(e.target.value); SetNmbrePieces(""); }} required>
                      <option value="">Sélectionner</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Studio">Studio</option>
                      <option value="Villa">Villa</option>
                    </select>
                  </div>
                  <div className="form-col">
                    <label>Nombre de pièces</label>
                    <select className="form-input" value={NmbrePieces} onChange={(e) => SetNmbrePieces(e.target.value)} required disabled={!categorie}>
                      <option value="">Sélectionner</option>
                      {categorie && piecesOptions[categorie].map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                </div>
                <label>Description</label>
                <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} />
              </section>

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

              <section className="form-section">
                <h3 className="form-section__title">Financier</h3>
                <div className="form-row">
                  <div className="form-col">
                    <label>Loyer mensuel (FCFA)</label>
                    <input type="number" className="form-input" value={rent} onChange={(e) => setRent(e.target.value)} />
                  </div>
                  <div className="form-col">
                    <label>Caution</label>
                    <input type="number" className="form-input" value={guarantee} onChange={(e) => setGuarantee(e.target.value)} />
                  </div>
                </div>
              </section>

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

              <button type="submit" className="btn__submit">Ajouter la maison</button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}