"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";

export default function LoginPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mode = activeIndex === 0 ? "login" : "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        setLoading(false);
        return;
      }

      if (data.isNew) {
        router.push("/import");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <Message severity="error" text={error} className="w-full" />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium text-color-secondary">
          Nom d&apos;utilisateur
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-color-secondary">
          Mot de passe
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
        className="w-full"
        size="large"
      />
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 text-white mb-3">
            <i className="pi pi-calendar-plus text-xl" />
          </div>
          <h1 className="text-2xl font-bold">Chiffrage</h1>
          <p className="text-sm text-color-secondary mt-1">Suivi du chiffrage quotidien</p>
        </div>

        <Card className="shadow-lg" style={{ borderRadius: "0.75rem" }}>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => {
              setActiveIndex(e.index);
              setError("");
            }}
          >
            <TabPanel header="Connexion" leftIcon="pi pi-sign-in mr-2">
              {formContent}
            </TabPanel>
            <TabPanel header="Inscription" leftIcon="pi pi-user-plus mr-2">
              {formContent}
            </TabPanel>
          </TabView>
        </Card>

        <p className="text-center text-[11px] text-color-secondary mt-4 opacity-50">
          &copy; {new Date().getFullYear()} Nathan
        </p>
      </div>
    </div>
  );
}
