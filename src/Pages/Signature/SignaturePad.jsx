import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-hot-toast";

export default function SignaturePad({ onSave }) {
  const sigCanvas = useRef({});
  const [trimmedDataURL, setTrimmedDataURL] = useState(null);

  // Effacer la signature
  const clear = () => {
    sigCanvas.current.clear();
    setTrimmedDataURL(null);
  };

  // Sauvegarder la signature
  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Veuillez signer avant d'enregistrer !");
      return;
    }
    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    setTrimmedDataURL(dataURL);

    if (onSave) {
      onSave(dataURL); // ✅ renvoie la signature à ton parent
    }
    toast.success("Signature enregistrée !");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h4>Signature électronique</h4>

      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "sigCanvas border rounded shadow"
        }}
      />

      <div style={{ marginTop: "10px" }}>
        <button className="btn__login" onClick={save}>Enregistrer</button>
        <button className="btn__cancel" onClick={clear}>Effacer</button>
      </div>

      {trimmedDataURL && (
        <div style={{ marginTop: "15px" }}>
          <p>Aperçu :</p>
          <img src={trimmedDataURL} alt="signature" width="250" />
        </div>
      )}
    </div>
  );
}