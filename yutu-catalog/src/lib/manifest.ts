import { supabase } from './supabase'

/**
 * 从 Supabase 获取已发布图册 / 活跃分销的 ID 列表
 *
 * 用于 Next.js generateStaticParams 在构建时预生成静态页面。
 * Cloudflare Pages 构建环境需配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。
 * 查询失败时返回空数组，避免构建中断。
 */

/** 获取所有已发布图册的 ID 列表 */
export async function getPublishedCatalogIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select('id')
      .eq('status', 'published')

    if (error) {
      console.error('查询已发布图册失败:', error.message)
      return []
    }

    return (data ?? []).map(row => row.id)
  } catch (error) {
    console.error('查询已发布图册失败:', error instanceof Error ? error.message : String(error))
    return []
  }
}

/** 获取所有活跃分销记录的 ID 列表 */
export async function getPublishedDistributionIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('distributions')
      .select('id')
      .eq('status', 'active')

    if (error) {
      console.error('查询活跃分销失败:', error.message)
      return []
    }

    return (data ?? []).map(row => row.id)
  } catch (error) {
    console.error('查询活跃分销失败:', error instanceof Error ? error.message : String(error))
    return []
  }
}

// ════════════════════════════════════════════════════════════════════════
//  首页列表 — 获取已发布图册 / 分销记录完整信息
// ════════════════════════════════════════════════════════════════════════

export interface CatalogListItem {
  id: string
  name: string
  brand: string
  productCount: number
  coverImageUrl: string
  updatedAt: string
}

export interface DistributionListItem {
  id: string
  name: string
  brand: string
  productCount: number
  distributorName: string
  coverImageUrl: string
  updatedAt: string
}

/** 获取所有已发布图册的完整列表（首页展示用） */
export async function getPublishedCatalogs(): Promise<CatalogListItem[]> {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select('id, name, cover_image_url, product_ids, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('查询已发布图册列表失败:', error.message)
      return []
    }

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      brand: '雨图饰品',
      productCount: (row.product_ids ?? []).length,
      coverImageUrl: row.cover_image_url ?? '',
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error('查询已发布图册列表失败:', error instanceof Error ? error.message : String(error))
    return []
  }
}

/** 获取所有活跃分销记录的完整列表（首页展示用） */
export async function getPublishedDistributions(): Promise<DistributionListItem[]> {
  try {
    // 查分销记录 + 关联图册名称、封面、产品数
    const { data: dists, error: distError } = await supabase
      .from('distributions')
      .select('id, catalog_id, customer_id, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (distError || !dists || dists.length === 0) {
      return []
    }

    // 批量查关联图册
    const catalogIds = dists.map(d => d.catalog_id).filter(Boolean)
    const { data: catalogs } = await supabase
      .from('catalogs')
      .select('id, name, cover_image_url, product_ids')
      .in('id', catalogIds)

    const catalogMap = new Map((catalogs ?? []).map(c => [c.id, c]))

    // 批量查关联客户
    const customerIds = dists.map(d => d.customer_id).filter(Boolean)
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds)

    const customerMap = new Map((customers ?? []).map(c => [c.id, c]))

    return dists.map(d => {
      const cat = catalogMap.get(d.catalog_id)
      const cus = customerMap.get(d.customer_id)
      return {
        id: d.id,
        name: cat?.name ?? '',
        brand: '雨图饰品',
        productCount: (cat?.product_ids ?? []).length,
        distributorName: cus?.name ?? '',
        coverImageUrl: cat?.cover_image_url ?? '',
        updatedAt: d.updated_at,
      }
    })
  } catch (error) {
    console.error('查询活跃分销列表失败:', error instanceof Error ? error.message : String(error))
    return []
  }
}
