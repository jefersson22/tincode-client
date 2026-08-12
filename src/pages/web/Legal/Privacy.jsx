import { LegalPage } from "./LegalPage";

export function Privacy() {
  return (
    <LegalPage
      title="Política de privacidad"
      updatedAt="3 de agosto, 2026"
      sections={[
        {
          heading: "1. Qué información recopilamos",
          body: "Recopilamos la información que nos proporcionas directamente, como tu nombre y correo electrónico al crear una cuenta, suscribirte al newsletter o contactarnos.",
        },
        {
          heading: "2. Cómo usamos tu información",
          body: [
            "Usamos tu información para brindarte acceso a los cursos y contenido de la plataforma, enviarte actualizaciones sobre nuevos artículos y cursos si estás suscrito al newsletter, y responder a tus consultas de soporte.",
            "No vendemos ni compartimos tu información personal con terceros con fines publicitarios.",
          ],
        },
        {
          heading: "3. Almacenamiento y seguridad",
          body: "Tu información se almacena de forma segura y solo el personal autorizado tiene acceso a ella. Tomamos medidas razonables para proteger tus datos contra accesos no autorizados.",
        },
        {
          heading: "4. Tus derechos",
          body: "Puedes solicitar en cualquier momento acceder, corregir o eliminar tu información personal, así como darte de baja del newsletter usando el enlace incluido en cada correo.",
        },
        {
          heading: "5. Cambios en esta política",
          body: "Podemos actualizar esta política periódicamente. Te recomendamos revisarla de vez en cuando para estar al tanto de cualquier cambio.",
        },
      ]}
    />
  );
}