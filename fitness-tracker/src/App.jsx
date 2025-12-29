import { useEffect, useMemo, useState } from "react";
import WorkoutLog from "./components/WorkoutLog";
import WorkoutHistory from "./components/WorkoutHistory";
import ExerciseSearch from "./components/ExerciseSearch";
import ProgressOverview from "./components/ProgressOverview";
import { useWorkouts } from "./store/useWorkouts";
import { useExercises } from "./store/useExercises"; // Added store for WGER API

function Panel({ id,title, subtitle, children }) {
  return (
    <section id={id} //Adding the id aspect to incorporate navigation in the homepage
             className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
          {icon}
        </div>
        <div className="text-sm font-medium text-slate-600">{label}</div>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

export default function App() {
  const workouts = useWorkouts((s) => s.workouts);

  // the WGER API state
  const fetchExercises = useExercises((s) => s.fetchExercises);
  const apiLoading = useExercises((s) => s.loading);
  const apiError = useExercises((s) => s.error);

  // local UI state
  const [selectedExercise, setSelectedExercise] = useState(null);

  // fetch exercise catalog once
  useEffect(() => {
    fetchExercises({ limit: 200 });
  }, [fetchExercises]);

  const prefill = useMemo(() => {
    if (!selectedExercise) return null;
    return { name: selectedExercise.name, muscleGroup: selectedExercise.muscleGroup || "Other" };
  }, [selectedExercise]);

  const total = workouts.length;

  const thisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return workouts.filter((w) => new Date(w.timestamp) >= start).length;
  }, [workouts]);

  const totalVolume = useMemo(() => {
    let sum = 0;
    for (const w of workouts) {
      for (const ex of w.exercises || []) {
        for (const s of ex.sets || []) {
          sum += (Number(s.reps) || 0) * (Number(s.weight) || 0);
        }
      }
    }
    return sum;
  }, [workouts]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 shadow">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              🏋️
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">FitTrack</div>
              <div className="text-sm text-white/80">Your fitness journey</div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <span className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20">
              Home
            </span>
            {/*added clickable aspect by making the top navigation buttons scroll*/}
            <button
                 onClick={() => document.getElementById("log-workout")?.scrollIntoView({ behavior: "smooth" })}
                 className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 hover:bg-white/15"
             >
              Log Workout 
            </button> 
            <button
                onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 hover:bg-white/15"
             > 
              History
            </button>
            <button
               onClick={() => document.getElementById("progress")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 hover:bg-white/15"
             >
              Progress
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* API error handling aspect */}
        {apiError && (
          <div className="mb-6 rounded-3xl bg-rose-50 px-5 py-4 text-sm text-rose-800 ring-1 ring-rose-100">
            <div className="font-semibold">Exercise data could not be loaded</div>
            <div className="mt-1">{apiError}</div>
          </div>
        )}

        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-7 text-white shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Welcome Back!</h1>
              <p className="mt-2 text-white/85">Ready to start your fitness journey?</p>
            </div>

            <button
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white/95"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              + Log New Workout
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="🔥" label="Streak" value="0" sub="days" />
          <StatCard icon="🗓️" label="This Week" value={thisWeek} sub="workouts" />
          <StatCard icon="🏁" label="Total" value={total} sub="workouts" />
          <StatCard icon="📈" label="Volume" value={totalVolume.toLocaleString()} sub="total lifted" />
        </section>

        {/* Content */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Panel id="log-workout" 
                   title="Log Workout" 
                   subtitle="Add exercises with sets, reps, and weights (saved with timestamp).">
              <WorkoutLog prefillExercise={prefill} />
            </Panel>

            <Panel id="progress" 
                   title="Progress" 
                   subtitle="Summary + bar trends (no chart library).">
              <ProgressOverview />
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel
              title="Exercise Search"
              subtitle={
                apiLoading
                  ? "Loading exercises from WGER…"
                  : "Search by name or muscle group and add to your workout."
              }
            >
              <ExerciseSearch onSelectExercise={setSelectedExercise} />
            </Panel>

            <Panel id="history" 
                   title="History" 
                   subtitle="Filter by date or exercise, then expand to view details.">
              <WorkoutHistory />
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}
