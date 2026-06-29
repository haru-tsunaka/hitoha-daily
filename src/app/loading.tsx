export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-pulse">
      {/* Notice */}
      <div className="h-16 bg-gold/5 rounded-xl" />

      {/* Status + Streak */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        <div className="w-16 h-16 bg-gray-100 rounded-lg" />
      </div>

      {/* Morning */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
        <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
        <div className="h-10 bg-gray-100 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Evening */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
        <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
        <div className="h-16 bg-gray-100 rounded-lg" />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
        <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
