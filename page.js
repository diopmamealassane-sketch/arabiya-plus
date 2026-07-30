import Link from "next/link";
import { ArrowRight, Volume2, Repeat, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="geo-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <nav className="flex items-center justify-between mb-20">
          <img src="/images/logo-mark.png" alt="Arabiya+" className="h-10 w-auto" />
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
          <p className="text-gold-light uppercase tracking-widest text-xs font-semibold mb-16 md:mb-24">
            Pour francophones débutants
          </p>
          <h1 className="arabic text-6xl mt-12 mb-14 md:mt-16 md:mb-20" dir="rtl">
            مَرْحَبًا بِكَ
          </h1>
          <p className="text-2xl font-semibold mb-4">Apprenez l'arabe, vraiment.</p>
          <p className="opacity-80 mb-10">
            Alphabet, prononciation native, vocabulaire vocalisé et révisions
            intelligentes — une progression structurée du niveau débutant à
            l'aisance conversationnelle.
          </p>
          <Link
