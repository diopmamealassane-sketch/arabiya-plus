import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_RECIPIENT = "amocssigroupe@gmail.com";

// Même garde-fou anti-spam en mémoire que send-placement-result — best
// effort, se réinitialise au redéploiement, mais évite les abus grossiers.
const recentSends = new Map(); // email -> timestamp
const RATE_LIMIT_MS = 60_000;

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { name, email, subject, message } = body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Nom manquant ou trop court" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json({ error: "Message trop court" }, { status: 400 });
  }
  if (message.trim().length > 5000) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const lastSent = recentSends.get(cleanEmail);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    return NextResponse.json({ error: "Veuillez patienter avant de renvoyer un message." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY manquant");
    return NextResponse.json({ error: "Service email indisponible pour le moment" }, { status: 500 });
  }

  const cleanName = name.trim();
  const cleanSubject = (subject || "Message depuis le formulaire de contact").trim();

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#faf6ec;padding:28px;border-radius:16px;">
      <img src="https://arabiya-plus.com/logo-mark.png" alt="Arabiya+" height="40" style="margin-bottom:16px;" />
      <h1 style="color:#29485A;font-size:20px;margin:0 0 8px;">Nouveau message du formulaire de contact</h1>
      <div style="background:#ffffff;border:2px solid #D1AA41;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="font-size:14px;color:#29485A;margin:0 0 4px;"><strong>De :</strong> ${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)})</p>
        <p style="font-size:14px;color:#29485A;margin:0;"><strong>Sujet :</strong> ${escapeHtml(cleanSubject)}</p>
      </div>
      <p style="font-size:15px;color:#6b6350;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message.trim())}</p>
      <p style="font-size:12px;color:#999999;margin-top:28px;">Envoyé depuis arabiya-plus.com/contact</p>
    </div>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Arabiya+ <noreply@arabiya-plus.com>",
        to: CONTACT_RECIPIENT,
        reply_to: cleanEmail, // permet de répondre directement à l'expéditeur depuis Gmail
        subject: `[Contact Arabiya+] ${cleanSubject}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("contact: Resend error", resendRes.status, errText);
      return NextResponse.json({ error: "Échec de l'envoi. Réessayez." }, { status: 502 });
    }

    recentSends.set(cleanEmail, Date.now());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact: unexpected error", err);
    return NextResponse.json({ error: "Échec de l'envoi. Réessayez." }, { status: 500 });
  }
}

