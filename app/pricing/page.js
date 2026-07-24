"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("annual");

  async function handleUpgrade(plan) {
    setLoading(true);
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!data.url) {
      setLoading(false);
      alert(data.error ?? "Une erreur est survenue.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <main className="geo-bg min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Tarifs</h1>
        <p className="opacity-70 mb-3">
          30 jours d'essai gratuit sur tous les plans Premium — annulez à tout moment avant la fin de l'essai, sans frais.
        </p>
        <p className="text-xs opacity-50 mb-12">
          Une carte bancaire est demandée à l'inscription pour activer l'essai, mais vous n'êtes prélevé qu'à son terme.
        </p>

        <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
          <div className="bg-parchment text-ink rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-1">Gratuit</h2>
            <p className="text-2xl font-bold mb-4">0 €</p>
            <ul className="space-y-2 text-sm">
              <Item>2 premières unités du Cycle 1</Item>
              <Item>XP et série illimités</Item>
              <Item>1 révision par jour</Item>
            </ul>
          </div>

          <div className="bg-ink-2 border-2 border-gold rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-1 text-gold-light">Premium</h2>
            <p className="text-sm text-gold-light font-semibold mb-4">30 jours offerts, puis :</p>

            <div className="space-y-2 mb-5">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                  selectedPlan === "monthly" ? "border-gold bg-white/5" : "border-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Mensuel</span>
                  <span className="font-bold">9,99 € / mois</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("annual")}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition relative ${
                  selectedPlan === "annual" ? "border-gold bg-white/5" : "border-white/15"
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-gold text-[#241A02] text-[10px] font-black px-2 py-0.5 rounded-full">
                  -15%
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Annuel</span>
                  <span className="font-bold">101,90 € / an</span>
                </div>
                <p className="text-xs opacity-60 mt-1">soit 8,49 € / mois</p>
              </button>
            </div>

            <ul className="space-y-2 text-sm mb-6">
              <Item light>Cycle 1 (A1) complet</Item>
              <Item light>Révisions illimitées</Item>
              <Item light>Tableau de bord détaillé</Item>
              <Item light>Sans publicité</Item>
            </ul>
            <button
              onClick={() => handleUpgrade(selectedPlan)}
              disabled={loading}
              className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? "Redirection…" : "Démarrer l'essai gratuit"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Item({ children, light }) {
  return (
    <li className={`flex items-center gap-2 ${light ? "" : "text-ink"}`}>
      <Check size={16} className="text-teal shrink-0" /> {children}
    </li>
  );
}
