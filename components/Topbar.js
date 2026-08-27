import Link from "next/link";
import { signOut } from "@/app/actions";

export default function Topbar({ profile, active }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            P
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>HUB Control Comercial</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>POP</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          <NavLink href="/" label="Pendientes" activeKey="pendientes" active={active} />
          <NavLink href="/proyectos" label="Proyectos" activeKey="proyectos" active={active} />
          {profile?.sees_all && <NavLink href="/ajustes" label="Ajustes" activeKey="ajustes" active={active} />}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: profile?.color,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {profile?.name?.slice(0, 1)}
        </span>
        <div style={{ fontSize: 12.5 }}>
          <div style={{ fontWeight: 700 }}>{profile?.name}</div>
          <div style={{ color: "var(--ink-muted)" }}>{profile?.role}</div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface-2)",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

function NavLink({ href, label, activeKey, active }) {
  const isActive = active === activeKey;
  return (
    <Link
      href={href}
      style={{
        padding: "7px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        color: isActive ? "var(--accent-ink)" : "var(--ink-2)",
        background: isActive ? "var(--accent)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}
