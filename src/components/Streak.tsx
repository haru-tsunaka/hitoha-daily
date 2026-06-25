export default function Streak({ count }: { count: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border text-center">
      <p className="text-xs text-brand-muted mb-1 tracking-wide">連続記録</p>
      <p className="font-serif text-4xl text-navy font-bold">{count}</p>
      <p className="text-xs text-brand-muted mt-1">日</p>
    </div>
  );
}
