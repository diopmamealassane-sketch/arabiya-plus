// Retourne la date (YYYY-MM-DD, en UTC) du premier jour du mois en cours.
// Utilisé pour plafonner le nombre de NOUVELLES leçons validées par mois
// (200 max) — le compteur repart naturellement à zéro chaque 1er du mois,
// sans tâche planifiée, exactement comme getWeekStartDate() pour l'XP
// hebdomadaire dans weekUtils.js.
export function getMonthStartDate(date = new Date()) {
  const d = new Date(date);
  const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  return monthStart.toISOString().slice(0, 10);
}

// Retourne la date (YYYY-MM-DD, en UTC) du premier jour du mois SUIVANT —
// utilisée pour indiquer à l'utilisateur quand son quota de nouvelles
// leçons sera de nouveau disponible après avoir atteint la limite.
export function getNextMonthStartDate(date = new Date()) {
  const d = new Date(date);
  const nextMonthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return nextMonthStart.toISOString().slice(0, 10);
}

// Formate une date YYYY-MM-DD en toutes lettres françaises, ex. "1er septembre 2026".
export function formatDateFr(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const dayLabel = day === 1 ? "1er" : String(day);
  return `${dayLabel} ${months[month - 1]} ${year}`;
}

