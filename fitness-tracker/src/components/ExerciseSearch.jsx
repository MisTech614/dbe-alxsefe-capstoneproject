import { useMemo, useState } from "react";

const EXERCISES = [
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { name: "Push Up", muscleGroup: "Chest" },
  { name: "Pull Up", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Barbell Row", muscleGroup: "Back" },
  { name: "Back Squat", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings" },
  { name: "Hip Thrust", muscleGroup: "Glutes" },
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Bicep Curl", muscleGroup: "Arms" },
  { name: "Tricep Pushdown", muscleGroup: "Arms" },
  { name: "Plank", muscleGroup: "Core" },
];

export default function ExerciseSearch({ onSelectExercise }) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");

  const muscles = useMemo(() => {
    const uniq = new Set(EXERCISES.map((e) => e.muscleGroup));
    return ["All", ...Array.from(uniq).sort()];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup.toLowerCase().includes(q);
      const matchesMuscle = muscle === "All" || e.muscleGroup === muscle;
      return matchesQuery && matchesMuscle;
    });
  }, [query, muscle]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: e.g., squat, chest, back…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <select
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          {muscles.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-black/5">
          No exercises match your search. Try another keyword or choose “All”.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((e) => (
            <button
              key={`${e.name}-${e.muscleGroup}`}
              type="button"
              onClick={() => onSelectExercise?.(e)}
              className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm ring-1 ring-black/5 hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div>
                <div className="font-semibold text-slate-900">{e.name}</div>
                <div className="mt-1 text-sm text-slate-500">{e.muscleGroup}</div>
              </div>

              <span className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white group-hover:bg-indigo-700">
                Add
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
