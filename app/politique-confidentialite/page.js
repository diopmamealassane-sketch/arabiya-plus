import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — Arabiya+",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="geo-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <img src="/logo-mark.png" alt="Arabiya+" className="h-40 w-auto" />
        </Link>
        <h1 className="kufi text-3xl text-gold-light mb-8">Politique de confidentialité</h1>
        <div className="text-base">
<p className="opacity-80 leading-relaxed mb-4"><strong className="text-gold-light font-semibold">Dernière mise à jour : 28 juillet 2026</strong></p>
<p className="opacity-80 leading-relaxed mb-4">AMOCSSI GROUPE, éditeur du site Arabiya+ (arabiya-plus.com), accorde une grande importance à la protection des données personnelles de ses utilisateurs. Cette politique de confidentialité vous informe sur la manière dont vos données sont collectées, utilisées et protégées, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française « Informatique et Libertés ».</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">1. Responsable du traitement</h2>
<p className="opacity-80 leading-relaxed mb-4">Le responsable du traitement des données est :</p>
<p className="opacity-80 leading-relaxed mb-4"><strong className="text-gold-light font-semibold">AMOCSSI GROUPE</strong><br />
SAS au capital de 1 000 €<br />
11 rue du Bordier, 91540 Ormoy, France<br />
SIREN : 950 841 668<br />
Contact : amocssigroupe@gmail.com</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">2. Données collectées</h2>
<p className="opacity-80 leading-relaxed mb-4">Nous collectons les données suivantes dans le cadre de l'utilisation du service Arabiya+ :</p>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li><strong className="text-gold-light font-semibold">Données de compte</strong> : nom d'affichage/pseudonyme, adresse email, mot de passe (chiffré) ;</li>
<li><strong className="text-gold-light font-semibold">Données de progression pédagogique</strong> : niveau, leçons complétées, score XP, séries de révision, résultats aux tests et examens ;</li>
<li><strong className="text-gold-light font-semibold">Données de paiement</strong> : gérées exclusivement par notre prestataire Stripe (voir section 6) ; nous ne stockons aucune donnée bancaire ;</li>
<li><strong className="text-gold-light font-semibold">Données techniques</strong> : adresse IP, type de navigateur, données de connexion, à des fins de sécurité et de bon fonctionnement du service.</li>
</ul>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">3. Finalités du traitement</h2>
<p className="opacity-80 leading-relaxed mb-4">Vos données sont collectées et traitées pour les finalités suivantes :</p>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li>Création et gestion de votre compte utilisateur ;</li>
<li>Fourniture du service d'apprentissage (suivi de progression, certificats, classement) ;</li>
<li>Gestion des abonnements et des paiements ;</li>
<li>Communication liée au service (confirmation de compte, informations sur votre abonnement) ;</li>
<li>Amélioration du service et statistiques d'usage anonymisées ;</li>
<li>Respect de nos obligations légales et comptables.</li>
</ul>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">4. Base légale des traitements</h2>
<p className="opacity-80 leading-relaxed mb-4">Les traitements de données reposent sur :</p>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li><strong className="text-gold-light font-semibold">L'exécution du contrat</strong> : pour la fourniture du service et la gestion de l'abonnement ;</li>
<li><strong className="text-gold-light font-semibold">Le consentement</strong> : pour certaines communications optionnelles ;</li>
<li><strong className="text-gold-light font-semibold">L'intérêt légitime</strong> : pour l'amélioration du service et la sécurité de la plateforme ;</li>
<li><strong className="text-gold-light font-semibold">Le respect d'obligations légales</strong> : notamment en matière comptable et fiscale.</li>
</ul>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">5. Destinataires des données</h2>
<p className="opacity-80 leading-relaxed mb-4">Vos données ne sont jamais vendues ni louées à des tiers. Elles sont uniquement transmises aux prestataires techniques nécessaires au fonctionnement du service, dans le cadre de leurs missions respectives :</p>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li><strong className="text-gold-light font-semibold">Supabase Inc.</strong> (hébergement de la base de données) ;</li>
<li><strong className="text-gold-light font-semibold">Vercel Inc.</strong> (hébergement du site) ;</li>
<li><strong className="text-gold-light font-semibold">Stripe</strong> (traitement sécurisé des paiements).</li>
</ul>
<p className="opacity-80 leading-relaxed mb-4">Ces prestataires sont susceptibles de traiter des données en dehors de l'Union européenne. Ils s'engagent contractuellement à respecter des garanties appropriées de protection des données (clauses contractuelles types de la Commission européenne notamment).</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">6. Paiements</h2>
<p className="opacity-80 leading-relaxed mb-4">Les données bancaires sont directement collectées et traitées par <strong className="text-gold-light font-semibold">Stripe</strong>, prestataire de paiement certifié PCI-DSS. AMOCSSI GROUPE n'a jamais accès à vos coordonnées bancaires complètes. Pour en savoir plus sur le traitement de vos données par Stripe : stripe.com/fr/privacy.</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">7. Durée de conservation</h2>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li>Les données de compte sont conservées pendant toute la durée de votre inscription, puis supprimées dans un délai de 3 ans après la dernière activité en cas d'inactivité prolongée, sauf obligation légale de conservation plus longue (notamment comptable) ;</li>
<li>Les données de paiement sont conservées par Stripe selon leurs propres durées de conservation légales ;</li>
<li>En cas de suppression de compte à votre demande, vos données personnelles sont supprimées dans un délai raisonnable, sous réserve des données que nous sommes légalement tenus de conserver (factures notamment).</li>
</ul>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">8. Vos droits</h2>
<p className="opacity-80 leading-relaxed mb-4">Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
<ul className="list-disc pl-6 opacity-80 leading-relaxed mb-4 space-y-1">
<li><strong className="text-gold-light font-semibold">Droit d'accès</strong> : obtenir une copie des données que nous détenons sur vous ;</li>
<li><strong className="text-gold-light font-semibold">Droit de rectification</strong> : corriger des données inexactes ou incomplètes ;</li>
<li><strong className="text-gold-light font-semibold">Droit à l'effacement</strong> : demander la suppression de vos données, sous réserve de nos obligations légales ;</li>
<li><strong className="text-gold-light font-semibold">Droit à la limitation du traitement</strong> ;</li>
<li><strong className="text-gold-light font-semibold">Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible ;</li>
<li><strong className="text-gold-light font-semibold">Droit d'opposition</strong> au traitement de vos données pour motif légitime ;</li>
<li><strong className="text-gold-light font-semibold">Droit de définir des directives relatives au sort de vos données après votre décès</strong>.</li>
</ul>
<p className="opacity-80 leading-relaxed mb-4">Pour exercer l'un de ces droits, vous pouvez nous contacter à l'adresse : <strong className="text-gold-light font-semibold">amocssigroupe@gmail.com</strong>. Nous nous engageons à répondre dans un délai maximum d'un mois.</p>
<p className="opacity-80 leading-relaxed mb-4">Vous disposez également du droit d'introduire une réclamation auprès de la <strong className="text-gold-light font-semibold">CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr.</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">9. Sécurité des données</h2>
<p className="opacity-80 leading-relaxed mb-4">AMOCSSI GROUPE met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation, notamment via le chiffrement des mots de passe et l'utilisation de connexions sécurisées (HTTPS).</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">10. Cookies</h2>
<p className="opacity-80 leading-relaxed mb-4">Le site utilise des cookies strictement nécessaires à son fonctionnement, notamment pour maintenir votre session de connexion. Ces cookies techniques ne nécessitent pas de consentement préalable au titre de la réglementation applicable, car ils sont indispensables à la fourniture du service que vous avez expressément demandé.</p>
<p className="opacity-80 leading-relaxed mb-4">Le site n'utilise pas, à ce jour, de cookies publicitaires ou de traceurs à des fins de profilage marketing.</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">11. Mineurs</h2>
<p className="opacity-80 leading-relaxed mb-4">Le service Arabiya+ n'est pas spécifiquement destiné aux mineurs de moins de 15 ans. Toute inscription par un mineur de moins de 15 ans doit être réalisée avec le consentement d'un titulaire de l'autorité parentale, conformément à l'article 8 du RGPD tel que transposé en droit français.</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">12. Modification de la politique de confidentialité</h2>
<p className="opacity-80 leading-relaxed mb-4">Cette politique de confidentialité peut être mise à jour à tout moment. La version en vigueur est celle publiée sur cette page. En cas de modification substantielle, les utilisateurs en seront informés par email.</p>
<h2 className="kufi text-xl text-gold-light mt-10 mb-3">13. Contact</h2>
<p className="opacity-80 leading-relaxed mb-4">Pour toute question relative à cette politique de confidentialité ou à vos données personnelles : <strong className="text-gold-light font-semibold">amocssigroupe@gmail.com</strong></p>
        </div>
        <div className="mt-16 pt-8 border-t border-gold/20">
          <Link href="/" className="text-sm underline opacity-70 hover:opacity-100">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
