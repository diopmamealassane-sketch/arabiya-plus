import Link from "next/link";
import { ArrowRight, Volume2, Repeat, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="geo-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <nav className="flex items-center justify-between mb-20">
          <img src="/logo-mark.png" alt="Arabiya+" className="h-10 w-auto" />
          <div className="flex gap-6 items-center text-sm">
            <Link href="/test-niveau" className="opacity-80 hover:opacity-100">Test de niveau</Link>
            <Link href="/pricing" className="opacity-80 hover:opacity-100">Tarifs</Link>
            <Link href="/login" className="opacity-80 hover:opacity-100">Se connecter</Link>
            <Link
              href="/signup"
              className="bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-4 py-2 rounded-xl text-sm"
            >
              Commencer
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-2xl mx-auto float-in">
          <p className="text-gold-light uppercase tracking-widest text-xs font-semibold mb-4">
            Pour francophones débutants
          </p>
          <h1 className="arabic text-6xl mb-6" dir="rtl">
            مَرْحَبًا بِكَ
          </h1>
          <p className="text-2xl font-semibold mb-4">Apprenez l'arabe, vraiment.</p>
          <p className="opacity-80 mb-10">
            Alphabet, prononciation native, vocabulaire vocalisé et révisions
            intelligentes — une progression structurée du niveau débutant à
            l'aisance conversationnelle.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-8 py-4 rounded-2xl"
          >
            Commencer gratuitement <ArrowRight size={18} />
          </Link>
          <div className="mt-4">
            <Link href="/test-niveau" className="text-sm underline opacity-70 hover:opacity-100">
              Déjà quelques bases ? Testez votre niveau gratuitement
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <Feature icon={<Volume2 />} title="Audio natif">
            Chaque mot est vocalisé (الحركات) et prononcé par un locuteur natif.
          </Feature>
          <Feature icon={<Repeat />} title="Révision intelligente">
            Un système de répétition espacée fait ressurgir les mots avant que vous ne les oubliiez.
          </Feature>
          <Feature icon={<Trophy />} title="Progression motivante">
            XP, séries quotidiennes et parcours structuré niveau par niveau.
          </Feature>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-6">
      <div className="text-gold-light mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-70">{children}</p>
    </div>
  );
}
