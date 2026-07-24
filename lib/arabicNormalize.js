// Normalise un texte arabe pour comparer une réponse tapée par l'utilisateur
// à la bonne réponse, sans exiger une saisie parfaite des harakat (que peu
// de claviers permettent de taper facilement) ni des variantes de hamza.
export function normalizeArabic(str) {
  if (!str) return "";
  return str
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // harakat, sukun, shadda, tatweel...
    .replace(/[إأآا]/g, "ا") // variantes de alef → alef nu
    .replace(/ى/g, "ي") // alef maksura → ya
    .replace(/ة/g, "ه") // ta marbuta → ha (tolérance courante)
    .replace(/\s+/g, "")
    .trim();
}

export function arabicAnswersMatch(userInput, correctAnswer) {
  return normalizeArabic(userInput) === normalizeArabic(correctAnswer);
}
