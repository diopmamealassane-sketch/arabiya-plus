// Simple Leitner-box spaced repetition. 5 boxes; a correct answer promotes
// a word one box (reviewed less often), an incorrect answer sends it back
// to box 1 (reviewed again tomorrow). Intentionally simple for the MVP —
// see the architecture doc for why a full SM-2/Anki-style algorithm is out
// of scope for v1.

const BOX_INTERVALS_DAYS = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};

export function nextBoxLevel(currentLevel, wasCorrect) {
  if (!wasCorrect) return 1;
  return Math.min(currentLevel + 1, 5);
}

export function nextReviewDate(boxLevel, from = new Date()) {
  const days = BOX_INTERVALS_DAYS[boxLevel] ?? 1;
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}
