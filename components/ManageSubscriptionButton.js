// components/ManageSubscriptionButton.js
// Bouton « Gérer mon abonnement » — ouvre le portail client Stripe
// (changer de carte, voir les factures, gérer l'abonnement).

const STRIPE_PORTAL_URL =
  "https://billing.stripe.com/p/login/aFa14n3kS4F963b5Tqe7m00";

export default function ManageSubscriptionButton({ email, className = "" }) {
  // Si l'e-mail de l'utilisateur est fourni, il est pré-rempli sur la page Stripe
  const href = email
    ? `${STRIPE_PORTAL_URL}?prefilled_email=${encodeURIComponent(email)}`
    : STRIPE_PORTAL_URL;

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">💳 Mon abonnement</h3>
      <p className="mt-1 text-sm text-gray-600">
        Changez votre carte bancaire, consultez vos factures ou gérez votre abonnement Premium.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Gérer mon abonnement →
      </a>
      <p className="mt-2 text-xs text-gray-400">
        Connexion sécurisée par Stripe avec l'e-mail de votre abonnement.
      </p>
    </div>
  );
}
