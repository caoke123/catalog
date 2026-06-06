'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import type { CatalogViewModel } from '@/adapters/catalogAdapter'
import CatalogView from './CatalogView'
import type { CatalogData, CatalogProduct, CatalogSku, CatalogImage, DistributorInfo } from '@/types/catalog'

// ════════════════════════════════════════════════════════════════════════
//  PIM images_json 结构
// ════════════════════════════════════════════════════════════════════════
interface PimImageEntry {
  index?: number
  r2Url?: string
  fileName?: string
}

interface PimImagesJson {
  main?: PimImageEntry[]
}

// ════════════════════════════════════════════════════════════════════════
//  组件状态
// ════════════════════════════════════════════════════════════════════════

interface Props {
  id: string
}

type PageState =
  | { status: 'loading' }
  | { status: 'expired' }
  | { status: 'error'; message: string }
  | { status: 'ready'; viewModel: CatalogViewModel }

export default function DistributionPageClient({ id }: Props) {
  const [state, setState] = useState<PageState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setState({ status: 'loading' })

        // ── 1. 查询分销记录 status ──
        const { data: dist, error: distError } = await supabase
          .from('distributions')
          .select('id, status')
          .eq('id', id)
          .single()

        if (cancelled) return

        if (distError || !dist) {
          setState({ status: 'error', message: '分销记录不存在' })
          return
        }

        // ── 2. 访问控制：仅 active 状态可访问 ──
        if (dist.status !== 'active') {
          setState({ status: 'expired' })
          return
        }

        // ── 3. 获取完整数据 ──
        const data = await fetchDistributionData(id)
        if (cancelled) return

        if (!data) {
          setState({ status: 'error', message: '获取图册数据失败' })
          return
        }

        const viewModel = distributionToViewModel(data)
        if (!cancelled) setState({ status: 'ready', viewModel })
      } catch (e) {
        if (!cancelled) {
          setState({ status: 'error', message: e instanceof Error ? e.message : '加载失败，请稍后重试' })
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // ── Loading 骨架屏 ──
  if (state.status === 'loading') {
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

  // ── 链接已失效 ──
  if (state.status === 'expired') {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
        <header className="bg-zinc-950 text-white py-16 px-4 select-none flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">雨图饰品</h1>
            <p className="text-zinc-400 text-sm mt-3">分销产品图册</p>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">该链接已失效</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              您访问的分销图册链接已不再有效。
              <br />
              请联系我们获取新的专属图册链接。
            </p>
            <p className="text-xs text-zinc-400">雨图饰品 · PIM 一件代发图册系统</p>
          </div>
        </main>
        <footer className="bg-zinc-950 text-zinc-600 border-t border-zinc-900 py-10 text-center space-y-2 flex-shrink-0">
          <p className="text-xs font-semibold text-zinc-500">雨图饰品 · PIM 一件代发图册系统</p>
        </footer>
      </div>
    )
  }

  // ── 加载出错 ──
  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
        <header className="bg-zinc-950 text-white py-16 px-4 select-none flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">雨图饰品</h1>
            <p className="text-zinc-400 text-sm mt-3">分销产品图册</p>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">加载失败</h2>
            <p className="text-sm text-zinc-500">{state.message}</p>
          </div>
        </main>
        <footer className="bg-zinc-950 text-zinc-600 border-t border-zinc-900 py-10 text-center space-y-2 flex-shrink-0">
          <p className="text-xs font-semibold text-zinc-500">雨图饰品 · PIM 一件代发图册系统</p>
        </footer>
      </div>
    )
  }

  // ── 正常渲染 ──
  return <CatalogView viewModel={state.viewModel} />
}

// ════════════════════════════════════════════════════════════════════════
//  客户端数据查询（复用 server lib 逻辑）
// ════════════════════════════════════════════════════════════════════════

async function fetchDistributionData(id: string): Promise<CatalogData | null> {
  // 1. 查询分销记录
  const { data: dist, error: distError } = await supabase
    .from('distributions')
    .select('id, customer_id, catalog_id, agreement')
    .eq('id', id)
    .single()
  if (distError || !dist) return null

  // 2. 查询关联图册
  const { data: catalog, error: catalogError } = await supabase
    .from('catalogs')
    .select('id, name, cover_image_url, product_ids, created_at')
    .eq('id', dist.catalog_id)
    .single()
  if (catalogError || !catalog) return null

  // 3. 查询关联客户
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name, contact_person')
    .eq('id', dist.customer_id)
    .single()
  if (customerError && customerError.code !== 'PGRST116') {
    console.warn('查询关联客户失败:', customerError.message)
  }

  const productIds: string[] = (catalog.product_ids ?? []).filter(Boolean)
  if (productIds.length === 0) {
    return buildEmptyDistribution(
      catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at,
      dist.agreement, customer ?? null,
    )
  }

  // 4. 查询关联产品
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, spu_code, title, category, main_image_url, images_json')
    .in('id', productIds)
    .neq('is_deleted', true)
  if (productsError || !products || products.length === 0) {
    return buildEmptyDistribution(
      catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at,
      dist.agreement, customer ?? null,
    )
  }

  // 5. 查询 SKU
  const spuCodes = products.map(p => p.spu_code).filter(Boolean)
  const { data: skus, error: skusError } = await supabase
    .from('product_skus')
    .select('id, spu_code, sku_code, name_zh, name_en, name_zh_custom, name_en_custom, cost_price, selling_price, image_url')
    .in('spu_code', spuCodes)
    .order('sort_order', { ascending: true })
  if (skusError) {
    console.error('查询 SKU 失败:', skusError.message)
    return null
  }

  // 6. 查询分销专属定价
  const { data: prices, error: pricesError } = await supabase
    .from('distribution_sku_prices')
    .select('sku_id, customer_price')
    .eq('distribution_id', id)
  if (pricesError) {
    console.warn('查询分销定价失败:', pricesError.message)
  }

  const priceMap = new Map<string, number>()
  if (prices) {
    for (const p of prices) {
      if (p.customer_price != null) priceMap.set(p.sku_id, Number(p.customer_price))
    }
  }

  // 分组 SKU
  const skusBySpu = groupSkusBySpu(skus ?? [], priceMap)

  // 组装产品
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

  // 构建分销信息
  const distributorInfo: DistributorInfo = {
    distributorName: customer?.name ?? '',
    cooperationLevel: '标准合作',
    currency: '¥',
    validUntil: undefined,
    contactManager: customer?.contact_person ?? undefined,
    agreementText: dist.agreement ?? undefined,
  }

  return {
    id: catalog.id,
    name: catalog.name,
    brand: '雨图饰品',
    createdAt: catalog.created_at,
    coverImageUrl: catalog.cover_image_url ?? '',
    products: catalogProducts,
    distributorInfo,
  }
}

function buildEmptyDistribution(
  id: string, name: string, coverUrl: string | null, createdAt: string,
  agreement: string | null, customer: { name: string; contact_person: string | null } | null,
): CatalogData {
  return {
    id, name, brand: '雨图饰品', createdAt,
    coverImageUrl: coverUrl ?? '',
    products: [],
    distributorInfo: {
      distributorName: customer?.name ?? '',
      cooperationLevel: '标准合作',
      currency: '¥',
      validUntil: undefined,
      contactManager: customer?.contact_person ?? undefined,
      agreementText: agreement ?? undefined,
    },
  }
}

function groupSkusBySpu(skus: Record<string, unknown>[], priceMap: Map<string, number>): Record<string, CatalogSku[]> {
  const map: Record<string, CatalogSku[]> = {}
  for (const sku of skus) {
    const spu = String(sku.spu_code ?? '')
    if (!spu) continue
    if (!map[spu]) map[spu] = []

    const skuId = String(sku.id ?? '')
    const costPrice = (sku as any).cost_price != null ? Number((sku as any).cost_price) : undefined
    const sellingPrice = (sku as any).selling_price != null ? Number((sku as any).selling_price) : undefined
    const customerPrice = priceMap.get(skuId) ?? undefined

    map[spu].push({
      skuCode: String(sku.sku_code ?? ''),
      nameZh: String((sku as any).name_zh_custom || (sku as any).name_zh || ''),
      nameEn: String((sku as any).name_en_custom || (sku as any).name_en || ''),
      imageUrl: String((sku as any).image_url ?? ''),
      supplyPrice: customerPrice ?? costPrice,
      suggestedPrice: sellingPrice,
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
