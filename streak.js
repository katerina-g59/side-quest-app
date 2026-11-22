// ===== Týdenní streak (série týdnů) =====
// Samostatný soubor, aby ho mohla používat appka (index.html) i testovací stránka (tests.html).
// Musí ležet ve stejné složce jako index.html.
//
// Pravidla:
// - Týden = pondělí až neděle.
// - Týden se počítá, když v něm byl splněný aspoň 1 quest (jakýkoli).
// - Streak = kolik týdnů v řadě má aspoň 1 splněný quest. Počítá se z dat v deníku,
//   nic nového se kvůli tomu neukládá. Questy bez data (splněné dřív, než appka
//   ukládala datum) se nepočítají.
// - Když tenhle týden ještě nic nesplnila, streak se počítá do minulého týdne
//   a appka ukáže "Tento týden ti ještě chybí quest 🔥". Na 0 spadne až ve chvíli,
//   kdy uplyne celý týden bez questu.

const STREAK_MILESTONES = [2, 4, 8, 12];   // kdy appka jednou pogratuluje

// "2026-11-16" → pořadové číslo dne (bez starostí s letním časem)
function streakDayNumber(date) {
  const [y, m, d] = date.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

// "2026-11-16" → pořadové číslo týdne (pondělí–neděle).
// Den 0 (1. 1. 1970) byl čtvrtek, proto +3: pondělí 29. 12. 1969 je začátek týdne 0.
function streakWeekIndex(date) {
  return Math.floor((streakDayNumber(date) + 3) / 7);
}

// Je to platné datum "RRRR-MM-DD"?
function isStreakDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Spočítá streak ze záznamů deníku [{ id, date }, ...] pro daný "dnešek" ("2026-11-20").
// Vrátí: current (aktuální streak), longest (nejdelší streak vůbec),
// thisWeekDone (tento týden už je splněný quest),
// missingThisWeek (streak běží, ale tento týden ještě chybí quest).
function computeStreak(entries, today) {
  const currentWeek = streakWeekIndex(today);
  const weeks = new Set();
  (Array.isArray(entries) ? entries : []).forEach(entry => {
    if (!entry || !isStreakDate(entry.date)) return;       // bez data se nepočítá
    const week = streakWeekIndex(entry.date);
    if (week <= currentWeek) weeks.add(week);              // budoucí data ignorujeme
  });

  const thisWeekDone = weeks.has(currentWeek);
  let current = 0;
  let week = thisWeekDone ? currentWeek : currentWeek - 1;
  while (weeks.has(week)) {
    current++;
    week--;
  }

  let longest = 0, run = 0, previous = null;
  [...weeks].sort((a, b) => a - b).forEach(w => {
    run = previous !== null && w === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = w;
  });

  return { current, longest, thisWeekDone, missingThisWeek: !thisWeekDone && current > 0 };
}

// Česky: 1 týden, 2–4 týdny, 5 a víc týdnů (i 0 týdnů)
function weeksText(n) {
  const word = n === 1 ? "týden" : n >= 2 && n <= 4 ? "týdny" : "týdnů";
  return n + " " + word;
}

// Odznak vedle profilového kolečka: "🔥 3" (tento týden už je quest),
// "⚠ 3" (streak běží, ale tento týden ještě chybí quest), "" = schovat (streak 0)
function streakBadge(streak) {
  if (!streak || streak.current === 0) return "";
  return (streak.thisWeekDone ? "🔥 " : "⚠ ") + streak.current;
}

// Oslava milníku: které milníky (2, 4, 8, 12) streak už dosáhl a ještě nebyly ukázané?
// shown = už ukázané milníky (z paměti prohlížeče). Vrátí milník k oslavě (ten nejvyšší,
// nebo null) a nový seznam ukázaných. Každý milník se ukáže jen jednou.
function streakMilestone(shown, streak) {
  const already = Array.isArray(shown) ? shown.filter(m => STREAK_MILESTONES.includes(m)) : [];
  const reached = STREAK_MILESTONES.filter(m => m <= streak && !already.includes(m));
  return {
    celebrate: reached.length ? reached[reached.length - 1] : null,
    shown: STREAK_MILESTONES.filter(m => already.includes(m) || reached.includes(m))
  };
}
