import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const body = await req.json();
  const token = body.data?.invoice?.token || body.invoice_token || body.token;

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  const isLive = process.env.PAYDUNYA_MODE === 'live';
  const baseUrl = isLive
    ? 'https://app.paydunya.com/api/v1'
    : 'https://app.paydunya.com/sandbox-api/v1';

  const confirm = await fetch(`${baseUrl}/checkout-invoice/confirm/${token}`, {
    headers: {
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    },
  });

  const result = await confirm.json();

  if (result.status === 'completed') {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const userId = result.custom_data?.user_id;

    if (userId) {
      await supabase
        .from('subscriptions')
        .update({ status: 'active', payment_provider: 'paydunya' })
        .eq('user_id', userId);
    }
  }

  return NextResponse.json({ received: true });
}