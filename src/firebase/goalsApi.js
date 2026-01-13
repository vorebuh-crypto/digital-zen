import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

// ✅ Подписка (чтобы App.jsx мог импортировать subscribeToGoals)
export function subscribeToGoals(userId, cb) {
  const ref = collection(db, "users", userId, "goals");
  const q = query(ref, orderBy("created_at", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(data);
    },
    (err) => {
      console.error("subscribeToGoals error:", err);
      cb([]);
    }
  );
}

// ✅ Сохранение цели в формате, который ждёт UI (Goals/GoalsList)
export async function saveGoal(userId, goal) {
  const ref = collection(db, "users", userId, "goals");

  await addDoc(ref, {
    app: String(goal?.app || "").trim(),
    weeklyLimit: Number(goal?.weeklyLimit || 0),
    description: goal?.description ? String(goal.description) : "",
    created_at: new Date().toISOString(),
  });

  return true;
}

// (не обязательно, но удобно)
export async function clearGoals(userId) {
  const ref = collection(db, "users", userId, "goals");
  const snap = await getDocs(ref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteGoal(userId, goalId) {
  await deleteDoc(doc(db, "users", userId, "goals", goalId));
}
