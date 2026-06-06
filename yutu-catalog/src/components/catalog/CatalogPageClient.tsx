'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { catalogToViewModel, CatalogViewModel } from '@/adapters/catalogAdapter'
import CatalogView from './CatalogView'
import type { CatalogData, CatalogProduct, CatalogSku, CatalogImage } from '@/types/catalog'

// ════════════════════════════════════════════════════════════════════════
//  PIM images_json 结构（与 src/lib/catalog.ts 保持一致）
// ════════════════════════════════════════════════════════════════════════
interface PimImageEntry {
  index?: number
  r2Url?: string
  fileName?: string
}

interface PimImagesJson {
  main?: PimImageEntry[]
}

interface Props {
  id: string
}

export default function CatalogPageClient({ id }: Props) {
  const [viewModel, setViewModel] = useState<CatalogViewModel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchCatalogData(id)
        if (cancelled) return

        if (!data) {
          setError('图册不存在或已下架')
          return
        }

        setViewModel(catalogToViewModel(data))
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败，请稍后重试')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // ── Loading 骨架屏 ──
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans">
        <div className="bg-zinc-950 py-16 px-4 animate-pulse">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <div className="h-8 w-48 bg-zinc-800 rounded mx-auto" />
            <div className="h-4 w-64 bg-zinc-800 rounded mx-auto" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-zinc-200 rounded-xl" />
                <div className="h-3 w-3/4 bg-zinc-200 rounded" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── 错误 / 图册不存在 ──
  if (error || !viewModel) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
        <header className="bg-zinc-950 text-white py-16 px-4 select-none flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">雨图饰品</h1>
            <p className="text-zinc-400 text-sm mt-3">产品图册</p>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">图册不可用</h2>
            <p className="text-sm text-zinc-500">
              {error || '该图册不存在或已下架，请联系我们获取最新链接。'}
            </p>
          </div>
        </main>
        <footer className="bg-zinc-950 text-zinc-600 border-t border-zinc-900 py-10 text-center space-y-2 flex-shrink-0">
          <p className="text-xs font-semibold text-zinc-500">雨图饰品 · PIM 一件代发图册系统</p>
        </footer>
      </div>
    )
  }

  // ── 正常渲染 ──
  return <CatalogView viewModel={viewModel} />
}

// ════════════════════════════════════════════════════════════════════════
//  客户端数据查询（复用 server lib 逻辑，但以 fetch 方式调用）
// ════════════════════════════════════════════════════════════════════════

async function fetchCatalogData(id: string): Promise<CatalogData | null> {
  // 1. 查询图册
  const { data: catalog, error: catalogError } = await supabase
    .from('catalogs')
    .select('id, name, cover_image_url, product_ids, created_at')
    .eq('id', id)
    .single()

  if (catalogError || !catalog) return null

  const productIds: string[] = (catalog.product_ids ?? []).filter(Boolean)
  if (productIds.length === 0) {
    return {
      id: catalog.id,
      name: catalog.name,
      brand: '雨图饰品',
      createdAt: catalog.created_at,
      coverImageUrl: catalog.cover_image_url ?? '',
      products: [],
    }
  }

  // 2. 查询产品
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, spu_code, title, category, main_image_url, images_json')
    .in('id', productIds)
    .neq('is_deleted', true)

  if (productsError || !products || products.length === 0) {
    return {
      id: catalog.id,
      name: catalog.name,
      brand: '雨图饰品',
      createdAt: catalog.created_at,
      coverImageUrl: catalog.cover_image_url ?? '',
      products: [],
    }
  }

  // 3. 查询 SKU
  const spuCodes = products.map(p => p.spu_code).filter(Boolean)
  const { data: skus, error: skusError } = await supabase
    .from('product_skus')
    .select('spu_code, sku_code, name_zh, name_en, name_zh_custom, name_en_custom, cost_price, selling_price, image_url')
    .in('spu_code', spuCodes)
    .order('sort_order', { ascending: true })

  if (skusError) {
    console.error('查询 SKU 失败:', skusError.message)
  }

  // 组装数据
  const skusBySpu = groupSkus(skus ?? [])
  const catalogProducts: CatalogProduct[] = products.map(p => {
    const imagesJson = p.images_json as PimImagesJson | null
    const mainImages = parseImages(imagesJson, p.main_image_url)
    return {
      spuCode: p.spu_code,
      title: p.title,
      category: p.category ?? '',
      mainImageUrl: mainImages[0]?.url ?? p.main_image_url ?? '',
      images: { main: mainImages },
      skus: skusBySpu[p.spu_code] ?? [],
    }
  })

  return {
    id: catalog.id,
    name: catalog.name,
    brand: '雨图饰品',
    createdAt: catalog.created_at,
    coverImageUrl: catalog.cover_image_url ?? '',
    products: catalogProducts,
  }
}

function groupSkus(skus: Record<string, unknown>[]): Record<string, CatalogSku[]> {
  const map: Record<string, CatalogSku[]> = {}
  for (const sku of skus) {
    const spu = String(sku.spu_code ?? '')
    if (!spu) continue
    if (!map[spu]) map[spu] = []
    map[spu].push({
      skuCode: String(sku.sku_code ?? ''),
      nameZh: String((sku as any).name_zh_custom || (sku as any).name_zh || ''),
      nameEn: String((sku as any).name_en_custom || (sku as any).name_en || ''),
      imageUrl: String((sku as any).image_url ?? ''),
      supplyPrice: (sku as any).cost_price != null ? Number((sku as any).cost_price) : undefined,
      suggestedPrice: (sku as any).selling_price != null ? Number((sku as any).selling_price) : undefined,
    })
  }
  return map
}

function parseImages(imagesJson: PimImagesJson | null, fallbackUrl: string | null): CatalogImage[] {
  return (imagesJson?.main ?? [])
    .filter(img => img.r2Url || img.fileName)
    .map((img, idx) => ({
      index: img.index ?? idx,
      url: img.r2Url ?? fallbackUrl ?? '',
      fileName: img.fileName ?? '',
    }))
}
