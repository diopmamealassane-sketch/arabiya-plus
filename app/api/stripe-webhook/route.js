import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide: ${err.message}` }, { status: 400 });
  }

  const db = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id; // set when creating the Checkout Session
      await db.from("subscriptions").update({
        stripe_customer_id: session.customer,
        status: "active",
      }).eq("user_id", userId);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object;
      // "trialing" = accès pendant l'essai gratuit, à traiter comme actif.
      // "canceled" / "unpaid" / "incomplete_expired" = accès révoqué.
      // Tout le reste (ex: échec de paiement récurrent) = en retard.
      let status;
      if (["active", "trialing"].includes(sub.status)) status = "active";
      else if (["canceled", "unpaid", "incomplete_expired"].includes(sub.status)) status = "canceled";
      else status = "past_due";

      // current_period_end est désormais au niveau de l'item d'abonnement,
      // pas au niveau de l'abonnement lui-même (changement d'API Stripe récent).
      const periodEndTimestamp =
        sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;

      const updateData = { status };
      if (periodEndTimestamp) {
        updateData.current_period_end = new Date(periodEndTimestamp * 1000).toISOString();
      }

      await db
        .from("subscriptions")
        .update(updateData)
        .eq("stripe_customer_id", sub.customer);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await db
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_customer_id", sub.customer);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      // On ne touche que les factures liées à un abonnement récurrent
      // (ignore les factures ponctuelles hors abonnement, s'il y en a un jour).
      if (invoice.customer) {
        await db
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", invoice.customer);
      }
      break;
    }
    default:
      break; // ignore other event types
  }

  return NextResponse.json({ received: true });
}
