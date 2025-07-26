import React, { useState } from "react";

export default function SupervisorAdmin() {
  const [form, setForm] = useState({
    resid: "",
    lastName: "",
    firstName: "",
    email: "",
    service: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/supervisor-admin/create-supervisor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": "SecretGetOut",
      },
      body: JSON.stringify({
        resid: form.resid,
        nom: form.lastName,
        prenom: form.firstName,
        email: form.email,
        service: form.service,
        password: form.password,
      }),
    });
    const data = await res.json();
    setStatus(data.success ? "Compte Responsable de Stage créé avec succès!" : data.error);
    if (data.success) {
      setForm({
        resid: "",
        lastName: "",
        firstName: "",
        email: "",
        service: "",
        password: "",
      });
      setTimeout(() => setStatus(""), 4000);
    }
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', 'Poppins', Arial, sans-serif;
          background: linear-gradient(135deg, #fbe9e7 0%, #f8fafc 100%);
          min-height: 100vh;
        }
        .supervisoradmin-bg {
          min-height: 100vh;
        }
        .supervisoradmin-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          padding-top: 60px;
        }
        .supervisoradmin-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(229, 28, 35, 0.10);
          max-width: 420px;
          width: 100%;
          padding: 32px 28px 24px 28px;
          margin-bottom: 32px;
        }
        .supervisoradmin-title {
          font-size: 2rem;
          font-weight: 700;
          color: #e51c23;
          margin-bottom: 8px;
          text-align: center;
        }
        .supervisoradmin-subtitle {
          color: #b71c1c;
          font-size: 1rem;
          text-align: center;
          margin-bottom: 24px;
        }
        .supervisoradmin-label {
          font-weight: 500;
          color: #b71c1c;
          margin-bottom: 6px;
          display: block;
        }
        .supervisoradmin-input-row {
          margin-bottom: 18px;
        }
        .supervisoradmin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .supervisoradmin-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          background: #fbe9e7;
          transition: border 0.2s;
          box-sizing: border-box;
          height: 44px;
        }
        .supervisoradmin-input:focus {
          border: 1.5px solid #e51c23;
          outline: none;
          background: #fff;
        }
        .supervisoradmin-password-row {
          display: flex;
          align-items: center;
        }
        .supervisoradmin-password-toggle {
          background: none;
          border: none;
          margin-left: -36px;
          cursor: pointer;
          color: #b71c1c;
          font-size: 1.1rem;
        }
        .supervisoradmin-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #e51c23 0%, #b71c1c 100%);
          color: #fff;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(229, 28, 35, 0.10);
        }
        .supervisoradmin-btn:hover {
          background: linear-gradient(90deg, #b71c1c 0%, #e51c23 100%);
          box-shadow: 0 4px 16px rgba(229, 28, 35, 0.18);
        }
        .supervisoradmin-status {
          text-align: center;
          margin-top: 16px;
          font-weight: 600;
          color: #16a34a;
          background: #f0fdf4;
          border-radius: 6px;
          padding: 10px 0;
          font-size: 1rem;
        }
        .supervisoradmin-status.error {
          color: #e51c23;
          background: #fef2f2;
        }
        @media (max-width: 500px) {
          .supervisoradmin-card { padding: 18px 6px 16px 6px; }
        }
        .supervisoradmin-header {
          width: 100vw;
          background: linear-gradient(90deg, #e51c23 0%, #b71c1c 100%);
          padding: 0 0;
          min-height: 60px;
          box-shadow: 0 2px 8px rgba(229, 28, 35, 0.10);
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }
        .supervisoradmin-header-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .supervisoradmin-header-left {
          display: flex;
          align-items: center;
        }
        .supervisoradmin-header-logo {
          background: transparent;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }
        .supervisoradmin-header-title {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .supervisoradmin-header-right {
          display: flex;
          align-items: center;
        }
        .supervisoradmin-header-admin-badge {
          background: #e5e7eb;
          color: #b71c1c;
          font-weight: 600;
          border-radius: 12px;
          padding: 6px 18px;
          font-size: 1rem;
          margin-left: 8px;
        }
      `}</style>
      <div style={{ height: 24 }}></div>
      <div className="supervisoradmin-bg">
        <div className="supervisoradmin-center">
          <div className="supervisoradmin-card">
            <img
              src="https://companieslogo.com/img/orig/KO-b23a2a5e.png?t=1720244492"
              alt="Coca-Cola Logo"
              style={{ height: 48, display: 'block', margin: '0 auto 16px auto', background: 'white', borderRadius: '50%', padding: 6 }}
            />
            <div className="supervisoradmin-title">Super Admin</div>
            <div className="supervisoradmin-subtitle">Créer un compte Responsable de Stage</div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="resid">Identifiant Responsable *</label>
                <div className="supervisoradmin-input-wrapper">
                  <input
                    className="supervisoradmin-input"
                    type="text"
                    name="resid"
                    id="resid"
                    value={form.resid}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="lastName">Nom *</label>
                <div className="supervisoradmin-input-wrapper">
                  <input
                    className="supervisoradmin-input"
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="firstName">Prénom *</label>
                <div className="supervisoradmin-input-wrapper">
                  <input
                    className="supervisoradmin-input"
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="email">Email *</label>
                <div className="supervisoradmin-input-wrapper">
                  <input
                    className="supervisoradmin-input"
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="service">Service *</label>
                <div className="supervisoradmin-input-wrapper">
                  <select
                    className="supervisoradmin-input"
                    name="service"
                    id="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Production">Production</option>
                    <option value="Logistique">Logistique</option>
                    <option value="Qualité">Qualité</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Sécurité">Sécurité</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Achats">Achats</option>
                    <option value="Juridique">Juridique</option>
                    <option value="Communication">Communication</option>
                    <option value="Formation">Formation</option>
                  </select>
                </div>
              </div>
              <div className="supervisoradmin-input-row">
                <label className="supervisoradmin-label" htmlFor="password">Mot de passe *</label>
                <div className="supervisoradmin-input-wrapper" style={{ position: "relative" }}>
                  <input
                    className="supervisoradmin-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="supervisoradmin-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 0 1 4.06-5.26" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="7.5" stroke="#b71c1c" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#b71c1c" strokeWidth="2"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button className="supervisoradmin-btn" type="submit">
                Créer le compte Responsable de Stage
              </button>
              {status && (
                <div className={`supervisoradmin-status${status.toLowerCase().includes("succès") ? "" : " error"}`}>
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 