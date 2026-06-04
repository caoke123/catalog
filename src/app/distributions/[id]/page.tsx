import { notFound } from 'next/navigation'
import { getDistribution } from '@/lib/distribution'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import CatalogView from '@/components/catalog/CatalogView'
import type { CatalogManifest } from '@/types/manifest'

const MANIFEST_URL = 'https://yutu.nv315.top/catalog-manifest.json'

export async function generateStaticParams() {
  try {
    const res = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return [{ id: '_placeholder' }]
    const manifest: CatalogManifest = await res.json()
    const ids = manifest.distributions.map(d => ({ id: d.id }))
    return ids.length > 0 ? ids : [{ id: '_placeholder' }]
  } catch {
    return [{ id: '_placeholder' }]
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getDistribution(id)
  return {
    title: data?.name ?? '分销产品图册',
    description: `${data?.brand ?? '雨图饰品'} 分销产品图册`,
  }
}

export default async function DistributionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getDistribution(id)
  if (!data) notFound()

  const viewModel = distributionToViewModel(data)
  return <CatalogView viewModel={viewModel} />
}
