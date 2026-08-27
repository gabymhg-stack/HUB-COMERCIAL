import "./globals.css";

export const metadata = {
  title: "HUB Control Comercial",
  description: "Panel operativo del equipo comercial de POP",
};

// Corre antes de pintar la página para que no haya un parpadeo de modo
// claro seguido de un salto a oscuro al cargar (se guarda por navegador,
// no por servidor, así que solo se puede saber leyendo localStorage aquí).
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("hub-theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
