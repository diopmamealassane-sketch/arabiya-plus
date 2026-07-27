import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReviewSession from "@/components/ReviewSession";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nowIso = new Date().toISOString();

  const { data: dueRows } = await supabase
    .from("user_word_review")
    .select("word_id, box_level, next_review_at, words(id, arabic_vocalized, transliteration, french, audio_url)")
    .eq("user_id", user.id)
    .lte("next_review_at", nowIso)
    .order("next_review_at", { ascending: true })
    .limit(20);

  const words = (dueRows ?? [])
    .filter((r) => r.words)
    .map((r) => ({
      id: r.words.id,
      arabic_vocalized: r.words.arabic_vocalized,
      transliteration: r.words.transliteration,
      french: r.words.french,
      audio_url: r.words.audio_url,
      box_level: r.box_level,
    }));

  return (
    <main className="min-h-screen bg-parchment">
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white px-5 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-sm text-white/60 font-semibold">Révision du jour</p>
            <h1 className="font-extrabold text-lg">
              {words.length} mot{words.length !== 1 ? "s" : ""} à réviser
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 -mt-4 relative z-10 pb-16">
        {words.length > 0 ? (
          <ReviewSession words={words} />
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center mt-6">
            <p className="text-ink font-extrabold text-lg mb-2">Rien à réviser pour l'instant 🎉</p>
            <p className="text-ink/60 text-base mb-6">
              Revenez plus tard — vos prochains mots à réviser apparaîtront ici automatiquement.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-extrabold px-5 py-3 rounded-xl"
            >
              Retour au tableau de bord
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
