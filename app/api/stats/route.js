import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Route publique en lecture seule — aucune donnée sensible exposée,
// uniquement des compteurs agrégés pour la section "preuves" de la
// page d'accueil. Le service role est nécessaire car auth.users et
// les tables de progression ne sont pas lisibles par le client anonyme.
export const revalidate = 3600; // recalcul au maximum 1x/heure (évite de solliciter la DB à chaque visite)

export async function GET() {
  const db = createServiceRoleClient();

  try {
    const [
      { count: totalLecons },
      { count: leconsCompletees },
      { data: xpRows },
    ] = await Promise.all([
      db.from("lessons").select("*", { count: "exact", head: true }),
      db.from("user_progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
      db.from("user_stats").select("xp_total"),
    ]);

    const xpTotal = (xpRows || []).reduce((sum, row) => sum + (row.xp_total || 0), 0);

    // Apprenants actifs = ayant au moins une leçon complétée (évite de compter les comptes créés puis jamais utilisés)
    const { data: activeUsersRows } = await db
      .from("user_progress")
      .select("user_id")
      .eq("status", "completed");
    const apprenantsActifs = new Set((activeUsersRows || []).map((r) => r.user_id)).size;

    return NextResponse.json({
      total_lecons: totalLecons ?? 669,
      lecons_completees: leconsCompletees ?? 0,
      apprenants_actifs: apprenantsActifs,
      xp_total: xpTotal,
    });
  } catch (err) {
    // En cas d'erreur, on renvoie les valeurs "catalogue" statiques plutôt
    // qu'un 500 — la section chiffres de la landing page ne doit jamais casser.
    return NextResponse.json({
      total_lecons: 669,
      lecons_completees: 0,
      apprenants_actifs: 0,
      xp_total: 0,
    });
  }
}

