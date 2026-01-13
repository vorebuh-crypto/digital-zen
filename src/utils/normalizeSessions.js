/**
 * normalizeSessions(rawRows)
 * Приводит строки CSV к единому формату:
 * { date: "YYYY-MM-DD", app: "YouTube", category: "Social", duration: 40 }
 */

const dateKeys = ["date", "Дата", "дата", "Date"];
const appKeys = ["app", "App", "appName", "app_name", "application", "application_name", "Приложение", "приложение"];
const categoryKeys = ["category", "Category", "категория", "Категория"];
const durationKeys = [
  "duration",
  "Duration",
  "duration_min",
  "minutes",
  "Minutes",
  "duration (min)",
  "Duration (min)",
  "Duration (mins)",
  "Длительность",
  "длительность",
  "Длительность (мин)",
  "длительность (мин)",
  "minutes_per_day",
];

function pickFieldCaseInsensitive(obj, candidates) {
  if (!obj) return undefined;

  // 1) точное совпадение
  for (const k of candidates) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  }

  // 2) совпадение по lowerCase
  const map = new Map();
  for (const key of Object.keys(obj)) {
    map.set(String(key).trim().toLowerCase(), obj[key]);
  }
  for (const k of candidates) {
    const v = map.get(String(k).trim().toLowerCase());
    if (v !== undefined) return v;
  }

  return undefined;
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const s = String(value).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// Поддержка дат: "YYYY-MM-DD", "DD.MM.YYYY", "DD/MM/YYYY", "MM/DD/YYYY"
function normalizeDate(value) {
  if (!value) return new Date().toISOString().split("T")[0];

  const s = String(value).trim();

  // YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return s;

  // DD.MM.YYYY или DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const mm = String(mdy[1]).padStart(2, "0");
    const dd = String(mdy[2]).padStart(2, "0");
    const yyyy = mdy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // fallback: пробуем Date.parse
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

export function normalizeSessions(rawRows) {
  if (!Array.isArray(rawRows)) return [];

  return rawRows.map((row) => {
    const dateRaw = pickFieldCaseInsensitive(row, dateKeys);
    const appRaw = pickFieldCaseInsensitive(row, appKeys);
    const catRaw = pickFieldCaseInsensitive(row, categoryKeys);
    const durRaw = pickFieldCaseInsensitive(row, durationKeys);

    const date = normalizeDate(dateRaw);
    const app = (appRaw ? String(appRaw).trim() : "Unknown App") || "Unknown App";
    const category = (catRaw ? String(catRaw).trim() : "Uncategorized") || "Uncategorized";

    // duration в минутах
    let duration = toNumber(durRaw);
    duration = Math.max(0, Math.round(duration));

    return {
      date,
      app,
      category,
      duration,
      __raw: row, // можно убрать, если не нужно
    };
  });
}
