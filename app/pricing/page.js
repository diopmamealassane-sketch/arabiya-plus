import PricingClient from "./PricingClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Abonnement Arabiya+ — Tarifs et offre gratuite";
const DESCRIPTION =
  "Découvrez les tarifs d'Arabiya+ : commencez gratuitement avec 5 unités, ou passez Premium dès 7,49 €/mois pour débloquer les 669 leçons, du A1 au C2. 30 jours d'essai offerts.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
