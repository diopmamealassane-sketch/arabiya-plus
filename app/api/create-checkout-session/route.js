import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL,
};

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { plan } = await request.json().catch(() => ({ plan: "monthly" }));
  const priceId = PRICE_IDS[plan] ?? PRICE_IDS.monthly;

  if (!priceId) {
    return NextResponse.json(
      { error: "Aucun price_id configuré pour ce plan. Vérifiez les variables d'environnement." },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id, // read back in the webhook to know which user paid
    customer_email: user.email,
    // Essai gratuit de 30 jours — carte obligatoire dès l'inscription
    // (payment_method_collection: "always" force la saisie même pendant
    // l'essai) et l'abonnement est annulé automatiquement si aucun moyen
    // de paiement valide n'est enregistré à la fin de l'essai.
    subscription_data: {
      trial_period_days: 30,
      trial_settings: {
        end_behavior: { missing_payment_method: "cancel" },
      },
    },
    payment_method_collection: "always",
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
