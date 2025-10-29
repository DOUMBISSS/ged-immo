import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState({});
  const [rentHomes, setRentHomes] = useState([]);

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [prenom, setPrenom] = useState("");
  const [birth, setBirth] = useState("");
  const [lieu, setLieu] = useState("");
  const [nationality, setNationality] = useState("");
  const [situation, setSituation] = useState("");
  const [sexe, setSexe] = useState("");
  const [tel, setTel] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [piece, setPiece] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [city, setCity] = useState("");
  const [dateEntrance, setDateEntrance] = useState("");
  const [house, setHouse] = useState("");
  const [dateEmission, setDateEmission] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  // Charger les infos du locataire
  useEffect(() => {
    fetch(`https://backend-ged-immo.onrender.com/detail/person/${id}`)
      .then(res => res.json())
      .then(data => {
        setPerson(data);
        setName(data.name || "");
        setLastname(data.lastname || "");
        setPrenom(data.prenom || "");
        setBirth(data.birth || "");
        setLieu(data.lieu || "");
        setNationality(data.nationality || "");
        setSituation(data.situation || "");
        setSexe(data.sexe || "");
        setTel(data.tel || "");
        setProfession(data.profession || "");
        setEmail(data.email || "");
        setPiece(data.pieces || ""); // correspond à ton schema backend
        setAddress(data.address || "");
        setCurrentStatus(data.current_status || "");
        setCity(data.city || "");
        setDateEntrance(data.date_entrance || "");
        setDateEmission(data.date_emission || "");
        setDateExpiration(data.date_expiration || "");
        setHouse(data.homeId || ""); // correspond à ton schema backend
      })
      .catch(err => console.error("Erreur fetch locataire :", err));
  }, [id]);

  // Charger les logements disponibles
  useEffect(() => {
    fetch('https://backend-ged-immo.onrender.com/homes')
      .then(res => res.json())
      .then(data => setRentHomes(data))
      .catch(err => console.error(err));
  }, []);

  // Mise à jour du profil
  const handleUpdate = async (e) => {
    e.preventDefault();
    const dataUpdate = {
      name,
      lastname,
      prenom,
      birth,
      lieu,
      nationality,
      address,
      current_status: currentStatus,
      date_emission: dateEmission,
      date_expiration: dateExpiration,
      date_entrance: dateEntrance,
      situation,
      tel,
      profession,
      email,
      pieces: piece,
      city,
      homeId: house
    };

    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/person/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataUpdate),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      await res.json();
      toast.success("Profil mis à jour avec succès !");
      navigate(`/detailUser/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur lors de la mise à jour");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            <div className="update-content">
              <h1 className="update-content-title">
                <i className="fa-solid fa-pen-to-square"></i> Mise à jour du profil locataire
              </h1>

              <div className="update-detail-form">
                {/* Carte infos actuelles */}
                <div className="update-detail-card">
                  <h2>Détails du locataire</h2>
                  <div className="detail-grid">
                    <div>
                      <p><strong>Nom :</strong> {person.name}</p>
                      <p><strong>Prénom :</strong> {person.prenom}</p>
                      <p><strong>Date de naissance :</strong> {person.birth}</p>
                      <p><strong>Lieu de naissance :</strong> {person.lieu}</p>
                      <p><strong>Nationalité :</strong> {person.nationality}</p>
                    </div>
                    <div>
                      <p><strong>Email :</strong> {person.email}</p>
                      <p><strong>Tel :</strong> {person.tel}</p>
                      <p><strong>Profession :</strong> {person.profession}</p>
                      <p><strong>Domicile :</strong> {person.address}</p>
                      <p><strong>Nº CNI/PAS :</strong> {person.pieces}</p>
                      <p><strong>Date d'entrée :</strong> {person.date_entrance}</p>
                      <p><strong>Statut :</strong> {person.current_status}</p>
                    </div>
                  </div>
                </div>

                {/* Formulaire de mise à jour */}
                <form className="update-form" onSubmit={handleUpdate}>
                  <h2>Modifier les informations</h2>
                  <div className="form-grid">
                    <input type="text" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required />
                    <input type="text" placeholder="Prénom(s)" value={prenom} onChange={e => setPrenom(e.target.value)} required />
                    <input type="date" placeholder="Date de naissance" value={birth} onChange={e => setBirth(e.target.value)} required />
                    <input type="text" placeholder="Lieu" value={lieu} onChange={e => setLieu(e.target.value)} required />
                    <input type="text" placeholder="Nationalité" value={nationality} onChange={e => setNationality(e.target.value)} required />
                    <input type="text" placeholder="Tel" value={tel} onChange={e => setTel(e.target.value)} required />
                    <input type="text" placeholder="Profession" value={profession} onChange={e => setProfession(e.target.value)} required />
                    <select value={sexe} onChange={e => setSexe(e.target.value)} required>
                      <option value="">Sexe</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="text" placeholder="Domicile" value={address} onChange={e => setAddress(e.target.value)} required />
                    <input type="date" placeholder="Date d'entrée" value={dateEntrance} onChange={e => setDateEntrance(e.target.value)} required />
                    <input type="text" placeholder="N° CNI ou Passeport" value={piece} onChange={e => setPiece(e.target.value)} required />
                    <input type="date" placeholder="Date d'émission" value={dateEmission} onChange={e => setDateEmission(e.target.value)} required />
                    <input type="date" placeholder="Date d'expiration" value={dateExpiration} onChange={e => setDateExpiration(e.target.value)} required />
                    <select 
                      value={house} 
                      onChange={e => setHouse(e.target.value)} 
                      disabled={Boolean(house)}
                    >
                      <option value="">Appartement(s) ou Villa(s)</option>
                      {rentHomes.map((home, idx) => (
                        <option key={idx} value={home._id}>
                          {home.categorie} - {home.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="btn-group">
                    <Link to={`/detailUser/${id}`}>
                      <button type="button" className="btn-cancel">Annuler</button>
                    </Link>
                    <button type="submit" className="btn-save">Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}