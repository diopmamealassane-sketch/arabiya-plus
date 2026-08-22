import SignupClient from "./SignupClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Créer un compte gratuit — Arabiya+";
const DESCRIPTION =
  "Créez votre compte Arabiya+ gratuitement et commencez à apprendre l'arabe dès aujourd'hui : 5 premières unités offertes, sans carte bancaire requise.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/signup` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/signup`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
