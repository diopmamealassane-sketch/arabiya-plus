"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="geo-bg min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm float-in">
        <img src="/logo-mark.png" alt="Arabiya+" className="h-24 w-auto mx-auto mb-5" />
        <h1 className="text-xl font-bold mb-6">Se connecter</h1>
        <label className="block text-base font-semibold mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />
        <label className="block text-base font-semibold mb-1">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />
        {error && <p className="text-rust text-base mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <p className="text-base text-center mt-4 opacity-70">
          Pas de compte ? <Link href="/signup" className="underline">Inscrivez-vous</Link>
        </p>
      </form>
    </main>
  );
}
