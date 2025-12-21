import { create } from "zustand";

const STORAGE_KEY = "fitness_tracker_workouts_v2";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function ensureWorkoutShape(workout) {
  const safe = { ...workout };

  if (!safe.id) safe.id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  if (!safe.timestamp) safe.timestamp = new Date().toISOString();
  if (!Array.isArray(safe.exercises)) safe.exercises = [];

  // Normalize nested structure
  safe.exercises = safe.exercises.map((ex) => ({
    id: ex?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: ex?.name || "Exercise",
    muscleGroup: ex?.muscleGroup || "Other",
    sets: Array.isArray(ex?.sets) ? ex.sets : [],
  }));

  return safe;
}

export const useWorkouts = create((set, get) => ({
  workouts: loadInitial(),

  addWorkout: (workout) => {
    const safeWorkout = ensureWorkoutShape(workout);
    const next = [safeWorkout, ...get().workouts];
    save(next);
    set({ workouts: next });
  },

  deleteWorkout: (id) => {
    const next = get().workouts.filter((w) => w.id !== id);
    save(next);
    set({ workouts: next });
  },

  clearAll: () => {
    save([]);
    set({ workouts: [] });
  },
}));
