"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          display_name: displayName.trim(),
        },
        // Sans ceci, le lien de confirmation renvoie vers l'URL "Site URL"
        // par défaut configurée dans Supabase (probablement la page
        // d'accueil) au lieu du dashboard — un clic perdu de plus dans
        // le funnel inscription → première leçon.
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <h1 className="text-xl font-bold mb-3">Vérifiez votre email</h1>
          <p className="text-base opacity-70 mb-4">
            Un lien de confirmation vient de vous être envoyé à <strong>{email}</strong>.
            Cliquez dessus pour activer votre compte et accéder directement à votre parcours.
          </p>
          <p className="text-sm opacity-60">
            Vous ne le voyez pas ? Vérifiez vos <strong>spams / courriers indésirables</strong> —
            ou <Link href="/login" className="underline">réessayez de vous connecter</Link> dans
            quelques minutes.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="geo-bg min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm float-in">
        <Link href="/" className="block">
          <img src="/logo-mark.png" alt="Arabiya+" className="h-24 w-auto mx-auto mb-5" />
        </Link>
        <h1 className="text-xl font-bold mb-6">Créer un compte</h1>

        <label className="block text-base font-semibold mb-1">Nom et prénom</label>
        <input
          type="text"
          required
          minLength={2}
          maxLength={60}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Utilisé sur votre certificat"
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

        <label className="block text-base font-semibold mb-1">Pseudo</label>
        <input
          type="text"
          required
          minLength={2}
          maxLength={24}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Affiché sur le classement"
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

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
          minLength={6}
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
          {loading ? "Création…" : "Créer mon compte"}
        </button>
        <p className="text-base text-center mt-4 opacity-70">
          Déjà inscrit ? <Link href="/login" className="underline">Connectez-vous</Link>
        </p>
      </form>
    </main>
  );
}
