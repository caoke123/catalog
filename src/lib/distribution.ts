import { CatalogData } from '@/types/catalog'

export async function getDistribution(id: string): Promise<CatalogData | null> {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/distributions/${id}.json`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
