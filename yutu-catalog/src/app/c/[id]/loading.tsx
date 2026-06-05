export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 封面骨架 */}
      <div className="w-full h-screen bg-gray-200 animate-pulse" />
      {/* Tab 骨架 */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      {/* 产品网格骨架 */}
      <div className="grid grid-cols-2 gap-2 p-2">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-2 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
