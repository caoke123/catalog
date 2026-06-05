import { supabase } from './supabase'
import type { CatalogData, CatalogProduct, CatalogSku, CatalogImage, DistributorInfo } from '@/types/catalog'

// ════════════════════════════════════════════════════════════════════════
//  旧版: 从 Cloudflare R2 JSON 文件获取 (已废弃，保留备查)
// ════════════════════════════════════════════════════════════════════════
// export async function getDistribution(id: string): Promise<CatalogData | null> {
//   const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
//   const url = `${r2BaseUrl}/distributions/${id}.json`
//   try {
//     const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
//     if (!res.ok) return null
//     return res.json()
//   } catch {
//     return null
//   }
// }

// ════════════════════════════════════════════════════════════════════════
//  新版: 从 Supabase 数据库读取分销图册数据
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
 * 根据分销记录 ID 从 Supabase 获取分销图册完整数据
 *
 * 查询链路:
 *   distributions → catalogs + customers → products (via product_ids) → product_skus (via spu_code) → distribution_sku_prices
 * SKU 定价优先使用 distribution_sku_prices.customer_price（分销专属价），
 * 回退到 product_skus.cost_price（基础成本价）。
 *
 * 返回类型保持 CatalogData 不变，确保页面层和 Adapter 层零改动。
 */
export async function getDistribution(id: string): Promise<CatalogData | null> {
  try {
    // ── 1. 查询分销记录 ──
    const { data: dist, error: distError } = await supabase
      .from('distributions')
      .select('id, customer_id, catalog_id, agreement')
      .eq('id', id)
      .single()

    if (distError || !dist) {
      console.error('查询分销记录失败:', distError?.message ?? '分销记录不存在')
      return null
    }

    // ── 2. 查询关联图册 ──
    const { data: catalog, error: catalogError } = await supabase
      .from('catalogs')
      .select('id, name, cover_image_url, product_ids, created_at')
      .eq('id', dist.catalog_id)
      .single()

    if (catalogError || !catalog) {
      console.error('查询关联图册失败:', catalogError?.message ?? '图册不存在')
      return null
    }

    // ── 3. 查询关联客户（外键可能已被删除，不影响主流程） ──
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, contact_person')
      .eq('id', dist.customer_id)
      .single()

    if (customerError) {
      console.warn('查询关联客户失败:', customerError.message)
    }

    const productIds: string[] = (catalog.product_ids ?? []).filter(Boolean)
    if (productIds.length === 0) {
      return buildEmptyDistribution(
        catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at,
        dist.agreement, customer ?? null,
      )
    }

    // ── 4. 查询关联产品 ──
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
      return buildEmptyDistribution(
        catalog.id, catalog.name, catalog.cover_image_url, catalog.created_at,
        dist.agreement, customer ?? null,
      )
    }

    // ── 5. 查询所有关联 SKU ──
    const spuCodes = products.map(p => p.spu_code).filter((c): c is string => Boolean(c))
    const { data: skus, error: skusError } = await supabase
      .from('product_skus')
      .select('id, spu_code, sku_code, name_zh, name_en, name_zh_custom, name_en_custom, cost_price, selling_price, image_url')
      .in('spu_code', spuCodes)
      .order('sort_order', { ascending: true })

    if (skusError) {
      console.error('查询 SKU 失败:', skusError.message)
      return null
    }

    // ── 6. 查询分销专属定价 ──
    const { data: prices, error: pricesError } = await supabase
      .from('distribution_sku_prices')
      .select('sku_id, customer_price')
      .eq('distribution_id', id)

    if (pricesError) {
      console.warn('查询分销定价失败:', pricesError.message)
    }

    // 构建 sku_id → customer_price 映射
    const priceMap = new Map<string, number>()
    if (prices) {
      for (const p of prices) {
        if (p.customer_price != null) {
          priceMap.set(p.sku_id, Number(p.customer_price))
        }
      }
    }

    // 按 spu_code 分组 SKU，应用定价优先级
    const skusBySpuCode = groupSkusBySpuCode(skus ?? [], priceMap)

    // ── 7. 组装 CatalogProduct 列表 ──
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

    // ── 8. 构建分销信息 ──
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
  } catch (error) {
    console.error('获取分销图册数据失败:', error instanceof Error ? error.message : String(error))
    return null
  }
}

// ════════════════════════════════════════════════════════════════════════
//  内部工具函数
// ════════════════════════════════════════════════════════════════════════

/** 返回空产品的分销图册结构 */
function buildEmptyDistribution(
  id: string,
  name: string,
  coverUrl: string | null,
  createdAt: string,
  agreement: string | null,
  customer: { name: string; contact_person: string | null } | null,
): CatalogData {
  return {
    id,
    name,
    brand: '雨图饰品',
    createdAt,
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

/**
 * 按 spu_code 分组 SKU 数据
 *
 * 定价优先级:
 *   1. distribution_sku_prices.customer_price (分销专属定价)
 *   2. product_skus.cost_price (基础成本价)
 * suggestedPrice 始终取 product_skus.selling_price
 */
function groupSkusBySpuCode(
  skus: Record<string, unknown>[],
  priceMap: Map<string, number>,
): Record<string, CatalogSku[]> {
  const map: Record<string, CatalogSku[]> = {}
  for (const sku of skus) {
    const spuCode = String(sku.spu_code ?? '')
    if (!spuCode) continue
    if (!map[spuCode]) {
      map[spuCode] = []
    }

    const skuId = String(sku.id ?? '')
    const costPrice = sku.cost_price != null ? Number(sku.cost_price) : undefined
    const sellingPrice = sku.selling_price != null ? Number(sku.selling_price) : undefined
    const customerPrice = priceMap.get(skuId) ?? undefined

    // 定价优先级: customer_price > cost_price
    const supplyPrice = customerPrice ?? costPrice

    map[spuCode].push({
      skuCode: String(sku.sku_code ?? ''),
      // 优先使用自定义名称，为空则回退到原始名称
      nameZh: String(sku.name_zh_custom || sku.name_zh || ''),
      nameEn: String(sku.name_en_custom || sku.name_en || ''),
      imageUrl: String(sku.image_url ?? ''),
      supplyPrice,
      suggestedPrice: sellingPrice,
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
