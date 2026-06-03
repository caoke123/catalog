import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import CatalogView from '@/components/catalog/CatalogView'

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
  return <CatalogView catalog={catalog} />
}
