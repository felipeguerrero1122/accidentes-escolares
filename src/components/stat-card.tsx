export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-pink-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-pink-900">{value}</p>
    </div>
  );
}
