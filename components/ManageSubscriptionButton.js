// components/ManageSubscriptionButton.js
// Bloc « Gérer mon abonnement » — ouvre le portail client Stripe
// (changer de carte, voir les factures, gérer l'abonnement).

import { CreditCard, ArrowRight, AlertTriangle } from "lucide-react";

const STRIPE_PORTAL_URL =
  "https://billing.stripe.com/p/login/aFa14n3kS4F963b5Tqe7m00";

export default function ManageSubscriptionButton({ email, pastDue = false, className = "" }) {
  // Si l'e-mail de l'utilisateur est fourni, il est pré-rempli sur la page Stripe
  const href = email
    ? `${STRIPE_PORTAL_URL}?prefilled_email=${encodeURIComponent(email)}`
    : STRIPE_PORTAL_URL;

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-md border ${
        pastDue ? "border-red-300" : "border-gold/30"
      } ${className}`}
    >
      {pastDue && (
        <p className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
          <AlertTriangle size={16} /> Votre dernier paiement a échoué. Mettez à jour votre carte pour garder l'accès Premium.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-ink/5 text-ink flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="font-extrabold text-lg text-ink">Mon abonnement</p>
            <p className="text-sm text-ink/60 font-semibold">
              Carte bancaire, factures et gestion de l'abonnement
            </p>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-ink to-ink-2 text-white text-base font-extrabold px-4 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 shrink-0"
        >
          Gérer <ArrowRight size={16} />
        </a>
      </div>

      <p className="text-xs text-ink/40 font-semibold mt-3">
        Connexion sécurisée par Stripe avec l'e-mail de votre abonnement.
      </p>
    </div>
  );
}
