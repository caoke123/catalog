import Link from 'next/link'
import { getPublishedCatalogs, getPublishedDistributions } from '@/lib/manifest'
import type { CatalogListItem, DistributionListItem } from '@/lib/manifest'

// ════════════════════════════════════════════════════════════════════════
//  旧版: 从 R2 catalog-manifest.json 获取列表 (已废弃，保留备查)
// ════════════════════════════════════════════════════════════════════════
// import type { CatalogManifest, CatalogManifestItem, DistributionManifestItem } from '@/types/manifest'
// const MANIFEST_URL = 'https://yutu.nv315.top/catalog-manifest.json'

export default async function HomePage() {
  const [catalogs, distributions] = await Promise.all([
    getPublishedCatalogs(),
    getPublishedDistributions(),
  ])

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-zinc-950 text-white py-10 px-4 select-none">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">雨图饰品 E-Catalog</h1>
          <p className="text-zinc-400 text-sm mt-3">数字化产品图册 — 一件代发 PIM 系统</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {catalogs.length > 0 && (
          <CatalogSection title="产品图册" items={catalogs} hrefPrefix="/c" />
        )}
        {distributions.length > 0 && (
          <DistributionSection title="分销专供图册" items={distributions} hrefPrefix="/distributions" />
        )}
        {catalogs.length === 0 && distributions.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-lg font-semibold">暂无可用的图册</p>
            <p className="text-sm mt-2">请在 PIM 中台创建图册并发布</p>
          </div>
        )}
      </main>

      <footer className="bg-zinc-950 text-zinc-600 border-t border-zinc-900 py-10 text-center space-y-2">
        <p className="text-xs font-semibold text-zinc-500">雨图饰品 · PIM 一件代发图册系统</p>
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} YUTU ACCESSORIES &bull; CLOUDFLARE PAGES
        </p>
      </footer>
    </div>
  )
}

function CatalogSection({ title, items, hrefPrefix }: {
  title: string
  items: CatalogListItem[]
  hrefPrefix: string
}) {
  return (
    <section>
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Link
            key={item.id}
            href={`${hrefPrefix}/${item.id}`}
            className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
              {item.coverImageUrl && (
                <img
                  src={item.coverImageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h3>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                {item.brand} &middot; {item.productCount} 款
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function DistributionSection({ title, items, hrefPrefix }: {
  title: string
  items: DistributionListItem[]
  hrefPrefix: string
}) {
  return (
    <section>
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Link
            key={item.id}
            href={`${hrefPrefix}/${item.id}`}
            className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
              {item.coverImageUrl && (
                <img
                  src={item.coverImageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h3>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                {item.brand} &middot; {item.productCount} 款
                <span className="text-amber-600 ml-2">专属: {item.distributorName}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
