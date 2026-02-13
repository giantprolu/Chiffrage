"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { login, register } from "@/lib/services";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
                <Message severity="error" text={error} className="w-full" />
              )}

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="pi pi-user" style={{ fontSize: 10 }} /> Nom d&apos;utilisateur
                </label>
                <InputText
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  required
                  autoFocus
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="pi pi-lock" style={{ fontSize: 10 }} /> Mot de passe
                </label>
                <Password
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  toggleMask
                  feedback={mode === "register"}
                  required
                  className="w-full"
                  inputClassName="w-full"
                  pt={{ input: { minLength: 4 } }}
                />
              </div>

              <Button
                type="submit"
                label={
                  loading
                    ? "Chargement..."
                    : mode === "login"
                    ? "Se connecter"
                    : "Créer le compte"
                }
                icon={loading ? "pi pi-spin pi-spinner" : mode === "login" ? "pi pi-sign-in" : "pi pi-user-plus"}
                loading={loading}
                disabled={loading}
                className="w-full login-submit-btn"
                size="large"
              />
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
