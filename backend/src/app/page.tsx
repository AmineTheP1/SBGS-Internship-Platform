import Link from "next/link";

export default function CentralHub() {
  return (
    
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fbe9e7 0%, #f8fafc 100%)"
    }}>
      <h1 style={{ fontSize: "2.5rem", color: "#e51c23", marginBottom: 8, fontWeight: 700 }}>Bienvenue sur la Plateforme SBGS</h1>
      <p style={{ color: "#b71c1c", fontSize: "1.2rem", marginBottom: 32 }}>Choisissez une section pour continuer :</p>
      <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
        <Link href="/super-admin"
          style={{
            padding: "16px 32px",
            background: "linear-gradient(90deg, #e51c23 0%, #b71c1c 100%)",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "1.1rem",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(229, 28, 35, 0.10)",
            transition: "background 0.2s, box-shadow 0.2s",
            width: "fit-content"
          }}
        >
          Créer un compte RH
        </Link>
        <Link href="/supervisor-admin"
          style={{
            padding: "16px 32px",
            background: "linear-gradient(90deg, #e51c23 0%, #b71c1c 100%)",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "1.1rem",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(229, 28, 35, 0.10)",
            transition: "background 0.2s, box-shadow 0.2s"
          }}
        >
          Créer un compte responsable de stage
        </Link>
      </div>
    </div>
  );
}
