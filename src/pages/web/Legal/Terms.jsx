import { LegalPage } from "./LegalPage";

export function Terms() {
  return (
    <LegalPage
      title="Términos de uso"
      updatedAt="3 de agosto, 2026"
      sections={[
        {
          heading: "1. Aceptación de los términos",
          body: "Al acceder y usar TinCode, aceptas estos términos de uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma.",
        },
        {
          heading: "2. Uso de la plataforma",
          body: "TinCode ofrece cursos, artículos y contenido educativo relacionado con programación. Te comprometes a usar la plataforma únicamente con fines lícitos y a no interferir con su funcionamiento normal.",
        },
        {
          heading: "3. Cuentas de usuario",
          body: "Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de todas las actividades que ocurran bajo tu cuenta.",
        },
        {
          heading: "4. Propiedad intelectual",
          body: "Todo el contenido de los cursos, artículos del blog y materiales descargables son propiedad de TinCode o de sus respectivos autores, y están protegidos por leyes de propiedad intelectual.",
        },
        {
          heading: "5. Cambios en los términos",
          body: "Podemos actualizar estos términos en cualquier momento. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico.",
        },
        {
          heading: "6. Contacto",
          body: "Si tienes preguntas sobre estos términos, puedes escribirnos a través de nuestra página de contacto.",
        },
      ]}
    />
  );
}