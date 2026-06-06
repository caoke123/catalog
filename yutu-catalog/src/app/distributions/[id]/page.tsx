import { getPublishedDistributionIds } from '@/lib/manifest'
import DistributionPageClient from '@/components/catalog/DistributionPageClient'

export async function generateStaticParams() {
  const ids = await getPublishedDistributionIds()
  return ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '_placeholder' }]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: '分销产品图册',
    description: '雨图饰品 分销产品图册',
  }
}

export default async function DistributionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DistributionPageClient id={id} />
}
