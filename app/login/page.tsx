"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/services";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mode = activeTab;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fn = mode === "login" ? login : register;
      const data = await fn(username, password);

      if (data.isNew) {
        router.push("/import");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container animate-fade-in">
        {/* Left visual panel */}
        <div className="login-visual">
          <div className="login-visual-content">
            <div className="login-visual-icon">
              <i className="pi pi-calendar-plus" />
            </div>
            <h1 className="login-visual-title">Chiffrage</h1>
            <p className="login-visual-desc">Suivi du chiffrage quotidien</p>
            <div className="login-visual-features">
              <div className="login-feature"><i className="pi pi-check-circle" /> Saisie rapide</div>
              <div className="login-feature"><i className="pi pi-chart-bar" /> Statistiques</div>
              <div className="login-feature"><i className="pi pi-download" /> Export Excel & CSV</div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            {/* Tab switcher */}
            <div className="login-tabs">
              <button
                className={`login-tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => { setActiveTab("login"); setError(""); }}
              >
                <i className="pi pi-sign-in" />
                Connexion
              </button>
              <button
                className={`login-tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => { setActiveTab("register"); setError(""); }}
              >
                <i className="pi pi-user-plus" />
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <i className="pi pi-exclamation-circle" style={{ marginRight: 8 }} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="pi pi-user" style={{ fontSize: 10 }} /> Nom d&apos;utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  required
                  autoFocus
                  className="c-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="pi pi-lock" style={{ fontSize: 10 }} /> Mot de passe
                </label>
                <div className="password-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    minLength={4}
                    className="c-input"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading}
              >
                {loading ? (
                  <><i className="pi pi-spinner spinner" /> Chargement...</>
                ) : mode === "login" ? (
                  <><i className="pi pi-sign-in" /> Se connecter</>
                ) : (
                  <><i className="pi pi-user-plus" /> Créer le compte</>
                )}
              </button>
            </form>

            <p className="login-footer">
              &copy; {new Date().getFullYear()} Nathan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
