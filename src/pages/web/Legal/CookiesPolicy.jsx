import { LegalPage } from "./LegalPage";

export function CookiesPolicy() {
  return (
    <LegalPage
      title="Política de cookies"
      updatedAt="3 de agosto, 2026"
      sections={[
        {
          heading: "1. Qué son las cookies",
          body: "Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Nos ayudan a que la plataforma funcione correctamente y a entender cómo la usas.",
        },
        {
          heading: "2. Qué cookies usamos",
          body: [
            "Cookies esenciales: necesarias para que funciones como iniciar sesión y mantener tu sesión activa.",
            "Cookies de análisis: nos ayudan a entender cómo los visitantes usan la plataforma, para mejorar la experiencia.",
          ],
        },
        {
          heading: "3. Cómo controlar las cookies",
          body: "Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una. Ten en cuenta que algunas funciones de la plataforma podrían no funcionar correctamente sin ellas.",
        },
        {
          heading: "4. Cambios en esta política",
          body: "Podemos actualizar esta política de cookies ocasionalmente. Cualquier cambio será publicado en esta misma página.",
        },
      ]}
    />
  );
}