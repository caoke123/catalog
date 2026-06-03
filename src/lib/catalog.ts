import { CatalogData } from '@/types/catalog'

export async function getCatalog(id: string): Promise<CatalogData | null> {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/catalogs/${id}.json`
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
