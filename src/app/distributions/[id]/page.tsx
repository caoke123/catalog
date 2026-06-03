import { notFound } from 'next/navigation'
import { getDistribution } from '@/lib/distribution'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import CatalogView from '@/components/catalog/CatalogView'

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
