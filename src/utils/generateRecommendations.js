export function generateRecommendations(sessions, goals) {
  if (!sessions?.length) return ["Загрузите данные, чтобы получить рекомендации."];

  const recs = [];

  // Берём "последнюю дату" из данных как "текущий день" (так работает и с историческими CSV)
  const lastDate = sessions
    .map((s) => s.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  // Вспомогалка: последние 7 дней относительно lastDate
  const last = new Date(lastDate);
  const weekStart = new Date(last);
  weekStart.setDate(weekStart.getDate() - 6); // 7 дней включая lastDate

  const inLast7Days = (dateStr) => {
    const d = new Date(dateStr);
    return d >= weekStart && d <= last;
  };

  // Частоты по приложениям и категориям (за 7 дней)
  const appTotals = {};
  const categoryTotals = {};

  sessions.forEach((s) => {
    const app = s.app ?? s.app_name ?? s.appName ?? "Unknown App";
    const category = s.category ?? "Uncategorized";
    const duration = Number(s.duration ?? s.duration_min ?? 0);

    if (!s.date || !inLast7Days(s.date)) return;

    appTotals[app] = (appTotals[app] || 0) + duration;
    categoryTotals[category] = (categoryTotals[category] || 0) + duration;
  });

  // 1) Проверка целей (weeklyLimit)
  (goals || []).forEach((goal) => {
    const app = goal.app;
    const limit = Number(goal.weeklyLimit);

    if (!app || !Number.isFinite(limit) || limit <= 0) return;

    const spent = appTotals[app] || 0;

    if (spent > limit) {
      recs.push(`Вы превысили недельный лимит для "${app}": ${spent} мин (лимит ${limit} мин). Попробуйте сократить использование на 10–15% на следующей неделе.`);
    } else if (spent > 0 && spent >= limit * 0.8) {
      recs.push(`Вы близко к лимиту по "${app}": ${spent} мин из ${limit} мин за последние 7 дней. Хороший момент, чтобы сделать паузу.`);
    }
  });

  // 2) Если Social занимает много времени
  const social = categoryTotals["Social"] || categoryTotals["Соцсети"] || 0;
  if (social >= 180) {
    recs.push("За последние 7 дней много времени ушло на Social. Попробуйте: отключить уведомления и выделить 2 коротких окна в день для соцсетей.");
  }

  // 3) Самое “пожирающее” приложение
  const topApp = Object.entries(appTotals).sort((a, b) => b[1] - a[1])[0];
  if (topApp && topApp[1] >= 120) {
    recs.push(`Больше всего времени за 7 дней ушло на "${topApp[0]}" (${topApp[1]} мин). Подумайте, какую 1 привычку можно поменять, чтобы уменьшить это на 15–30 мин.`);
  }

  if (!recs.length) return ["Отличная работа! Пока не найдено областей, требующих улучшения."];

  return recs;
}
