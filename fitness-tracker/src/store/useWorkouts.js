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

export const useWorkouts = create((set, get) => ({
  workouts: loadInitial(),

  addWorkout: (workout) => {
    const next = [workout, ...get().workouts];
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
