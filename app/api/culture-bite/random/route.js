import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Pas de vérification d'auth ici : les capsules culturelles ne sont pas
// une donnée sensible, et les afficher échoue silencieusement côté
// client si l'appel rate — jamais bloquant pour la leçon elle-même.
export async function GET() {
  const db = createServiceRoleClient();

  const { data, error } = await db.rpc("get_random_culture_bite");

  if (!error && data && data.length > 0) {
    return NextResponse.json(data[0]);
  }

  // Repli si la fonction SQL n'existe pas encore (avant migration) : on
  // pioche côté application plutôt que de renvoyer une erreur.
  const { data: bites } = await db.from("culture_bites").select("emoji, title_fr, body_fr");
  if (!bites || bites.length === 0) {
    return NextResponse.json({ error: "no culture bites" }, { status: 404 });
  }
  const random = bites[Math.floor(Math.random() * bites.length)];
  return NextResponse.json(random);
}
