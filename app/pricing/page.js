"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main className="geo-bg min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Tarifs</h1>
        <p className="opacity-70 mb-12">Commencez gratuitement, débloquez tout quand vous êtes prêt.</p>

        <div className="grid md:grid-cols-2 gap-6 text-left">
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
            <p className="text-2xl font-bold mb-4">9,99 € / mois</p>
            <ul className="space-y-2 text-sm mb-6">
              <Item light>Cycle 1 (A1) complet</Item>
              <Item light>Révisions illimitées</Item>
              <Item light>Tableau de bord détaillé</Item>
              <Item light>Sans publicité</Item>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? "Redirection…" : "Passer Premium"}
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
