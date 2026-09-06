"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordClient() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });

    setLoading(false);

    if (error) {
      // Supabase ne révèle pas si l'email existe ; une erreur ici est
      // presque toujours une limite d'envoi atteinte.
      setError("Trop de demandes en peu de temps. Patientez quelques minutes avant de réessayer.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <Link href="/" className="block">
            <img src="/logo-mark.png" alt="Arabiya+" className="h-24 w-auto mx-auto mb-5" />
          </Link>
          <h1 className="text-xl font-bold mb-3">Vérifiez votre email</h1>
          <p className="text-base opacity-70 mb-4">
            Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation
            vient d'être envoyé. Il est valable 1 heure.
          </p>
          <p className="text-sm opacity-60 mb-4">
            Vous ne le voyez pas ? Vérifiez vos <strong>spams / courriers indésirables</strong>.
          </p>
          <Link href="/login" className="underline text-base">Retour à la connexion</Link>
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
        <h1 className="text-xl font-bold mb-2">Mot de passe oublié</h1>
        <p className="text-base opacity-70 mb-6">
          Saisissez l'adresse email de votre compte. Nous vous enverrons un lien
          pour choisir un nouveau mot de passe.
        </p>

        <label className="block text-base font-semibold mb-1">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

        {error && <p className="text-rust text-base mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>

        <p className="text-base text-center mt-4 opacity-70">
          Vous vous en souvenez ? <Link href="/login" className="underline">Connectez-vous</Link>
        </p>
      </form>
    </main>
  );
}
