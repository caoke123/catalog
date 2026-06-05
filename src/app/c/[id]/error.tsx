'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <p className="text-6xl mb-6">⚠️</p>
      <p className="text-gray-500 mb-6">加载图册时出现问题</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-black text-white rounded-full text-sm"
      >
        重试
      </button>
    </div>
  )
}
