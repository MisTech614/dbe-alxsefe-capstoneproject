import { useEffect, useMemo, useState } from "react";
import { useWorkouts } from "../store/useWorkouts";

const MUSCLES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Hamstrings",
  "Glutes",
  "Posterior Chain",
  "Full Body",
  "Other",
];

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function emptySet() {
  return { id: uid(), reps: 10, weight: 20 };
}

function emptyExercise(prefill) {
  return {
    id: uid(),
    name: prefill?.name || "",
    muscleGroup: prefill?.muscleGroup || "Other",
    sets: [emptySet()],
  };
}

export default function WorkoutLog({ prefillExercise }) {
  const addWorkout = useWorkouts((s) => s.addWorkout);

  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState([emptyExercise()]);

  // When ExerciseSearch selects an exercise, we auto-add it as a new exercise block
  useEffect(() => {
    if (!prefillExercise) return;
    setExercises((prev) => [...prev, emptyExercise(prefillExercise)]);
  }, [prefillExercise]);

  const totals = useMemo(() => {
    let totalSets = 0;
    let totalReps = 0;
    let totalWeightLifted = 0;

    for (const ex of exercises) {
      for (const s of ex.sets) {
        const reps = Number(s.reps) || 0;
        const weight = Number(s.weight) || 0;
        totalSets += 1;
        totalReps += reps;
        totalWeightLifted += reps * weight;
      }
    }

    return {
      totalSets,
      totalReps,
      totalWeightLifted,
      avgRepsPerSet: totalSets ? totalReps / totalSets : 0,
    };
  }, [exercises]);

  function updateExercise(exId, patch) {
    setExercises((xs) => xs.map((x) => (x.id === exId ? { ...x, ...patch } : x)));
  }

  function updateSet(exId, setId, patch) {
    setExercises((xs) =>
      xs.map((x) =>
        x.id !== exId
          ? x
          : { ...x, sets: x.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
      )
    );
  }

  function addExercise() {
    setExercises((xs) => [...xs, emptyExercise()]);
  }

  function removeExercise(exId) {
    setExercises((xs) => xs.filter((x) => x.id !== exId));
  }

  function addSet(exId) {
    setExercises((xs) =>
      xs.map((x) => (x.id === exId ? { ...x, sets: [...x.sets, emptySet()] } : x))
    );
  }

  function removeSet(exId, setId) {
    setExercises((xs) =>
      xs.map((x) =>
        x.id !== exId ? x : { ...x, sets: x.sets.filter((s) => s.id !== setId) }
      )
    );
  }

  function saveWorkout() {
    // Basic validation: at least 1 exercise with a name and at least 1 set
    const cleaned = exercises
      .map((ex) => ({
        ...ex,
        name: ex.name.trim(),
        sets: ex.sets
          .map((s) => ({
            ...s,
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
          }))
          .filter((s) => s.reps > 0),
      }))
      .filter((ex) => ex.name && ex.sets.length > 0);

    if (!cleaned.length) return;

    addWorkout({
      id: uid(),
      title: title.trim() || "Workout",
      exercises: cleaned,
      timestamp: Date.now(), // ✅ timestamp requirement
    });

    setTitle("");
    setExercises([emptyExercise()]);
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Workout title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Upper Body Strength"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {/* Inline metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total weight" value={totals.totalWeightLifted.toLocaleString()} />
        <MiniStat label="Total sets" value={totals.totalSets} />
        <MiniStat label="Total reps" value={totals.totalReps} />
        <MiniStat label="Avg reps/set" value={totals.avgRepsPerSet.toFixed(1)} />
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div key={ex.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">Exercise</label>
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                      placeholder="e.g., Squat"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">Muscle group</label>
                    <select
                      value={ex.muscleGroup}
                      onChange={(e) => updateExercise(ex.id, { muscleGroup: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {MUSCLES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sets */}
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500">
                    <div className="col-span-3">Set</div>
                    <div className="col-span-4">Reps</div>
                    <div className="col-span-4">Weight</div>
                    <div className="col-span-1" />
                  </div>

                  {ex.sets.map((s, setIndex) => (
                    <div key={s.id} className="grid grid-cols-12 gap-2">
                      <div className="col-span-3 flex items-center text-sm font-medium text-slate-700">
                        #{setIndex + 1}
                      </div>

                      <input
                        type="number"
                        min={0}
                        value={s.reps}
                        onChange={(e) => updateSet(ex.id, s.id, { reps: e.target.value })}
                        className="col-span-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      />

                      <input
                        type="number"
                        min={0}
                        value={s.weight}
                        onChange={(e) => updateSet(ex.id, s.id, { weight: e.target.value })}
                        className="col-span-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      />

                      <button
                        type="button"
                        onClick={() => removeSet(ex.id, s.id)}
                        className="col-span-1 grid place-items-center rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100"
                        title="Remove set"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => addSet(ex.id)}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50"
                  >
                    + Add set
                  </button>
                </div>
              </div>

              {exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExercise(ex.id)}
                  className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-black/5 hover:bg-rose-50"
                  title="Remove exercise"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={addExercise}
          className="rounded-2xl bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          + Add exercise
        </button>

        <button
          type="button"
          onClick={saveWorkout}
          className="sm:ml-auto rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Save workout
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Tip: Use Exercise Search to quickly add common exercises.
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
