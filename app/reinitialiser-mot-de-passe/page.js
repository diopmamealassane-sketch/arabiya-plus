import ResetPasswordClient from "./ResetPasswordClient";

const SITE_URL = "https://arabiya-plus.com";

const TITLE = "Nouveau mot de passe — Arabiya+";
const DESCRIPTION = "Choisissez un nouveau mot de passe pour votre compte Arabiya+.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/reinitialiser-mot-de-passe` },
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
    }
