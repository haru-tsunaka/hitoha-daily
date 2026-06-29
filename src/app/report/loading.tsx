export default function ReportLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-pulse">
      <div className="h-5 w-24 bg-navy/10 rounded" />

      {/* Monthly card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-border">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="flex items-center justify-center aspect-square">
              <div className="w-5 h-5 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="bg-brand-bg rounded-lg p-4">
          <div className="flex justify-between">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
          <div className="mt-3 h-1.5 bg-white rounded-full" />
        </div>
      </div>

      {/* Weekly */}
      <div className="h-5 w-16 bg-navy/10 rounded pt-2" />
      <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-border">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
        <div className="flex justify-between mb-4 px-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-6 h-3 bg-gray-100 rounded" />
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="bg-brand-bg rounded-lg p-4">
          <div className="flex justify-between">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
