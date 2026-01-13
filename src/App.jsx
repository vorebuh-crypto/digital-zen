import { useState, useEffect } from "react";

// Компоненты
import Layout from "./components/Layout";
import UploadCSV from "./components/UploadCSV";
import SessionsTable from "./components/SessionsTable";
import StatisticsDashboard from "./components/StatisticsDashboard";
import Goals from "./components/Goals";
import GoalsList from "./components/GoalsList";
import HomeDashboard from "./components/HomeDashboard";
import WeeklyStats from "./components/WeeklyStats";
import Recommendations from "./components/Recommendations";

// Firebase API
import { saveSessions } from "./firebase/sessionsApi";
import { loadSessions } from "./firebase/loadSessions";
import { saveGoal } from "./firebase/goalsApi";
import { loadGoals } from "./firebase/loadGoals";
import { clearAllUserData } from "./firebase/adminTools";

// Material UI
import { Button, Box } from "@mui/material";

const USER_ID = "demo-user";

function App() {
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);

  // Страница по умолчанию — главная
  const [page, setPage] = useState("home");

  // Загружаем данные при старте приложения
  useEffect(() => {
    async function loadAll() {
      const sessionData = await loadSessions(USER_ID);
      setSessions(sessionData);

      const goalsData = await loadGoals(USER_ID);
      setGoals(goalsData);
    }

    loadAll();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Digital Zen</h1>

      {/* Навигация */}
      <Layout current={page} setCurrent={setPage} />

      {/* Кнопка очистки Firestore */}
      <Box sx={{ textAlign: "right", mb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={async () => {
            if (confirm("Удалить все данные?")) {
              await clearAllUserData(USER_ID);
              alert("Все данные удалены!");
              setSessions([]);
              setGoals([]);
              setPage("home");
            }
          }}
        >
          Очистить Firestore
        </Button>
      </Box>

      {/* Главная */}
      {page === "home" && (
        <HomeDashboard sessions={sessions} setPage={setPage} />
      )}

      {/* Раздел: Данные */}
      {page === "data" && (
        <>
          <UploadCSV
            onData={async (data) => {
              // локально обновили, чтобы сразу видеть таблицу
              setSessions(data);

              // сохранили в Firestore
              await saveSessions(USER_ID, data);

              // затем перечитали из Firestore (на случай нормализации/полей)
              const sessionData = await loadSessions(USER_ID);
              setSessions(sessionData);

              alert("Данные сохранены в Firestore!");
            }}
          />
          <SessionsTable sessions={sessions} />
        </>
      )}

      {/* Раздел: Статистика */}
      {page === "stats" && <StatisticsDashboard sessions={sessions} />}

      {/* Раздел: Неделя */}
      {page === "week" && <WeeklyStats sessions={sessions} />}

      {/* Раздел: Рекомендации */}
      {page === "recs" && (
        <Recommendations sessions={sessions} goals={goals} />
      )}

      {/* Раздел: Цели */}
      {page === "goals" && (
        <>
          <Goals
            onCreate={async (goal) => {
              await saveGoal(USER_ID, goal);

              // перечитываем цели, чтобы список обновился
              const goalsData = await loadGoals(USER_ID);
              setGoals(goalsData);

              alert("Цель сохранена!");
            }}
          />

          {/* Список целей с прогрессом */}
          <GoalsList goals={goals} sessions={sessions} />
        </>
      )}
    </div>
  );
}

export default App;
