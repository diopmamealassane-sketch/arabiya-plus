import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Petit garde-fou anti-spam en mémoire (best-effort — se réinitialise à
// chaque redéploiement / cold start Vercel, mais évite les abus grossiers
// depuis un même serveur "chaud"). Rien de critique n'en dépend.
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

  const { email, level, cycleLabel, unit, description, roadmap } = body || {};

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }
  if (!level || !cycleLabel) {
    return NextResponse.json({ error: "Résultat manquant" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const lastSent = recentSends.get(cleanEmail);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    return NextResponse.json({ error: "Veuillez patienter avant de renvoyer un email." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("send-placement-result: RESEND_API_KEY manquant");
    return NextResponse.json({ error: "Service email indisponible pour le moment" }, { status: 500 });
  }

  const roadmapHtml = Array.isArray(roadmap)
    ? roadmap
        .map((r) => {
          const icon = r.mastered ? "✅" : r.isStart ? "🎯" : "🔒";
          const color = r.mastered ? "#1E5E56" : r.isStart ? "#8a8264" : "#999999";
          const tag = r.mastered ? " — Maîtrisé" : r.isStart ? " — Point de départ" : "";
          return `<li style="padding:5px 0;color:${color};font-size:14px;">${icon} ${escapeHtml(r.label)}${tag}</li>`;
        })
        .join("")
    : "";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#faf6ec;padding:28px;border-radius:16px;">
      <img src="https://arabiya-plus.com/logo-mark.png" alt="Arabiya+" height="40" style="margin-bottom:16px;" />
      <h1 style="color:#29485A;font-size:20px;margin:0 0 8px;">Votre résultat au test de niveau</h1>
      <p style="color:#6b6350;font-size:15px;line-height:1.5;margin:0 0 20px;">${escapeHtml(description || "")}</p>
      <div style="background:#ffffff;border:2px solid #D1AA41;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="text-transform:uppercase;font-size:11px;letter-spacing:0.5px;color:#8a8264;font-weight:bold;margin:0 0 4px;">
          Point de départ recommandé
        </p>
        <p style="font-weight:bold;font-size:18px;margin:0;color:#29485A;">${escapeHtml(cycleLabel)}</p>
        ${unit ? `<p style="font-size:14px;color:#6b6350;margin:4px 0 0;">${escapeHtml(unit)}</p>` : ""}
      </div>
      ${roadmapHtml ? `<ul style="list-style:none;padding:0;margin:0 0 24px;">${roadmapHtml}</ul>` : ""}
      <a href="https://arabiya-plus.com/signup"
         style="display:inline-block;background:linear-gradient(180deg,#e0c169,#D1AA41);color:#241A02;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px;font-size:15px;">
        Commencer gratuitement
      </a>
      <p style="font-size:12px;color:#999999;margin-top:28px;line-height:1.5;">
        Vous recevez cet email car vous avez demandé votre résultat sur arabiya-plus.com.
      </p>
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
        to: cleanEmail,
        subject: `Votre résultat au test de niveau : ${level}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("send-placement-result: Resend error", resendRes.status, errText);
      return NextResponse.json({ error: "Échec de l'envoi. Réessayez." }, { status: 502 });
    }

    recentSends.set(cleanEmail, Date.now());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-placement-result: unexpected error", err);
    return NextResponse.json({ error: "Échec de l'envoi. Réessayez." }, { status: 500 });
  }
}

