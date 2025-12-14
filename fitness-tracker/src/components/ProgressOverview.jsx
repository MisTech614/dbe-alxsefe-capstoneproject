import { useMemo } from "react";
import { useWorkouts } from "../store/useWorkouts";
import { dayKey } from "../utils/format";

function summarize(workouts) {
  let totalWorkouts = workouts.length;
  let totalSets = 0;
  let totalReps = 0;
  let totalWeightLifted = 0;

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      for (const s of ex.sets || []) {
        const reps = Number(s.reps) || 0;
        const weight = Number(s.weight) || 0;
        totalSets += 1;
        totalReps += reps;
        totalWeightLifted += reps * weight;
      }
    }
  }

  return {
    totalWorkouts,
    totalSets,
    totalWeightLifted,
    avgRepsPerSet: totalSets ? totalReps / totalSets : 0,
  };
}

function buildDailySeries(workouts, limit = 14) {
  const map = new Map();

  for (const w of workouts) {
    const k = dayKey(w.timestamp);
    const cur = map.get(k) || { day: k, weight: 0, workouts: 0 };

    cur.workouts += 1;

    for (const ex of w.exercises || []) {
      for (const s of ex.sets || []) {
        cur.weight += (Number(s.reps) || 0) * (Number(s.weight) || 0);
      }
    }

    map.set(k, cur);
  }

  return Array.from(map.values())
    .sort((a, b) => (a.day < b.day ? -1 : 1))
    .slice(-limit);
}

export default function ProgressOverview() {
  const workouts = useWorkouts((s) => s.workouts);

  const metrics = useMemo(() => summarize(workouts), [workouts]);
  const daily = useMemo(() => buildDailySeries(workouts, 14), [workouts]);

  const maxWeight = Math.max(1, ...daily.map((d) => d.weight));
  const maxWorkouts = Math.max(1, ...daily.map((d) => d.workouts));

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total workouts" value={metrics.totalWorkouts} />
        <Metric label="Total weight lifted" value={metrics.totalWeightLifted.toLocaleString()} />
        <Metric label="Total sets" value={metrics.totalSets} />
        <Metric label="Avg reps / set" value={metrics.avgRepsPerSet.toFixed(1)} />
      </div>

      {/* Bars */}
      {daily.length === 0 ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-black/5">
          Log workouts to see progress trends.
        </div>
      ) : (
        <div className="space-y-6">
          <BarSection
            title="Daily training volume"
            subtitle="Total weight lifted per day"
            data={daily}
            max={maxWeight}
            valueKey="weight"
          />

          <BarSection
            title="Daily workouts"
            subtitle="Workouts completed per day"
            data={daily}
            max={maxWorkouts}
            valueKey="workouts"
          />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 text-white shadow-sm">
      <div className="text-xs font-medium text-white/80">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function BarSection({ title, subtitle, data, max, valueKey }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Last {data.length} days
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((d) => {
          const value = d[valueKey];
          const pct = Math.max(2, Math.round((value / max) * 100));

          return (
            <div key={`${title}-${d.day}`} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-3 text-xs font-medium text-slate-500">
                {d.day.slice(5)}
              </div>

              <div className="col-span-7">
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="col-span-2 text-right text-xs font-semibold text-slate-700">
                {value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
