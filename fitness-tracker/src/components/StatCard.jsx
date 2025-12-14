export default function StatCard({ label, value, hint }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
        <div className="text-sm text-white/70">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
      </div>
    );
  }