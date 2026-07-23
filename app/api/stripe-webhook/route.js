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
      await db
        .from("subscriptions")
        .update({
          status: sub.status === "active" ? "active" : "past_due",
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
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
    default:
      break; // ignore other event types
  }

  return NextResponse.json({ received: true });
}
