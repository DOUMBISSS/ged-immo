import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://backend-ged-immo.onrender.com/confirm/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success(data.message);
          setTimeout(() => navigate("/"), 2000);
        } else {
          toast.error(data.message || "Lien invalide ou expiré ❌");
        }
      })
      .catch(() => toast.error("Erreur confirmation email ❌"));
  }, [token, navigate]);

  return <p>Confirmation en cours...</p>;
}