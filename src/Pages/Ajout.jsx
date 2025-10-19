import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../contexts/UserContext";

export default function Ajout() {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedHome, setSelectedHome] = useState(null);

  // --- Champs du formulaire ---
  const [name, setFullName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [birth, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [nationality, setNationality] = useState("");
  const [sexe, setSexe] = useState("");
  const [tel, setTel] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddresse] = useState("");
  const [email, setEmail] = useState("");
  const [piece, setPiece] = useState("");
  const [current_status, setCurrentStatus] = useState("");
  const [city, setCity] = useState("");
  const [date_entrance, setDateEntrance] = useState("");
  const [date_emission, setEmission] = useState("");
  const [date_expiration, setExpiration] = useState("");

  // --- Récupération des projets avec leurs maisons ---
  useEffect(() => {
    if (!user?._id) return;

    fetch(`http://localhost:4000/projects/admin/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects || []);
        }
      })
      .catch((err) =>
        toast.error("Erreur récupération projets/maisons : " + err.message)
      );
  }, [user]);

  // --- Filtrage des maisons disponibles ---
  const filteredHomes =
    projects.find((p) => p._id === selectedProject)?.homes.filter(
      (home) => !home.person_id || home.person_id.length === 0
    ) || [];

  // --- Sélection d'une maison ---
  const handleHouseChange = (e) => {
    const selectedId = e.target.value;
    const home = filteredHomes.find((h) => h._id === selectedId);
    setSelectedHome(home || null);
  };

  // --- Enregistrement du locataire ---
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!user?._id) return toast.error("Utilisateur non connecté !");
    if (!selectedHome) return toast.error("Veuillez sélectionner un bien disponible !");

    try {
      const res = await fetch("http://localhost:4000/NewLocataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prenom,
          birth,
          lieu,
          nationality,
          sexe,
          tel,
          profession,
          address,
          email,
          piece,
          date_emission,
          date_expiration,
          date_entrance,
          current_status,
          city,
          homes: selectedHome._id,
          AdminId: user._id,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          `✅ Locataire ajouté ! Identifiants : ${result.username} / ${result.password}`
        );
        navigate(`/upload-document/${result.person._id}`);
      } else {
        toast.error("Erreur: " + result.message);
      }
    } catch (err) {
      toast.error("Erreur serveur: " + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right-panel">
            <div className="form-card">
              <h1 className="form-title">Ajouter un nouveau locataire</h1>
              <form className="form-grid" onSubmit={handleAdd}>
                {/* Champs du formulaire */}
                <div className="form-group">
                  <label>Noms</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Prénom(s)</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    required
                    value={birth}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Lieu</label>
                  <input
                    type="text"
                    required
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Sexe</label>
                  <select
                    required
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nationalité</label>
                  <input
                    type="text"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Tel</label>
                  <input
                    type="text"
                    required
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Domicile</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddresse(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Profession</label>
                  <input
                    type="text"
                    required
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>N° CNI ou PASSEPORT</label>
                  <input
                    type="text"
                    required
                    value={piece}
                    onChange={(e) => setPiece(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Date d'émission</label>
                  <input
                    type="date"
                    required
                    value={date_emission}
                    onChange={(e) => setEmission(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Date d'expiration</label>
                  <input
                    type="date"
                    required
                    value={date_expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Date d'entrée</label>
                  <input
                    type="date"
                    required
                    value={date_entrance}
                    onChange={(e) => setDateEntrance(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Sélection du projet */}
                <div className="form-group">
                  <label>Projet</label>
                  <select
                    required
                    value={selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value);
                      setSelectedHome(null);
                    }}
                    className="select-field"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélection du bien disponible */}
                {selectedProject && (
                  <div className="form-group">
                    <label>Biens disponibles</label>
                    <select
                      required
                      value={selectedHome?._id || ""}
                      onChange={handleHouseChange}
                      className="select-field"
                    >
                      <option value="">Sélectionner un bien</option>
                      {filteredHomes.map((home) => (
                        <option key={home._id} value={home._id}>
                          {home.nameHome} - {home.reference} - {home.categorie}{" "}
                          {home.person_id?.length ? "(Occupé)" : "(Disponible)"}
                        </option>
                      ))}
                    </select>

                    {selectedHome && (
                      <div
                        style={{
                          marginTop: 15,
                          padding: 15,
                          border: "1px solid #ddd",
                          borderRadius: 10,
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          background: "#fff",
                        }}
                      >
                        {selectedHome.img && (
                          <img
                            src={
                              selectedHome.img.startsWith("http")
                                ? selectedHome.img
                                : `http://localhost:4000/${selectedHome.img}`
                            }
                            alt={selectedHome.nameHome}
                            style={{
                              width: 220,
                              height: 150,
                              borderRadius: 8,
                              objectFit: "cover",
                              marginBottom: 10,
                            }}
                          />
                        )}
                        <h4>{selectedHome.nameHome}</h4>
                        <p>
                          <strong>Référence:</strong> {selectedHome.reference}
                        </p>
                        <p>
                          <strong>Catégorie:</strong> {selectedHome.categorie}
                        </p>
                        <p>
                          <strong>Nombre de pièces:</strong>{" "}
                          {selectedHome.NmbrePieces || "N/A"}
                        </p>
                        <p>
                          <strong>Loyer Mensuel:</strong>{" "}
                          {selectedHome.rent
                            ? `${selectedHome.rent.toLocaleString()} FCFA`
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Disponibilité:</strong>{" "}
                          {selectedHome.person_id?.length ? "Occupé" : "Libre"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions du formulaire */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate("/users")}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}