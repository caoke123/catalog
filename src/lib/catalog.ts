import { CatalogData } from '@/types/catalog'

export async function getCatalog(id: string): Promise<CatalogData | null> {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/catalogs/${id}.json`
  console.log('[getCatalog] fetching:', url)
  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    console.log('[getCatalog] status:', res.status, res.ok)
    if (!res.ok) return null
    const data = await res.json()
    console.log('[getCatalog] success, products:', data.products?.length)
    return data
  } catch (e) {
    console.error('[getCatalog] error:', e)
    return null
  }
}
