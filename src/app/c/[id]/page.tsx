import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { catalogToViewModel } from '@/adapters/catalogAdapter'
import CatalogView from '@/components/catalog/CatalogView'
import type { CatalogManifest } from '@/types/manifest'

const MANIFEST_URL = 'https://yutu.nv315.top/catalog-manifest.json'

export async function generateStaticParams() {
  try {
    const res = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return [{ id: '_placeholder' }]
    const manifest: CatalogManifest = await res.json()
    const ids = manifest.catalogs.map(c => ({ id: c.id }))
    return ids.length > 0 ? ids : [{ id: '_placeholder' }]
  } catch {
    return [{ id: '_placeholder' }]
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const catalog = await getCatalog(id)
  return {
    title: catalog?.name ?? '产品图册',
    description: `${catalog?.brand ?? '雨图饰品'} 产品图册`,
  }
}

export default async function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const catalog = await getCatalog(id)
  if (!catalog) notFound()

  const viewModel = catalogToViewModel(catalog)
  return <CatalogView viewModel={viewModel} />
}
