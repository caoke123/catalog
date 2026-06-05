'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CatalogViewModel } from '@/adapters/catalogAdapter'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import { getDistribution } from '@/lib/distribution'
import { distributionPreview } from '@/mocks/distributionPreview'
import CatalogView from '@/components/catalog/CatalogView'

function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400">加载分销图册中...</p>
      </div>
    </div>
  )
}

function DistributionPreviewInner() {
  const searchParams = useSearchParams()
  const distId = searchParams.get('id')
  const [viewModel, setViewModel] = useState<CatalogViewModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (distId) {
        try {
          const data = await getDistribution(distId)
          if (data) {
            setViewModel(distributionToViewModel(data))
            setLoading(false)
            return
          }
        } catch { /* fall through to mock */ }
      }
      // Fallback: use mock data
      setViewModel(distributionPreview)
      setLoading(false)
    }
    load()
  }, [distId])

  if (loading) return <LoadingState />
  if (!viewModel) return <div className="p-8 text-center text-zinc-400">加载失败</div>

  return <CatalogView viewModel={viewModel} />
}

export default function DistributionPreviewPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DistributionPreviewInner />
    </Suspense>
  )
}
