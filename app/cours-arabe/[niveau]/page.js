import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";

const SITE_URL = "https://arabiya-plus.com";

// Contenu réel par niveau — aligné avec les cycles effectivement présents
// sur la plateforme (voir CYCLES dans app/page.js). Chaque niveau a un
// texte distinct, pas une simple variation du même paragraphe, pour éviter
// le contenu quasi-dupliqué que Google pénalise en indexation.
const LEVELS = {
  a1: {
    code: "A1",
    cycle: 1,
    label: "Débutant",
    title: "Cours d'arabe en ligne niveau A1 (débutant) pour francophones",
    metaDescription:
      "Apprenez l'arabe à partir de zéro avec Arabiya+ : alphabet, salutations, chiffres, famille, couleurs. Cours structuré niveau A1 du CECRL, pensé pour les francophones.",
    intro:
      "Le niveau A1 est le point de départ officiel du Cadre européen commun de référence pour les langues (CECRL). C'est le niveau qui convient si vous n'avez jamais étudié l'arabe, ou si vous connaissez seulement quelques mots.",
    themes: [
      "L'alphabet arabe et la lecture des lettres liées",
      "Se présenter, saluer, prendre congé",
      "Compter, exprimer l'heure et les dates simples",
      "Le vocabulaire de la famille et des couleurs",
      "Construire des phrases simples au présent",
    ],
    faq: [
      {
        q: "Puis-je apprendre l'arabe sans connaître l'alphabet ?",
        a: "Oui — le niveau A1 d'Arabiya+ commence par l'alphabet arabe et sa lecture, avant d'introduire le vocabulaire et les phrases simples.",
      },
      {
        q: "Combien de temps pour finir le niveau A1 ?",
        a: "Cela dépend du rythme de chacun. Avec quelques leçons par semaine, la plupart des apprenants terminent le Cycle 1 en quelques mois.",
      },
    ],
  },
  a2: {
    code: "A2",
    cycle: 2,
    label: "Élémentaire",
    title: "Cours d'arabe en ligne niveau A2 (élémentaire) pour francophones",
    metaDescription:
      "Progressez vers le niveau A2 en arabe : le présent, les voyages, la santé, les émotions du quotidien. Cours structuré CECRL, avec audio natif et reconnaissance vocale.",
    intro:
      "Le niveau A2 (élémentaire) permet de communiquer sur des sujets familiers et courants — au-delà des formules de politesse du niveau A1, vous commencez à décrire votre quotidien.",
    themes: [
      "Conjuguer et utiliser le présent dans des situations réelles",
      "Parler de voyages, de transports et de directions",
      "Le vocabulaire de la santé et du corps",
      "Exprimer des émotions et des préférences simples",
      "Comprendre de courts dialogues du quotidien",
    ],
    faq: [
      {
        q: "Quelle est la différence entre A1 et A2 en arabe ?",
        a: "Le A1 pose les bases (alphabet, salutations, vocabulaire isolé). Le A2 permet de construire des phrases plus complètes sur des sujets concrets du quotidien : voyages, santé, émotions.",
      },
    ],
  },
  b1: {
    code: "B1",
    cycle: 3,
    label: "Intermédiaire",
    title: "Cours d'arabe en ligne niveau B1 (intermédiaire) pour francophones",
    metaDescription:
      "Atteignez le niveau B1 en arabe : raconter le passé, imaginer l'avenir, donner son avis. Cours en ligne structuré selon le CECRL, pour francophones.",
    intro:
      "Le niveau B1 (intermédiaire) marque un vrai tournant : vous devenez capable de raconter des événements, d'exprimer une opinion et de vous projeter dans le futur en arabe.",
    themes: [
      "Les temps du passé pour raconter des événements",
      "Le futur pour parler de projets et d'intentions",
      "Donner son avis et le justifier simplement",
      "Comprendre l'essentiel d'un texte ou d'un dialogue sur un sujet familier",
      "Élargir le vocabulaire au-delà du quotidien immédiat",
    ],
    faq: [
      {
        q: "Le niveau B1 suffit-il pour voyager en arabe ?",
        a: "Le B1 permet de gérer la plupart des situations de voyage courantes : se débrouiller, demander son chemin, raconter une expérience, échanger sur des sujets familiers.",
      },
    ],
  },
  b2: {
    code: "B2",
    cycle: 4,
    label: "Intermédiaire supérieur",
    title: "Cours d'arabe en ligne niveau B2 pour francophones",
    metaDescription:
      "Passez au niveau B2 en arabe : débattre, nuancer, comprendre l'actualité et l'art. Cours structuré CECRL avec Arabiya+, pour francophones.",
    intro:
      "Le niveau B2 vous permet d'interagir avec aisance sur des sujets abstraits ou spécialisés — débattre, nuancer une opinion, suivre l'actualité en arabe.",
    themes: [
      "Débattre et défendre un point de vue avec nuance",
      "Comprendre l'actualité et les médias arabophones",
      "Discuter d'art, de culture et de sujets abstraits",
      "Élargir les registres de langue au-delà du quotidien",
      "Rédiger des textes plus structurés et argumentés",
    ],
    faq: [
      {
        q: "Le niveau B2 permet-il de suivre les informations en arabe ?",
        a: "Oui — le B2 est le niveau où l'on commence à suivre l'actualité et des contenus médias sans traduction, même si certains sujets très spécialisés restent difficiles.",
      },
    ],
  },
  c1: {
    code: "C1",
    cycle: 5,
    label: "Avancé",
    title: "Cours d'arabe en ligne niveau C1 (avancé) pour francophones",
    metaDescription:
      "Niveau C1 en arabe : registres de langue, humour, négociation, discours académiques. Cours avancé structuré CECRL, pour francophones déjà autonomes.",
    intro:
      "Le niveau C1 (avancé) s'adresse à celles et ceux qui maîtrisent déjà bien l'arabe et souhaitent gagner en aisance sur des registres exigeants : négociation, humour, discours académique.",
    themes: [
      "Adapter son registre de langue selon le contexte",
      "Comprendre et manier l'humour et les sous-entendus",
      "Négocier et argumenter à l'oral dans des situations complexes",
      "Suivre des présentations et discours académiques",
      "Aborder des sujets de géopolitique et de philosophie",
    ],
    faq: [
      {
        q: "À qui s'adresse le niveau C1 en arabe ?",
        a: "Le C1 s'adresse aux apprenants déjà autonomes en arabe (niveau B2 acquis) qui veulent affiner leur aisance sur des sujets exigeants : négociation, discours académiques, nuances de registre.",
      },
    ],
  },
  c2: {
    code: "C2",
    cycle: 6,
    label: "Maîtrise",
    title: "Cours d'arabe en ligne niveau C2 (maîtrise) pour francophones",
    metaDescription:
      "Atteignez la maîtrise de l'arabe (niveau C2) : dialectes, traduction, patrimoine, éloquence. Le niveau le plus avancé du parcours Arabiya+.",
    intro:
      "Le niveau C2 est le sommet du CECRL — une maîtrise très avancée de la langue. C'est le dernier cycle du parcours Arabiya+, pour aller jusqu'à l'éloquence.",
    themes: [
      "Comprendre et situer les grands dialectes arabes",
      "S'exercer à la traduction entre le français et l'arabe",
      "Explorer le patrimoine littéraire et culturel arabe",
      "Affiner l'éloquence et l'expression orale soutenue",
      "Consolider l'ensemble du parcours A1 à C1",
    ],
    faq: [
      {
        q: "Le niveau C2 garantit-il une maîtrise parfaite dans tous les domaines ?",
        a: "Le C2 correspond à une maîtrise très avancée selon le CECRL, mais comme dans toute langue, certains domaines très spécialisés (juridique, technique...) demandent un vocabulaire complémentaire au-delà du C2.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(LEVELS).map((niveau) => ({ niveau }));
}

export async function generateMetadata({ params }) {
  const level = LEVELS[params.niveau];
  if (!level) return {};

  const url = `${SITE_URL}/cours-arabe/${params.niveau}`;
  return {
    title: level.title,
    description: level.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: level.title,
      description: level.metaDescription,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: level.title,
      description: level.metaDescription,
    },
  };
}

export default function NiveauPage({ params }) {
  const level = LEVELS[params.niveau];
  if (!level) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Cours d'arabe niveau ${level.code} — ${level.label}`,
    description: level.metaDescription,
    provider: {
      "@type": "EducationalOrganization",
      name: "Arabiya+",
      sameAs: SITE_URL,
    },
  };

  return (
    <main className="geo-bg min-h-screen px-4 py-16 text-parchment">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 underline">
          ← Retour à l'accueil
        </Link>

        <p className="text-gold-light uppercase tracking-widest text-sm font-semibold mt-8 mb-2">
          Cycle {level.cycle} · Niveau {level.code} · CECRL
        </p>
        <h1 className="text-3xl font-bold mb-6">{level.title}</h1>
        <p className="opacity-80 mb-8">{level.intro}</p>

        <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">Ce que vous apprenez à ce niveau</h2>
          <ul className="space-y-2">
            {level.themes.map((theme) => (
              <li key={theme} className="flex items-start gap-2">
                <Check size={18} className="text-teal shrink-0 mt-0.5" />
                <span className="opacity-90">{theme}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            href="/test-niveau"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-6 py-3 rounded-xl"
          >
            Faire le test de niveau gratuit <ArrowRight size={18} />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center border-2 border-gold/30 font-semibold px-6 py-3 rounded-xl hover:border-gold/60 transition"
          >
            Commencer gratuitement
          </Link>
        </div>

        <div className="space-y-4 mb-12">
          {level.faq.map((item) => (
            <div key={item.q}>
              <h3 className="font-semibold mb-1">{item.q}</h3>
              <p className="opacity-70 text-base">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-sm opacity-60 mb-3">Découvrir les autres niveaux :</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LEVELS).map(([slug, l]) => (
              <Link
                key={slug}
                href={`/cours-arabe/${slug}`}
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  l.code === level.code
                    ? "border-gold bg-gold/10 text-gold-light"
                    : "border-white/15 opacity-70 hover:opacity-100"
                }`}
              >
                {l.code}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
