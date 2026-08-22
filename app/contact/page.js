import ContactClient from "./ContactClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Nous contacter — Arabiya+";
const DESCRIPTION =
  "Une question sur Arabiya+, un problème technique ou une suggestion ? Contactez notre équipe, nous vous répondons rapidement.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
