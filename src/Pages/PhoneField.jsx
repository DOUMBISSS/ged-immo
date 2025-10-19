import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";

export default function PhoneField({ value, onChange }) {
  const [phone, setPhone] = useState(value || "");

  const handleChange = (number, data) => {
    setPhone(number);
    onChange(number); // remonte la valeur vers le parent
  };

  const validatePhone = (number, country) => {
    // Exemple : Côte d'Ivoire 10 chiffres, Sénégal 9 chiffres, etc.
    const lengths = {
      ci: 10,
      sn: 9,
      bf: 8,
      fr: 9,
      us: 10,
    };

    const countryCode = country.countryCode;
    const expectedLength = lengths[countryCode];

    const numeric = number.replace(/\D/g, ""); // retirer les caractères non numériques
    if (expectedLength && numeric.length !== expectedLength) {
      toast.error(`Le numéro pour ${country.name} doit comporter ${expectedLength} chiffres.`);
      return false;
    }
    return true;
  };

  return (
    <PhoneInput
      country={"ci"}
      value={phone}
      onChange={handleChange}
      onlyCountries={["ci", "sn", "bf", "fr", "us"]}
      countryCodeEditable={false}
      disableDropdown={false}
      isValid={(value, country) => validatePhone(value, country)}
      inputStyle={{ width: "100%", height: "38px", borderRadius: "6px", border: "1px solid #ccc" }}
      specialLabel=""
    />
  );
}