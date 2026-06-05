import { notFound } from 'next/navigation'
import { getDistribution } from '@/lib/distribution'
import { getPublishedDistributionIds } from '@/lib/manifest'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import CatalogView from '@/components/catalog/CatalogView'

// ════════════════════════════════════════════════════════════════════════
//  旧版: 从 R2 manifest JSON 获取 ID 列表 (已废弃，保留备查)
// ════════════════════════════════════════════════════════════════════════
// import type { CatalogManifest } from '@/types/manifest'
// const MANIFEST_URL = 'https://yutu.nv315.top/catalog-manifest.json'

export async function generateStaticParams() {
  const ids = await getPublishedDistributionIds()
  return ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '_placeholder' }]
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
