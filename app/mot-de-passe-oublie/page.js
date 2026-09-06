import ForgotPasswordClient from "./ForgotPasswordClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Mot de passe oublié — Arabiya+";
const DESCRIPTION = "Recevez un lien par email pour réinitialiser le mot de passe de votre compte Arabiya+.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/mot-de-passe-oublie` },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
    }
