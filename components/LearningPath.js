"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hand, Users, Hash, Palette, UtensilsCrossed, Clock, Home,
  MessageCircle, BookOpen, Check, Lock, ChevronDown, Award,
} from "lucide-react";

const CYCLE_LABELS = {
  0: "Cycle 0 — Lire l'arabe",
  A1: "Cycle 1 — Débutant (A1)",
  A2: "Cycle 2 — Élémentaire (A2)",
  B1: "Cycle 3 — Intermédiaire (B1)",
  B2: "Cycle 4 — Intermédiaire supérieur (B2)",
  C1: "Cycle 5 — Avancé (C1)",
  C2: "Cycle 6 — Expert (C2)",
};

// Icône par thème d'unité — reconnue sur un mot-clé du titre, pas sur un ID,
// pour que le prochain contenu ajouté hérite automatiquement d'une icône
// cohérente sans mapping à maintenir manuellement.
function unitIcon(title) {
  const t = title.toLowerCase();
  if (t.includes("lettre") || t.includes("alphabet") || t.includes("lire")) return BookOpen;
  if (t.includes("saluer") || t.includes("politesse")) return Hand;
  if (t.includes("famille") || t.includes("ami")) return Users;
  if (t.includes("chiffre") || t.includes("nombre")) return Hash;
  if (t.includes("couleur")) return Palette;
  if (t.includes("nourriture") || t.includes("repas")) return UtensilsCrossed;
  if (t.includes("temps")) return Clock;
  if (t.includes("objet") || t.includes("maison")) return Home;
  if (t.includes("conversation") || t.includes("présent")) return MessageCircle;
  return BookOpen;
}

// Une unité est un "examen de cycle" si son titre l'indique explicitement,
// pas selon sa position — ça évite qu'une nouvelle unité ajoutée après les
// 10 unités classiques (ex. une unité de révision) soit prise à tort pour
// l'examen final et se retrouve verrouillée jusqu'à la fin du cycle.
function isExamUnitTitle(title) {
  return title.startsWith("Examen de cycle");
}

export default function LearningPath({ unitsByCycle, progressByLesson, isPremium }) {
  const [expandedUnitId, setExpandedUnitId] = useState(null);

  // Trouve la première unité déverrouillée et non-terminée, tous cycles
  // confondus dans l'ordre d'affichage — c'est elle qui reçoit le badge "or"
  // et l'étiquette "Continuer ici". Le cycle qui la contient est celui
  // ouvert par défaut ci-dessous.
  let currentUnitId = null;
  let currentCycle = null;
  outer: for (const group of unitsByCycle) {
    const coreUnitsForGroup = group.units.filter((u) => !isExamUnitTitle(u.title_fr));
    const coreTotalForGroup = coreUnitsForGroup.reduce((sum, u) => sum + (u.lessons?.length ?? 0), 0);
    const coreDoneForGroup = coreUnitsForGroup.reduce(
      (sum, u) => sum + (u.lessons ?? []).filter((l) => progressByLesson[l.id] === "completed").length,
      0
    );
    const coreCompleteForGroup = coreTotalForGroup > 0 && coreDoneForGroup === coreTotalForGroup;

    for (const unit of group.units) {
      const isExamUnit = isExamUnitTitle(unit.title_fr);
      const locked = (!unit.is_free && !isPremium) || (isExamUnit && !coreCompleteForGroup);
      const total = unit.lessons?.length ?? 0;
      const doneCount = (unit.lessons ?? []).filter(
        (l) => progressByLesson[l.id] === "completed"
      ).length;
      if (!locked && doneCount < total) {
        currentUnitId = unit.id;
        currentCycle = group.cycle;
        break outer;
      }
    }
  }

  // Un seul cycle ouvert à la fois, replié par défaut sauf celui du
  // "Continuer ici" — évite une page interminable quand il y a beaucoup
  // de cycles.
  const [openCycle, setOpenCycle] = useState(
    currentCycle ?? unitsByCycle[0]?.cycle ?? null
  );

  return (
    <div className="space-y-4">
      {unitsByCycle.map((group) => {
        const isOpen = openCycle === group.cycle;
        const cycleTotal = group.units.reduce(
          (sum, u) => sum + (u.lessons?.length ?? 0),
          0
        );
        const cycleDone = group.units.reduce(
          (sum, u) =>
            sum +
            (u.lessons ?? []).filter((l) => progressByLesson[l.id] === "completed").length,
          0
        );
        const cycleComplete = cycleTotal > 0 && cycleDone === cycleTotal;

        // Les unités "examen de cycle" ne doivent se débloquer qu'une fois
        // toutes les autres unités du cycle terminées — on calcule donc leur
        // progression à part, sans compter l'examen lui-même dans le total.
        const coreUnits = group.units.filter((u) => !isExamUnitTitle(u.title_fr));
        const coreTotal = coreUnits.reduce((sum, u) => sum + (u.lessons?.length ?? 0), 0);
        const coreDone = coreUnits.reduce(
          (sum, u) =>
            sum + (u.lessons ?? []).filter((l) => progressByLesson[l.id] === "completed").length,
          0
        );
        const coreComplete = coreTotal > 0 && coreDone === coreTotal;

        return (
          <section
            key={group.cycle}
            className="bg-white rounded-2xl shadow-sm border border-gold/15 overflow-hidden"
          >
            <button
              onClick={() => setOpenCycle(isOpen ? null : group.cycle)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left"
            >
              <span className="bg-gold text-[#2A1F04] text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full shrink-0">
                {group.cycle}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-ink/60 font-extrabold text-base truncate">
                  {CYCLE_LABELS[group.cycle] ?? group.cycle}
                </h2>
                <p className="text-xs font-bold text-ink/40 mt-0.5">
                  {cycleComplete ? "✓ Terminé" : `${cycleDone} / ${cycleTotal} leçons`}
                </p>
              </div>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-black shrink-0 transition-colors ${
                  isOpen ? "bg-ink text-white" : "bg-gold/20 text-[#7a5c14]"
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {coreComplete && group.cycle !== "0" && (
              <div className="px-5 pb-4 -mt-1">
                
                  href={`/api/certificate?cycle=${group.cycle}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#7a5c14] bg-gold/15 hover:bg-gold/25 transition-colors px-3 py-2 rounded-lg"
                >
                  <Award size={16} /> Télécharger votre certificat
                </a>
              </div>
            )}

            {isOpen && (
              <div className="px-5 pb-8">
                <div className="relative pt-8">
                  <div className="absolute left-1/2 top-10 bottom-2 -translate-x-1/2 border-l-2 border-dashed border-gold/40" />
                  <div className="relative space-y-8">
                    {group.units.map((unit, i) => {
                      const Icon = unitIcon(unit.title_fr);
                      const isExamUnit = isExamUnitTitle(unit.title_fr);
                      const premiumLocked = !unit.is_free && !isPremium;
                      const examLocked = isExamUnit && !coreComplete;
                      const locked = premiumLocked || examLocked;
                      const total = unit.lessons?.length ?? 0;
                      const doneCount = (unit.lessons ?? []).filter(
                        (l) => progressByLesson[l.id] === "completed"
                      ).length;
                      const isDone = total > 0 && doneCount === total;
                      const isCurrent = unit.id === currentUnitId;
                      const expanded = expandedUnitId === unit.id;
                      const align = i % 2 === 0 ? "justify-start" : "justify-end";

                      let circleCls = "bg-white border-4 border-ink/15 text-ink";
                      if (locked) circleCls = "bg-gray-200 border-4 border-white text-gray-400";
                      else if (isDone) circleCls = "bg-ink border-4 border-white text-white";
                      else if (isCurrent) circleCls = "bg-gold border-4 border-white text-[#2A1F04]";

                      return (
                        <div key={unit.id}>
                          <div className={`flex ${align}`}>
                            <div className="w-40 flex flex-col items-center text-center relative">
                              {isCurrent && (
                                <span className="absolute -top-7 bg-ink text-white text-xs font-extrabold px-2.5 py-1 rounded-lg whitespace-nowrap">
                                  Continuer ici
                                </span>
                              )}
                              <button
                                onClick={() => !locked && setExpandedUnitId(expanded ? null : unit.id)}
                                disabled={locked}
                                className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${circleCls}`}
                              >
                                {locked ? <Lock size={28} /> : isDone ? <Check size={32} /> : <Icon size={30} />}
                              </button>
                              <p className="mt-2.5 font-extrabold text-base text-ink leading-tight">
                                {unit.title_fr}
                              </p>
                              <p className="text-xs font-bold text-ink/45 mt-0.5">
                                {examLocked
                                  ? "Terminez le cycle"
                                  : premiumLocked
                                  ? "Premium"
                                  : `${doneCount} / ${total} leçons`}
                              </p>
                            </div>
                          </div>

                          {expanded && !locked && (
                            <div className="mt-4 bg-white rounded-2xl p-5 shadow-md border border-gold/20 float-in">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center">
                                  <Icon size={22} className="text-ink" />
                                </div>
                                <h3 className="font-extrabold text-ink">{unit.title_fr}</h3>
                                <ChevronDown size={18} className="text-ink/30 ml-auto" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(unit.lessons ?? [])
                                  .sort((a, b) => a.order_index - b.order_index)
                                  .map((lesson) => {
                                    const status = progressByLesson[lesson.id] ?? "not_started";
                                    const cls =
                                      status === "completed"
                                        ? "bg-ink/10 text-ink"
                                        : "bg-gold/20 text-[#7a5c14]";
                                    return (
                                      <Link
                                        key={lesson.id}
                                        href={`/lesson/${lesson.id}`}
                                        className={`text-sm px-3 py-2 rounded-xl font-bold ${cls}`}
                                      >
                                        {status === "completed" ? "✓ " : ""}
                                        {lesson.title_fr}
                                      </Link>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
