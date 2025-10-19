import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function Signature() {
  const sigCanvas = useRef({});
  const [imageURL, setImageURL] = useState(null);

  const clear = () => sigCanvas.current.clear();
  const save = () => setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));

  return (
    <div>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={clear}>Effacer</button>
        <button onClick={save}>Enregistrer</button>
      </div>

      {imageURL && (
        <div>
          <h5>Signature sauvegardée :</h5>
          <img src={imageURL} alt="Signature" style={{ border: '1px solid #000' }} />
        </div>
      )}
    </div>
  );
}