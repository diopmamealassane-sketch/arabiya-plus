import { NextResponse } from 'next/server';

function getSiteUrl() {
  if (process.env.VERCEL_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function POST(req) {
  const { amount, userId, email, firstName, lastName, plan } = await req.json();

  const isLive = process.env.PAYDUNYA_MODE === 'live';
  const baseUrl = isLive
    ? 'https://app.paydunya.com/api/v1'
    : 'https://app.paydunya.com/sandbox-api/v1';

  const siteUrl = getSiteUrl();

  const payload = {
    invoice: {
      total_amount: amount,
      description: `Abonnement Arabiya+ - ${plan}`,
      customer: {
        name: `${firstName} ${lastName}`,
        email,
      },
    },
    store: {
      name: 'Arabiya+',
      website_url: 'https://arabiya-plus.com',
    },
    custom_data: {
      user_id: userId,
      plan,
    },
    actions: {
      cancel_url: `${siteUrl}/paiement/annule`,
      return_url: `${siteUrl}/paiement/retour`,
      callback_url: `${siteUrl}/api/paydunya-webhook?x-vercel-protection-bypass=b9c8f29a3058b5ee35eecf3c82ea43a2`,
    },
  };

  const res = await fetch(`${baseUrl}/checkout-invoice/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.response_code !== '00') {
    return NextResponse.json({ error: data.response_text }, { status: 400 });
  }

  return NextResponse.json({ payment_url: data.response_text, token: data.token });
}