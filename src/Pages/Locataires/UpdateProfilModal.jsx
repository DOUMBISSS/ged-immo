import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";

export default function UpdateProfilModal({ person, isOpen, onClose, onUpdate }) {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  // --- Champs communs ---
  const [countryCode, setCountryCode] = useState("+225");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // --- Champs particulier ---
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [profession, setProfession] = useState("");
  const [situation, setSituation] = useState("");
  const [pieces, setPiece] = useState("");
  const [dateEmission, setDateEmission] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");
  const [dateEntrance, setDateEntrance] = useState("");

  // --- Champs société ---
  const [raisonSociale, setRaisonSociale] = useState("");
  const [rccm, setRccm] = useState("");
  const [ifu, setIfu] = useState("");
  const [responsable, setResponsable] = useState("");
  const [siegeSocial, setSiegeSocial] = useState("");
  const [domaineActivite, setDomaineActivite] = useState("");

  // --- Type de personne ---
  const typePersonne = person?.typePersonne || "particulier";

  // 🧩 Pré-remplir les champs selon le type
  useEffect(() => {
    if (!person || !isOpen) return;

    setTel(person.tel?.replace(/^(\+\d{1,3})/, "") || "");
    setEmail(person.email || "");
    setAddress(person.address || "");
    setCity(person.city || "");

    // --- particulier ---
    if (typePersonne === "particulier") {
      setName(person.name || "");
      setLastname(person.lastname || "");
      setProfession(person.profession || "");
      setSituation(person.situation || "");
      setPiece(person.pieces || "");
      setDateEmission(person.date_emission || "");
      setDateExpiration(person.date_expiration || "");
      setDateEntrance(person.date_entrance || "");
    }

    // --- société ---
    if (typePersonne === "societe") {
      setRaisonSociale(person.raisonSociale || "");
      setRccm(person.rccm || "");
      setIfu(person.ifu || "");
      setResponsable(person.responsable || "");
      setSiegeSocial(person.siegeSocial || "");
      setDomaineActivite(person.domaineActivite || "");
    }

    // Déterminer l'indicatif du téléphone
    if (person.tel) {
      if (person.tel.startsWith("+33")) setCountryCode("+33");
      else if (person.tel.startsWith("+1")) setCountryCode("+1");
      else if (person.tel.startsWith("+221")) setCountryCode("+221");
      else if (person.tel.startsWith("+226")) setCountryCode("+226");
      else setCountryCode("+225");
    }
  }, [person, isOpen, typePersonne]);

  // 🧠 Soumission avec confirmation
  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setConfirmModal(false);
    if (!user?._id) {
      toast.error("Utilisateur non connecté !");
      return;
    }

    const fullTel = `${countryCode}${tel}`;

   const dataUpdate = {
      typePersonne, // ✅ très important
  tel: fullTel,
  email,
  address,
  city,
  updatedBy: `${user.fullname || user.name || "Utilisateur"} (${user.role || "Admin"})`,
};

    // Ajouter dynamiquement selon type
   // Ajout conditionnel
if (typePersonne === "particulier") {
  Object.assign(dataUpdate, {
    name,
    lastname,
    profession,
    situation,
    pieces,
    date_emission: dateEmission,
    date_expiration: dateExpiration,
    date_entrance: dateEntrance,
  });
} else if (typePersonne === "societe") {
  Object.assign(dataUpdate, {
    raisonSociale,
    rccm,
    ifu,
    responsable,
    siegeSocial,
    domaineActivite,
  });
}

    try {
      const res = await fetch(`http://localhost:4000/update/locataire/${person._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(dataUpdate),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.message || "Erreur serveur lors de la mise à jour");
        return;
      }

      toast.success("Profil mis à jour avec succès !");
      onUpdate && onUpdate();
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Erreur serveur :", err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-container">
        <div className="modal-contents">
          <div className="modal-header">
            <h2>
              <i className="fa-solid fa-user-pen"></i> 
              Mise à jour {typePersonne === "societe" ? "de la société" : "du locataire"}
            </h2>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>

          <form className="modal-body form-grid" onSubmit={handleSubmit}>
            {/* --- Champs communs --- */}
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Indicatif</label>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="+225">Côte d’Ivoire (+225)</option>
                <option value="+33">France (+33)</option>
                <option value="+1">USA (+1)</option>
                <option value="+221">Sénégal (+221)</option>
                <option value="+226">Burkina Faso (+226)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Numéro sans indicatif"
                required
              />
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Ville</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            {/* --- Si particulier --- */}
            {typePersonne === "particulier" && (
              <>
                <div className="form-group"><label>Nom</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group"><label>Prénom</label>
                  <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                </div>
                <div className="form-group"><label>Profession</label>
                  <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>
                <div className="form-group"><label>Situation matrimoniale</label>
                  <select value={situation} onChange={(e) => setSituation(e.target.value)}>
                    <option value="">Sélectionner</option>
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Veuf(ve)">Veuf(ve)</option>
                  </select>
                </div>
                <div className="form-group"><label>N° CNI / Passeport</label>
                  <input type="text" value={pieces} onChange={(e) => setPiece(e.target.value)} />
                </div>
                <div className="form-group"><label>Date d’émission</label>
                  <input type="date" value={dateEmission} onChange={(e) => setDateEmission(e.target.value)} />
                </div>
                <div className="form-group"><label>Date d’expiration</label>
                  <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} />
                </div>
                <div className="form-group"><label>Date d’entrée</label>
                  <input type="date" value={dateEntrance} onChange={(e) => setDateEntrance(e.target.value)} />
                </div>
              </>
            )}

            {/* --- Si société --- */}
            {typePersonne === "societe" && (
              <>
                <div className="form-group"><label>Raison sociale</label>
                  <input type="text" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} />
                </div>
                <div className="form-group"><label>RCCM</label>
                  <input type="text" value={rccm} onChange={(e) => setRccm(e.target.value)} />
                </div>
                <div className="form-group"><label>IFU</label>
                  <input type="text" value={ifu} onChange={(e) => setIfu(e.target.value)} />
                </div>
                <div className="form-group"><label>Responsable</label>
                  <input type="text" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
                </div>
                <div className="form-group"><label>Siège social</label>
                  <input type="text" value={siegeSocial} onChange={(e) => setSiegeSocial(e.target.value)} />
                </div>
                <div className="form-group"><label>Domaine d’activité</label>
                  <input type="text" value={domaineActivite} onChange={(e) => setDomaineActivite(e.target.value)} />
                </div>
              </>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation */}
      {confirmModal && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirmer la mise à jour</h3>
            <p>Voulez-vous vraiment enregistrer ces modifications ?</p>
            <div className="confirm-buttons">
              <button className="btn-secondary" onClick={() => setConfirmModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={confirmUpdate}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-container {
          position: fixed; top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.4);
          display:flex; justify-content:center; align-items:flex-start;
          padding: 50px 20px; overflow-y:auto; z-index:1000;
        }
        .modal-contents {
          background: #fff; border-radius:12px; width: 80%; max-width:600px;
          box-shadow:0 8px 25px rgba(0,0,0,0.2);
          animation: scaleIn 0.3s ease-in-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity:0 }
          to { transform: scale(1); opacity:1 }
        }
        .modal-header {
          display:flex; justify-content:space-between; align-items:center;
          padding:20px; border-bottom:1px solid #eee;
        }
        .modal-body {
          padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;
        }
        .form-group { display:flex; flex-direction:column; }
        .form-group label { margin-bottom:5px; font-weight:500; }
        .form-group input, .form-group select {
          padding:10px; border-radius:6px; border:1px solid #ccc; font-size:1rem;
        }
        .modal-footer {
          grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px;
          padding-top:10px; border-top:1px solid #eee;
        }
        .btn-primary {
          background:#2563eb; color:#fff; border:none; padding:10px 20px;
          border-radius:6px; cursor:pointer; font-weight:600;
        }
        .btn-secondary {
          background:#f44336; color:#fff; border:none; padding:10px 20px;
          border-radius:6px; cursor:pointer; font-weight:600;
        }
        .confirm-overlay {
          position: fixed; top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.5);
          display:flex; justify-content:center; align-items:center;
          z-index:2000;
        }
        .confirm-box {
          background:#fff; padding:25px; border-radius:10px;
          max-width:400px; text-align:center; box-shadow:0 6px 20px rgba(0,0,0,0.3);
        }
        .confirm-buttons {
          display:flex; justify-content:center; gap:15px; margin-top:20px;
        }
      `}</style>
    </>
  );
}