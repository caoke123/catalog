import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { getPublishedCatalogIds } from '@/lib/manifest'
import { catalogToViewModel } from '@/adapters/catalogAdapter'
import CatalogView from '@/components/catalog/CatalogView'

// ════════════════════════════════════════════════════════════════════════
//  旧版: 从 R2 manifest JSON 获取 ID 列表 (已废弃，保留备查)
// ════════════════════════════════════════════════════════════════════════
// import type { CatalogManifest } from '@/types/manifest'
// const MANIFEST_URL = 'https://yutu.nv315.top/catalog-manifest.json'

export async function generateStaticParams() {
  const ids = await getPublishedCatalogIds()
  return ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '_placeholder' }]
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
