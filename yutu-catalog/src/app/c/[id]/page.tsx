import { getPublishedCatalogIds } from '@/lib/manifest'
import CatalogPageClient from '@/components/catalog/CatalogPageClient'

export async function generateStaticParams() {
  const ids = await getPublishedCatalogIds()
  return ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '_placeholder' }]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: '产品图册',
    description: '雨图饰品 产品图册',
  }
}

export default async function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CatalogPageClient id={id} />
}
