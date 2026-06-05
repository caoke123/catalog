import { supabase } from './supabase'
import type { CatalogData, CatalogProduct, CatalogSku, CatalogImage } from '@/types/catalog'

// ════════════════════════════════════════════════════════════════════════
//  旧版: 从 Cloudflare R2 JSON 文件获取 (已废弃，保留备查)
// ════════════════════════════════════════════════════════════════════════
// export async function getCatalog(id: string): Promise<CatalogData | null> {
//   const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
//   const url = `${r2BaseUrl}/catalogs/${id}.json`
//   try {
//     const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
//     if (!res.ok) return null
//     return res.json()
//   } catch {
//     return null
//   }
// }

// ════════════════════════════════════════════════════════════════════════
//  新版: 从 Supabase 数据库读取图册数据
// ════════════════════════════════════════════════════════════════════════

/** PIM 系统中 products.images_json 的 JSONB 结构 */
interface PimImageEntry {
  index?: number
  r2Url?: string
  fileName?: string
  localPath?: string
}

interface PimImagesJson {
  main?: PimImageEntry[]
  detail?: PimImageEntry[]
  sku?: PimImageEntry[]
}

/**
 * 根据图册 ID 从 Supabase 获取图册完整数据
 *
 * 查询链路: catalogs → products (通过 product_ids JOIN) → product_skus (通过 spu_code JOIN)
 * 返回类型保持 CatalogData 不变, 确保页面层和 Adapter 层零改动
 */
export async function getCatalog(id: string): Promise<CatalogData | null> {
  try {
    // ── 1. 查询图册基本信息 ──
    const { data: catalog, error: catalogError } = await supabase
      .from('catalogs')
      .select('id, name, cover_image_url, product_ids, created_at')
      .eq('id', id)
      .single()

    if (catalogError || !catalog) {
      console.error('查询图册失败:', catalogError?.message ?? '图册不存在')
      return null
    }

    const productIds: string[] = (catalog.product_ids ?? []).filter(Boolean)
    if (productIds.length === 0) {
      return buildEmptyCatalog(catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at)
    }

    // ── 2. 查询关联产品 ──
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, spu_code, title, category, main_image_url, images_json')
      .in('id', productIds)
      .neq('is_deleted', true)

    if (productsError) {
      console.error('查询产品失败:', productsError.message)
      return null
    }

    if (!products || products.length === 0) {
      return buildEmptyCatalog(catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at)
    }

    // ── 3. 查询所有关联 SKU ──
    const spuCodes = products.map(p => p.spu_code).filter((c): c is string => Boolean(c))
    const { data: skus, error: skusError } = await supabase
      .from('product_skus')
      .select('spu_code, sku_code, name_zh, name_en, name_zh_custom, name_en_custom, cost_price, selling_price, image_url')
      .in('spu_code', spuCodes)
      .order('sort_order', { ascending: true })

    if (skusError) {
      console.error('查询 SKU 失败:', skusError.message)
      return null
    }

    // 按 spu_code 分组 SKU
    const skusBySpuCode = groupSkusBySpuCode(skus ?? [])

    // ── 4. 组装 CatalogData 返回 ──
    const catalogProducts: CatalogProduct[] = products.map(product => {
      const imagesJson = product.images_json as PimImagesJson | null
      const mainImages = parseMainImages(imagesJson, product.main_image_url)

      return {
        spuCode: product.spu_code,
        title: product.title,
        category: product.category ?? '',
        mainImageUrl: mainImages[0]?.url ?? product.main_image_url ?? '',
        images: { main: mainImages },
        skus: skusBySpuCode[product.spu_code] ?? [],
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
  } catch (error) {
    console.error('获取图册数据失败:', error instanceof Error ? error.message : String(error))
    return null
  }
}

// ════════════════════════════════════════════════════════════════════════
//  内部工具函数
// ════════════════════════════════════════════════════════════════════════

/** 返回空产品的图册结构 */
function buildEmptyCatalog(id: string, name: string, coverUrl: string | null, createdAt: string): CatalogData {
  return {
    id,
    name,
    brand: '雨图饰品',
    createdAt,
    coverImageUrl: coverUrl ?? '',
    products: [],
  }
}

/** 按 spu_code 分组 SKU 数据 */
function groupSkusBySpuCode(skus: Record<string, unknown>[]): Record<string, CatalogSku[]> {
  const map: Record<string, CatalogSku[]> = {}
  for (const sku of skus) {
    const spuCode = String(sku.spu_code ?? '')
    if (!spuCode) continue
    if (!map[spuCode]) {
      map[spuCode] = []
    }
    map[spuCode].push({
      skuCode: String(sku.sku_code ?? ''),
      // 优先使用自定义名称, 为空则回退到原始名称
      nameZh: String(sku.name_zh_custom || sku.name_zh || ''),
      nameEn: String(sku.name_en_custom || sku.name_en || ''),
      imageUrl: String(sku.image_url ?? ''),
      supplyPrice: sku.cost_price != null ? Number(sku.cost_price) : undefined,
      suggestedPrice: sku.selling_price != null ? Number(sku.selling_price) : undefined,
    })
  }
  return map
}

/** 从 images_json 解出主图列表 */
function parseMainImages(imagesJson: PimImagesJson | null, fallbackUrl: string | null): CatalogImage[] {
  const entries = imagesJson?.main ?? []
  return entries
    .filter(img => img.r2Url || img.fileName)
    .map((img, idx) => ({
      index: img.index ?? idx,
      url: img.r2Url ?? fallbackUrl ?? '',
      fileName: img.fileName ?? '',
    }))
}
