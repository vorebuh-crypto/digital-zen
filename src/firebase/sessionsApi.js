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

// ✅ Подписка (чтобы App.jsx мог импортировать subscribeToSessions)
export function subscribeToSessions(userId, cb) {
  const ref = collection(db, "users", userId, "sessions");
  const q = query(ref, orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(data);
    },
    (err) => {
      console.error("subscribeToSessions error:", err);
      cb([]);
    }
  );
}

// ✅ Сохранение массива сессий
export async function saveSessions(userId, sessions) {
  const ref = collection(db, "users", userId, "sessions");
  const list = Array.isArray(sessions) ? sessions : [];

  for (const s of list) {
    await addDoc(ref, {
      date: s.date,
      app: s.app ?? "Unknown App",
      category: s.category ?? "Uncategorized",
      duration: Number(s.duration ?? 0),
      created_at: new Date().toISOString(),
    });
  }

  return true;
}

// (не обязательно, но удобно)
export async function clearSessions(userId) {
  const ref = collection(db, "users", userId, "sessions");
  const snap = await getDocs(ref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteSession(userId, sessionId) {
  await deleteDoc(doc(db, "users", userId, "sessions", sessionId));
}
