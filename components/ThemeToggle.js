"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("hub-theme", next ? "dark" : "light");
    } catch (e) {
      // localStorage no disponible (modo privado, etc.) — el toggle sigue
      // funcionando en esta sesión, solo no se recuerda para la próxima.
    }
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        border: "1px solid var(--border-strong)",
        background: "var(--surface-2)",
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
