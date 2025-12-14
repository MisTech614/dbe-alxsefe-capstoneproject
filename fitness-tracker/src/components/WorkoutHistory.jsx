import { useMemo, useState } from "react";
import { useWorkouts } from "../store/useWorkouts";
import { dayKey, formatDateTime } from "../utils/format";

function calcWorkoutSummary(workout) {
  let sets = 0;
  let reps = 0;
  let weight = 0;

  for (const ex of workout.exercises || []) {
    for (const s of ex.sets || []) {
      sets += 1;
      reps += Number(s.reps) || 0;
      weight += (Number(s.reps) || 0) * (Number(s.weight) || 0);
    }
  }
  return { sets, reps, weight };
}

export default function WorkoutHistory() {
  const workouts = useWorkouts((s) => s.workouts);
  const deleteWorkout = useWorkouts((s) => s.deleteWorkout);

  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState(""); // filter by exercise or title
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  const grouped = useMemo(() => {
    const filtered = workouts.filter((w) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (w.title || "").toLowerCase().includes(q) ||
        (w.exercises || []).some(
          (ex) =>
            (ex.name || "").toLowerCase().includes(q) ||
            (ex.muscleGroup || "").toLowerCase().includes(q)
        );

      const matchesDate = !dateFilter || dayKey(w.timestamp) === dateFilter;

      return matchesQuery && matchesDate;
    });

    const map = new Map();
    for (const w of filtered) {
      const k = dayKey(w.timestamp);
      const list = map.get(k) || [];
      list.push(w);
      map.set(k, list);
    }

    const days = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([day, list]) => ({
        day,
        workouts: list.sort((a, b) => b.timestamp - a.timestamp),
      }));

    return days;
  }, [workouts, query, dateFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by workout title, exercise, or muscle group…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {!workouts.length ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-black/5">
          No workouts logged yet. Save your first workout to see history here.
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-black/5">
          No workouts match your filters. Try another date or keyword.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ day, workouts }) => (
            <div key={day}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">{day}</h3>
                <span className="text-xs text-slate-500">{workouts.length} workout(s)</span>
              </div>

              <div className="space-y-3">
                {workouts.map((w) => {
                  const s = calcWorkoutSummary(w);
                  const isOpen = openId === w.id;

                  return (
                    <div key={w.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : w.id)}
                        className="flex w-full items-start justify-between gap-3 text-left"
                      >
                        <div>
                          <div className="text-base font-semibold text-slate-900">{w.title}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {formatDateTime(w.timestamp)}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <Pill label={`${s.weight.toLocaleString()} total weight`} />
                            <Pill label={`${s.sets} sets`} />
                            <Pill label={`${w.exercises.length} exercises`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                            {isOpen ? "Hide" : "View"}
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-4 space-y-4">
                          {w.exercises.map((ex) => (
                            <div key={ex.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-slate-900">{ex.name}</div>
                                  <div className="text-xs text-slate-500">{ex.muscleGroup}</div>
                                </div>
                                <div className="text-xs text-slate-500">{ex.sets.length} set(s)</div>
                              </div>

                              <div className="mt-3 overflow-x-auto">
                                <table className="w-full min-w-[360px] text-sm">
                                  <thead>
                                    <tr className="text-left text-xs text-slate-500">
                                      <th className="py-2 pr-2">Set</th>
                                      <th className="py-2 pr-2">Reps</th>
                                      <th className="py-2 pr-2">Weight</th>
                                      <th className="py-2 pr-2">Volume</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ex.sets.map((set, idx) => {
                                      const reps = Number(set.reps) || 0;
                                      const weight = Number(set.weight) || 0;
                                      return (
                                        <tr key={set.id} className="border-t border-slate-200">
                                          <td className="py-2 pr-2">#{idx + 1}</td>
                                          <td className="py-2 pr-2">{reps}</td>
                                          <td className="py-2 pr-2">{weight}</td>
                                          <td className="py-2 pr-2">{(reps * weight).toLocaleString()}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Delete this workout?")) {
                                  deleteWorkout(w.id);
                                  setOpenId(null);
                                }
                              }}
                              className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Delete workout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ label }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-700">
      {label}
    </span>
  );
}
