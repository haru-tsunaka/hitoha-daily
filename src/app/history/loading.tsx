export default function HistoryLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-pulse">
      <div className="h-5 w-16 bg-navy/10 rounded" />

      <div>
        <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-brand-border">
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-2" />
              <div className="space-y-1.5">
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
