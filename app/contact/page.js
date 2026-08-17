"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue. Réessayez.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm text-center float-in">
          <h1 className="text-xl font-bold mb-3">Message envoyé ✓</h1>
          <p className="text-base opacity-70 mb-6">
            Merci, nous vous répondrons rapidement à l'adresse indiquée.
          </p>
          <Link href="/" className="underline text-base opacity-70 hover:opacity-100">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="geo-bg min-h-screen flex items-center justify-center px-4 py-16">
      <form onSubmit={handleSubmit} className="bg-parchment text-ink rounded-2xl p-8 w-full max-w-sm float-in">
        <Link href="/" className="block">
          <img src="/logo-mark.png" alt="Arabiya+" className="h-24 w-auto mx-auto mb-5" />
        </Link>
        <h1 className="text-xl font-bold mb-2">Nous contacter</h1>
        <p className="text-base opacity-70 mb-6">
          Une question, un problème technique, une suggestion ? Écrivez-nous.
        </p>

        <label className="block text-base font-semibold mb-1">Nom</label>
        <input
          type="text"
          required
          minLength={2}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        <label className="block text-base font-semibold mb-1">Sujet</label>
        <input
          type="text"
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Facultatif"
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4"
        />

        <label className="block text-base font-semibold mb-1">Message</label>
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border-2 border-black/10 rounded-xl px-3 py-2 mb-4 resize-none"
        />

        {error && <p className="text-rust text-base mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le message"}
        </button>
      </form>
    </main>
  );
}

