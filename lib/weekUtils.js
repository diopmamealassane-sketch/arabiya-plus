// Retourne la date (YYYY-MM-DD, en UTC) du lundi de la semaine en cours.
// Utilisé pour remettre l'XP hebdomadaire à zéro sans tâche planifiée :
// on compare simplement ce lundi à celui enregistré la dernière fois.
export function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
