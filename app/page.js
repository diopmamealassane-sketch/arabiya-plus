import Link from "next/link";
import {
  ArrowRight, Volume2, Repeat, Trophy, Target, Mic, Award, Sparkles,
  Headphones, BookOpen, PenLine, Lock, Check,
} from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Récupère les compteurs réels depuis Supabase pour la section "preuves".
// Ne casse jamais le rendu de la page : en cas d'erreur, on retombe sur
// des valeurs neutres et la section correspondante ne s'affiche pas.
async function getPlatformStats() {
  try {
    const db = createServiceRoleClient();

    const [{ count: leconsCompletees }, { data: xpRows }, { data: activeUsersRows }] =
      await Promise.all([
        db.from("user_progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
        db.from("user_stats").select("xp_total"),
        db.from("user_progress").select("user_id").eq("status", "completed"),
      ]);

    const xpTotal = (xpRows || []).reduce((sum, row) => sum + (row.xp_total || 0), 0);
    const apprenantsActifs = new Set((activeUsersRows || []).map((r) => r.user_id)).size;

    return { leconsCompletees: leconsCompletees ?? 0, xpTotal, apprenantsActifs };
  } catch {
    return { leconsCompletees: 0, xpTotal: 0, apprenantsActifs: 0 };
  }
}

const CYCLES = [
  { code: "A1", label: "Débutant", desc: "Se saluer, compter, la famille, les couleurs — les fondations solides." },
  { code: "A2", label: "Élémentaire", desc: "Le présent, les voyages, la santé, les émotions du quotidien." },
  { code: "B1", label: "Intermédiaire", desc: "Raconter le passé, imaginer l'avenir, donner son avis." },
  { code: "B2", label: "Intermédiaire supérieur", desc: "Débattre, nuancer, comprendre l'actualité et l'art." },
  { code: "C1", label: "Avancé", desc: "Registres de langue, humour, négociation, discours académiques." },
  { code: "C2", label: "Maîtrise", desc: "Dialectes, traduction, patrimoine, éloquence — la maîtrise." },
];

export default async function LandingPage() {
  const stats = await getPlatformStats();

  return (
    <main className="geo-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <nav className="mb-14 sm:mb-20">
          {/* Boutons-texte — mobile uniquement */}
          <div className="flex sm:hidden flex-wrap justify-center items-center gap-2.5 mb-8">
            <Link
              href="/test-niveau"
              className="text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-full border border-gold-light/30 text-gold-light/90 hover:bg-gold-light/10 transition-colors"
            >
              Test de niveau
            </Link>
            <Link
              href="/pricing"
              className="text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-full border border-gold-light/30 text-gold-light/90 hover:bg-gold-light/10 transition-colors"
            >
              Abonnement
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-full border border-gold-light/30 text-gold-light/90 hover:bg-gold-light/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6">
            <Link href="/">
              <img src="/logo-mark.png" alt="Arabiya+" className="h-32 sm:h-32 w-auto object-contain" />
            </Link>

            {/* Ligne complète — desktop uniquement */}
            <div className="hidden sm:flex gap-6 items-center text-base">
              <Link href="/test-niveau" className="opacity-80 hover:opacity-100">Test de niveau</Link>
              <Link href="/pricing" className="opacity-80 hover:opacity-100">Abonnement</Link>
              <Link href="/login" className="opacity-80 hover:opacity-100">Se connecter</Link>
              <Link
                href="/signup"
                className="bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-4 py-2 rounded-xl text-base"
              >
                Commencer
              </Link>
            </div>

            {/* CTA seul, mis en avant — mobile uniquement */}
            <Link
              href="/signup"
              className="sm:hidden inline-flex items-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-9 py-3.5 rounded-2xl text-base shadow-lg shadow-gold/20"
            >
              Commencer
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto float-in">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold mb-10 md:mb-14">
            Pour francophones — du débutant à la maîtrise
          </p>
          <h1 className="arabic text-6xl mt-12 mb-14 md:mt-16 md:mb-20" dir="rtl">
            مَرْحَبًا بِكَ
          </h1>
          <p className="text-2xl font-semibold mb-4">
            Apprenez l'arabe. De A1 à C2.
          </p>
          <p className="opacity-80 mb-10">
            669 leçons pour apprendre, pratiquer et progresser à votre rythme —
            avec audio natif, reconnaissance vocale, révisions intelligentes
            et certificats à chaque étape. Une méthode complète, pensée pour
            les francophones.
          </p>
          <p className="text-sm text-gold-light font-semibold mb-3">
            Vous connaissez déjà l'arabe ? Notre test vous dit exactement où reprendre.
          </p>
          <Link
            href="/test-niveau"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold px-8 py-4 rounded-2xl"
          >
            Faire le test de niveau gratuit <ArrowRight size={20} />
          </Link>
          <div className="mt-4">
            <Link href="/signup" className="text-base underline opacity-70 hover:opacity-100">
              Débutant complet ? Commencez directement, gratuitement
            </Link>
          </div>

          {/* Réassurance — répond directement à la friction "carte demandée à l'essai" */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-8 text-sm opacity-60">
            <span className="flex items-center gap-1.5"><Lock size={14} /> Paiement sécurisé</span>
            <span className="flex items-center gap-1.5"><Check size={14} /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Check size={14} /> Annulation à tout moment</span>
            <span className="flex items-center gap-1.5"><Check size={14} /> Accès immédiat</span>
          </div>
        </div>

        {/* Bandeau chiffres */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
          <Stat value="669" label="leçons" />
          <Stat value="6" label="niveaux (A1 → C2)" />
          <Stat value="69" label="unités thématiques" />
          <Stat value="100%" label="pensé pour les francophones" />
        </div>

        {/* Différenciateurs forts — reconnaissance vocale + révision intelligente */}
        <div className="mt-24 grid md:grid-cols-2 gap-6">
          <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-8">
            <div className="text-gold-light mb-4"><Mic size={32} /></div>
            <h3 className="text-xl font-bold mb-2">🎤 Parlez arabe</h3>
            <p className="opacity-80">
              Prononcez à voix haute, enregistrez-vous, obtenez votre score
              instantané et améliorez votre prononciation — pas seulement des QCM.
            </p>
          </div>
          <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-8">
            <div className="text-gold-light mb-4"><Repeat size={32} /></div>
            <h3 className="text-xl font-bold mb-2">🧠 Votre révision quotidienne, automatique</h3>
            <p className="opacity-80">
              Arabiya+ sélectionne pour vous ce que vous devez réviser chaque
              jour, juste avant que vous ne l'oubliiez.
            </p>
          </div>
        </div>

        {/* Aperçu produit — mockup léger en code, pas une simple description textuelle */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            Voyez plutôt
          </p>
          <h2 className="text-3xl font-bold text-center mb-12">
            À quoi ressemble un exercice de prononciation
          </h2>

          <div className="max-w-xs mx-auto bg-gradient-to-b from-ink to-ink-2 border border-gold/30 rounded-[2rem] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-gold-light/70 font-semibold text-center mb-6">
              Leçon 3 · Se saluer
            </p>
            <p className="arabic text-5xl text-center mb-2" dir="rtl">مرحباً</p>
            <p className="text-center text-sm opacity-60 mb-1">marhaban</p>
            <p className="text-center text-sm opacity-60 mb-8">bonjour</p>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold-light flex items-center justify-center">
                <Mic size={26} className="text-gold-light" />
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-gold-light mb-1">87%</p>
              <p className="text-sm font-semibold opacity-80">Excellent !</p>
            </div>
          </div>
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
            <Feature icon={<BookOpen />} title="Pensé pour les francophones">
              Grammaire expliquée en français, pièges classiques anticipés dès le départ — pas la traduction d'un cours pensé pour l'anglais.
            </Feature>
            <Feature icon={<Volume2 />} title="Audio natif sur chaque mot">
              Chaque mot et chaque phrase sont prononcés par une voix arabe native, pour un apprentissage à l'oreille dès le premier jour.
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

        {/* Les 4 compétences clés */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            Les 4 compétences clés
          </p>
          <h2 className="text-3xl font-bold text-center mb-12">
            Pour une vraie maîtrise de la langue
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Skill icon={<Headphones />} title="Écouter" subtitle="Compréhension orale" />
            <Skill icon={<Mic />} title="Parler" subtitle="Production orale" />
            <Skill icon={<BookOpen />} title="Lire" subtitle="Compréhension écrite" />
            <Skill icon={<PenLine />} title="Écrire" subtitle="Production écrite" />
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
              <Link
                key={cycle.code}
                href={`/cours-arabe/${cycle.code.toLowerCase()}`}
                className="flex items-center gap-4 bg-ink-2/60 border border-gold/20 rounded-2xl p-5 hover:border-gold/50 transition"
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
              </Link>
            ))}
          </div>
        </div>

        {/* Aperçu du niveau avancé — contenu réel, pas une promesse abstraite */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            La promesse C1 → C2, concrètement
          </p>
          <h2 className="text-3xl font-bold text-center mb-4">
            Ce n'est pas juste "beaucoup de leçons"
          </h2>
          <p className="text-center opacity-70 max-w-xl mx-auto mb-12">
            Au niveau C1, vous négociez, débattez et présentez à l'oral sur des
            sujets réels : négociation, rhétorique, présentation académique,
            philosophie, géopolitique. Le C2 vous mène jusqu'à l'éloquence.
          </p>

          <div className="bg-ink-2/60 border border-gold/20 rounded-2xl p-8 max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-gold-light font-semibold mb-4">
              Extrait — Leçon de synthèse finale, Cycle C2
            </p>
            <p className="arabic text-3xl mb-3" dir="rtl">
              أَسْتَطِيعُ الآنَ التَّعْبِيرَ عَنْ نَفْسِي بِبَلَاغَةٍ وَثِقَةٍ فِي اللُّغَةِ العَرَبِيَّةِ
            </p>
            <p className="opacity-70 italic">
              « Je peux maintenant m'exprimer avec éloquence et confiance en arabe. »
            </p>
          </div>
        </div>

        {/* Preuves — n'apparaît que si les chiffres réels sont assez significatifs.
            On n'affiche volontairement que les métriques déjà impressionnantes
            (leçons complétées, XP cumulé) ; le nombre d'apprenants actifs reste
            suivi en interne via stats.apprenantsActifs mais n'est pas encore
            assez élevé pour être mis en avant publiquement. */}
        {stats.leconsCompletees >= 50 && (
          <div className="mt-24">
            <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
              Déjà en mouvement
            </p>
            <h2 className="text-3xl font-bold text-center mb-12">
              Une communauté d'apprenants en pleine progression
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Stat value={stats.leconsCompletees.toLocaleString("fr-FR")} label="leçons complétées" />
              <Stat value={stats.xpTotal.toLocaleString("fr-FR")} label="XP gagnés" />
            </div>
          </div>
        )}

        {/* Comparatif — répond à l'objection silencieuse "pourquoi pas un prof ?" sans dévaloriser cette option */}
        <div className="mt-24">
          <p className="text-gold-light uppercase tracking-widest text-sm font-semibold text-center mb-3">
            Un format différent
          </p>
          <h2 className="text-3xl font-bold text-center mb-4">
            Arabiya+ face à un cours classique
          </h2>
          <p className="text-center opacity-70 max-w-xl mx-auto mb-12">
            Deux approches complémentaires, pas concurrentes — beaucoup
            d'apprenants combinent les deux. Voici où Arabiya+ se situe.
          </p>

          <div className="bg-ink-2/60 border border-gold/20 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="grid grid-cols-3 text-sm font-semibold text-center py-3 border-b border-gold/20 bg-white/5">
              <span className="opacity-60">Critère</span>
              <span className="text-gold-light">Arabiya+</span>
              <span className="opacity-70">Cours classique</span>
            </div>
            {[
              ["Disponibilité", "24h/24, à votre rythme", "Selon horaires fixés"],
              ["Contenu", "669 leçons, A1 → C2", "Variable selon programme"],
              ["Prix", "À partir de 7,49 €/mois", "Généralement plus élevé"],
              ["Feedback prononciation", "Score instantané", "Retour humain, en direct"],
              ["Révision du vocabulaire", "Automatique et personnalisée", "Rarement systématique"],
              ["Interaction humaine", "Classement entre apprenants", "Échange direct avec un prof"],
            ].map(([critere, arabiya, classique]) => (
              <div key={critere} className="grid grid-cols-3 text-sm py-3 border-b border-gold/10 last:border-0 text-center items-center px-3">
                <span className="opacity-60 text-left">{critere}</span>
                <span className="font-semibold">{arabiya}</span>
                <span className="opacity-70">{classique}</span>
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

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} Arabiya+ — AMOCSSI GROUPE. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:opacity-100 hover:underline">
              Contact
            </Link>
            <Link href="/mentions-legales" className="hover:opacity-100 hover:underline">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:opacity-100 hover:underline">
              CGV
            </Link>
            <Link href="/politique-confidentialite" className="hover:opacity-100 hover:underline">
              Confidentialité
            </Link>
          </div>
        </footer>
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

function Skill({ icon, title, subtitle }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center text-gold-light mb-3">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm opacity-70 italic">{subtitle}</p>
    </div>
  );
  }
