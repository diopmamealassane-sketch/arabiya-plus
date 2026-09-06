"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // checking → ready → done, ou invalid si le lien est périmé/déjà utilisé
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
        setStatus("ready");
      }
    });

    async function resolveSession() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      // Lien expiré ou déjà consommé : Supabase renvoie l'erreur dans l'URL.
      if (url.searchParams.get("error") || hash.get("error")) {
        if (!cancelled) setStatus("invalid");
        return;
      }

      // supabase-js échange automatiquement le code présent dans l'URL,
      // mais c'est asynchrone : on laisse jusqu'à 3 secondes.
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setStatus("ready");
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      // Filet de sécurité : échange manuel si l'auto-détection n'a rien fait.
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (!error) {
          setStatus("ready");
          return;
        }
      }

      if (!cancelled) setStatus("invalid");
    }

    resolveSession();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré — redemandez-en un.");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  }

  if (status === "checking") {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <p className="text-base opacity-70">Vérification du lien…</p>
        </div>
      </main>
    );
  }

  if (status === "invalid") {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <Link href="/" className="block">
            <img src="/logo-mark.png" alt="Arabiya+" className="h-24 w-auto mx-auto mb-5" />
          </Link>
          <h1 className="text-xl font-bold mb-3">Lien expiré</h1>
          <p className="text-base opacity-70 mb-5">
            Ce lien de réinitialisation n'est plus valable (il expire après 1 heure
            et ne fonctionne qu'une seule fois).
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="block w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <h1 className="text-xl font-bold mb-3">Mot de passe modifié</h1>
          <p className="text-base opacity-70 mb-4">
            Vous êtes connecté. Redirection vers votre tableau de bord…
          </p>
          <Link href="/dashboard" className="underline text-base">Continuer maintenant</Link>
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
        <h1 className="text-xl font-bold mb-6">Nouveau mot de passe</h1>

        <label className="block text-base font-semibold mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

        <label className="block text-base font-semibold mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

        {error && <p className="text-rust text-base mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
