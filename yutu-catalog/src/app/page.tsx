export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
      <header className="bg-zinc-950 text-white py-16 px-4 select-none flex-shrink-0">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">雨图饰品</h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 leading-relaxed">
            如需查看产品图册，请使用您收到的专属链接
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
            专属图册 · 一件代发 PIM 系统
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-800">没有可查看的图册</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            本页面不公开展示产品图册列表。
            <br />
            请使用您的分销商专属链接查看为您定制的产品图册。
          </p>
          <p className="text-xs text-zinc-400">
            如果您是合作分销商，请联系我们获取您的专属图册链接。
          </p>
        </div>
      </main>

      <footer className="bg-zinc-950 text-zinc-600 border-t border-zinc-900 py-10 text-center space-y-2 flex-shrink-0">
        <p className="text-xs font-semibold text-zinc-500">雨图饰品 · PIM 一件代发图册系统</p>
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} YUTU ACCESSORIES &bull; CLOUDFLARE PAGES
        </p>
      </footer>
    </div>
  )
}
