import LoginClient from "./LoginClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Se connecter — Arabiya+";
const DESCRIPTION = "Connectez-vous à votre compte Arabiya+ pour continuer votre parcours d'apprentissage de l'arabe.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginClient />;
}
