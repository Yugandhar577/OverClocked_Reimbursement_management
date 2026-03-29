export function LoadingPanel() {
  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="shimmer h-6 w-48 rounded-full bg-brand-100/40" />
        <div className="mt-4 shimmer h-4 w-80 rounded-full bg-brand-100/30" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="surface-card p-6">
            <div className="shimmer h-4 w-24 rounded-full bg-brand-100/40" />
            <div className="mt-4 shimmer h-10 w-32 rounded-full bg-brand-100/30" />
            <div className="mt-5 shimmer h-3 w-40 rounded-full bg-brand-100/20" />
          </div>
        ))}
      </div>
      <div className="surface-card h-80" />
    </div>
  )
}
