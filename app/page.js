import Link from "next/link";
import {
  ArrowRight, Volume2, Repeat, Trophy, Target, Mic, Award, Sparkles,
} from "lucide-react";

const CYCLES = [
  { code: "A1", label: "Débutant", desc: "Se saluer, compter, la famille, les couleurs — les fondations solides." },
  { code: "A2", label: "Élémentaire", desc: "Le présent, les voyages, la santé, les émotions du quotidien." },
  { code: "B1", label: "Intermédiaire", desc: "Raconter le passé, imaginer l'avenir, donner son avis." },
  { code: "B2", label: "Intermédiaire supérieur", desc: "Débattre, nuancer, comprendre l'actualité et l'art." },
  { code: "C1", label: "Avancé", desc: "Registres de langue, humour, négociation, discours académiques." },
  { code: "C2", label: "Expert", desc: "Dialectes, traduction, patrimoine, éloquence — la maîtrise." },
];

export default function LandingPage() {
  return (
    <main className="geo-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <nav className="flex items-center justify-between mb-20">
          <Link href="/">
            <img src="/logo-mark.png" alt="Arabiya+" className="h-16 w-auto" />
          </Link>
          <div className="flex gap-6 items-center text-base">
            <Link href="/test-niveau" className="opacity-80 hover:opacity-100">Test de niveau</Link>
            <Link href="/pricing" className="opacity-80 hover:opacity-100">Tarifs</Link>
            <Link href="/login" className="opacity-80 hover:opacity-100">Se connecter</Link>
            <Link
              href="/signup"
              className="bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-4 py-2 rounded-xl text-base"
            >
              Commencer
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto float-in">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold mb-4">
            Pour francophones — du débutant à la maîtrise
          </p>
          <h1 className="arabic text-6xl mb-6" dir="rtl">
            مَرْحَبًا بِكَ
          </h1>
          <p className="text-2xl font-semibold mb-4">
            La seule méthode d'arabe qui vous mène vraiment jusqu'à la maîtrise.
          </p>
          <p className="opacity-80 mb-10">
            Pas juste les bases : un parcours complet en 6 niveaux (A1 à C2),
            avec audio natif, reconnaissance vocale, révisions intelligentes
            et certificats à chaque étape.
          </p>
          <Link
            href="/test-niveau"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-8 py-4 rounded-2xl"
          >
            Faire le test de niveau gratuit <ArrowRight size={20} />
          </Link>
          <div className="mt-4">
            <Link href="/signup" className="text-base underline opacity-70 hover:opacity-100">
              Ou commencez directement, gratuitement
            </Link>
          </div>
        </div>

        {/* Bandeau chiffres */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
          <Stat value="600" label="leçons" />
          <Stat value="6" label="niveaux (A1 → C2)" />
          <Stat value="60" label="unités thématiques" />
          <Stat value="100%" label="pensé pour les francophones" />
        </div>

        {/* Grille de fonctionnalités */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            Une méthode complète
          </p>
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce qu'il faut pour progresser vraiment
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature icon={<Target />} title="Test de niveau précis">
              42 questions couvrant les 6 niveaux du CECRL — un vrai résultat, pas une estimation, avec votre feuille de route personnalisée.
            </Feature>
            <Feature icon={<Mic />} title="Reconnaissance vocale">
              Prononcez à voix haute et obtenez un score instantané — pas seulement des QCM.
            </Feature>
            <Feature icon={<Repeat />} title="Révision intelligente">
              Un système de répétition espacée fait ressurgir chaque mot juste avant que vous ne l'oubliiez.
            </Feature>
            <Feature icon={<Trophy />} title="Classement hebdomadaire">
              Comparez votre progression aux autres apprenants et grimpez dans le classement chaque semaine.
            </Feature>
            <Feature icon={<Award />} title="Certificats de niveau">
              Un certificat téléchargeable à chaque cycle terminé — une preuve concrète de votre progression.
            </Feature>
            <Feature icon={<Sparkles />} title="Capsules culturelles">
              Calligraphie, dialectes, histoire, cuisine : on apprend une langue, et tout un monde avec elle.
            </Feature>
          </div>
        </div>

        {/* Le parcours complet */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            Le parcours complet
          </p>
          <h2 className="text-3xl font-bold text-center mb-12">
            Du premier bonjour à l'éloquence
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {CYCLES.map((cycle, i) => (
              <div
                key={cycle.code}
                className="flex items-center gap-4 bg-ink-2/60 border border-gold/20 rounded-2xl p-5"
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-gold/15 text-gold-light font-black flex items-center justify-center">
                  {cycle.code}
                </div>
                <div>
                  <h3 className="font-semibold">
                    Cycle {i + 1} — {cycle.label}
                  </h3>
                  <p className="text-base opacity-70">{cycle.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center max-w-xl mx-auto mt-24">
          <h2 className="text-2xl font-bold mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="opacity-80 mb-8">
            Gratuit pour démarrer, sans engagement. Découvrez votre niveau en quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/test-niveau"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-8 py-4 rounded-2xl"
            >
              Faire le test de niveau gratuit <ArrowRight size={20} />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border-2 border-gold/40 font-bold px-8 py-4 rounded-2xl"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-5 text-center">
      <p className="text-3xl font-black text-gold-light">{value}</p>
      <p className="text-sm opacity-70 mt-1">{label}</p>
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-6">
      <div className="text-gold-light mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-base opacity-70">{children}</p>
    </div>
  );
}
