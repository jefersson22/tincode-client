import { useState } from "react";

export function Contact() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="ui container" style={{ marginTop: "40px" }}>
      <h1 className="ui header">Contacto</h1>
      
      <form className="ui form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Suscríbete a nuestro newsletter</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <button className="ui primary button" type="submit">
          Suscribirme
        </button>
      </form>

      {enviado && (
        <div className="ui positive message" style={{ marginTop: "20px" }}>
          ¡Gracias! Te has suscrito con el correo: {correo}
        </div>
      )}
    </div>
  );
}