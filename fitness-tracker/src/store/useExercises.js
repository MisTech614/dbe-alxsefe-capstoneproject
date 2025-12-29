import { create } from "zustand";

const API_BASE = "https://wger.de/api/v2";

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, "").trim();
}

function normalizeExercise(item) {
  return {
    id: item.id,
    name: item.name || "Unnamed exercise",
    description: stripHtml(item.description),
    muscles: item.muscles || [],
    muscles_secondary: item.muscles_secondary || [],
    category: item.category || null,
    equipment: item.equipment || [],
  };
}

export const useExercises = create((set, get) => ({
  exercises: [],
  loading: false,
  error: null,

  async fetchExercises({ limit = 200 } = {}) {
    if (get().loading) return; // prevent parallel calls
    set({ loading: true, error: null });

    try {
      const url = `${API_BASE}/exercise/?limit=${limit}&status=2`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`WGER request failed: ${res.status}`);
      }

      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];

      set({
        exercises: results.map(normalizeExercise),
        loading: false,
        error: null,
      });
    } catch (e) {
      set({
        loading: false,
        error: e?.message || "Failed to fetch exercises. Check your connection.",
      });
    }
  },
}));
