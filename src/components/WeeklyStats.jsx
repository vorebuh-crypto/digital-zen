import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Группировка за последние 7 дней относительно "сегодня"
function groupLastWeek(sessions) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const summary = {};

  sessions.forEach((s) => {
    const date = new Date(s.date);
    if (date >= weekAgo && date <= now) {
      const app = s.app || s.app_name || s.appName || "Unknown";
      const dur = Number(s.duration || s.duration_min || 0);

      if (!summary[app]) summary[app] = 0;
      summary[app] += dur;
    }
  });

  return Object.entries(summary).map(([app, total]) => ({ app, total }));
}

export default function WeeklyStats({ sessions }) {
  const data = groupLastWeek(sessions || []);

  if (!data.length) return <p>Нет данных за последние 7 дней. Загрузите CSV.</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Статистика за неделю</h3>

      <BarChart width={700} height={320} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="app" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" />
      </BarChart>

      <table border="1" cellPadding="6" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Приложение</th>
            <th>Время за неделю (мин)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.app}</td>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
