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