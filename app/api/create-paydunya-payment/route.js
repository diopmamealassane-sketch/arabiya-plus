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

  // DEBUG TEMPORAIRE - à retirer après diagnostic
  if (req.headers.get('x-debug') === '1') {
    return NextResponse.json({
      masterKeyLength: process.env.PAYDUNYA_MASTER_KEY?.length || 0,
      privateKeyLength: process.env.PAYDUNYA_PRIVATE_KEY?.length || 0,
      tokenLength: process.env.PAYDUNYA_TOKEN?.length || 0,
      mode: process.env.PAYDUNYA_MODE,
      masterKeyStart: process.env.PAYDUNYA_MASTER_KEY?.substring(0, 4),
      masterKeyEnd: process.env.PAYDUNYA_MASTER_KEY?.slice(-4),
    });
  }

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
      callback_url: `${siteUrl}/api/paydunya-webhook`,
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