import "./globals.css";

export const metadata = {
  title: "HUB Control Comercial",
  description: "Panel operativo del equipo comercial de POP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
