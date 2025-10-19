import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Locataires/Locataire.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstLogin, setFirstLogin] = useState(false);

  // Vérifier si c’est la première connexion
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const res = await fetch(`http://localhost:4000/persons/${id}`);
        const data = await res.json();
        if (res.ok) setFirstLogin(data.firstLogin);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPerson();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return toast.error("Tous les champs sont obligatoires.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Les nouveaux mots de passe ne correspondent pas.");
    }

    try {
      const body = firstLogin
        ? { newPassword } // pas besoin de l'ancien mot de passe
        : { oldPassword, newPassword };

      const res = await fetch(`http://localhost:4000/persons/${id}/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur lors de la modification du mot de passe.");

      toast.success("Mot de passe modifié avec succès !");
      navigate("/login-locataire");
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur.");
    }
  };

  return (
    <div className="container-locataire">
      <div className="card-locataire">
        <h2>Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit} className="form-locataire">
          {!firstLogin && (
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input
                type="password"
                placeholder="Entrez votre ancien mot de passe"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Entrez un nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Confirmez le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-locataire">
            Mettre à jour
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}