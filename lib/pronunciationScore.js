import { normalizeArabic } from "./arabicNormalize";

// Distance de Levenshtein classique (nombre minimal d'insertions,
// suppressions ou substitutions pour passer d'une chaîne à l'autre).
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // suppression
        prevRow[j - 1] + cost // substitution
      );
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

// Score de 0 à 100 : à quel point le texte reconnu par la reconnaissance
// vocale du navigateur ressemble au mot arabe attendu. Réutilise la même
// normalisation que la dictée (tolérante aux harakat manquantes et aux
// variantes de alef/ya/ta marbuta), donc un score de 100 ne signifie pas
// "identique caractère pour caractère" mais "reconnu comme le bon mot".
export function scorePronunciation(spokenText, targetText) {
  const spoken = normalizeArabic(spokenText);
  const target = normalizeArabic(targetText);

  if (!target) return 0;
  if (!spoken) return 0;
  if (spoken === target) return 100;

  const distance = levenshtein(spoken, target);
  const maxLen = Math.max(spoken.length, target.length);
  const similarity = 1 - distance / maxLen;
  return Math.max(0, Math.round(similarity * 100));
}
