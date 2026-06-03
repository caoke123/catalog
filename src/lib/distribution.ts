import { CatalogData } from '@/types/catalog'

export async function getDistribution(id: string): Promise<CatalogData | null> {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/distributions/${id}.json`
  console.log('[distribution] fetching:', url)
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    })
    console.log('[distribution] response status:', res.status, 'ok:', res.ok)
    if (!res.ok) return null
    const data = await res.json()
    console.log('[distribution] products.length:', data?.products?.length ?? 0)
    return data
  } catch (e) {
    console.error('[distribution] error:', e)
    return null
  }
}
