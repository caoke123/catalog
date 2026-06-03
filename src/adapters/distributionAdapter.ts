import { CatalogData, CatalogProduct, CatalogSku } from '@/types/catalog'
import {
  CatalogViewModel,
  CatalogMeta,
  HeroInfo,
  CategoryInfo,
  ProductInfo,
  ImageInfo,
  SkuInfo,
  PricingInfo,
  DistributorInfo,
  AgreementInfo,
  FeatureFlags,
} from '@/adapters/catalogAdapter'

/**
 * Distribution Adapter: CatalogData (含定价+分销字段) → CatalogViewModel
 * 用于将 R2 上的分销图册 JSON 转换为统一 ViewModel
 */
export function distributionToViewModel(data: CatalogData): CatalogViewModel {
  const dist = data.distributorInfo
  const hasPricing = data.products.some(p =>
    p.skus.some(s => s.supplyPrice != null && s.suggestedPrice != null)
  )

  return {
    meta: toMeta(data),
    hero: toHero(data, dist),
    categories: buildCategories(data.products),
    products: data.products.map(p => toProductInfo(p, dist?.currency ?? '¥')),
    features: toFeatures(dist, hasPricing),
    distributor: dist ? toDistributorInfo(dist) : null,
    agreement: dist?.agreementText ? { text: dist.agreementText } : null,
  }
}

// ============================================================
//  Mappers
// ============================================================

function toMeta(d: CatalogData): CatalogMeta {
  return { id: d.id, name: d.name, brand: d.brand, createdAt: d.createdAt }
}

function toHero(d: CatalogData, dist: CatalogData['distributorInfo'] | undefined): HeroInfo {
  return {
    coverImageUrl: d.coverImageUrl || null,
    brand: d.brand,
    name: d.name,
    createdAt: d.createdAt,
    productCount: d.products.length,
    customerName: dist?.distributorName ?? null,
  }
}

function toFeatures(dist: CatalogData['distributorInfo'] | undefined, hasPricing: boolean): FeatureFlags {
  return {
    showPrice: hasPricing && !!dist,
    showCustomerName: !!dist,
    showAgreement: !!(dist?.agreementText),
    showQualityAssurance: true,
  }
}

function toDistributorInfo(dist: NonNullable<CatalogData['distributorInfo']>): DistributorInfo {
  return {
    distributorName: dist.distributorName,
    cooperationLevel: dist.cooperationLevel,
    currency: dist.currency,
    validUntil: dist.validUntil ?? null,
    contactManager: dist.contactManager ?? null,
  }
}

function toProductInfo(p: CatalogProduct, currency: string): ProductInfo {
  return {
    spuCode: p.spuCode,
    title: p.title,
    category: p.category,
    mainImageUrl: p.mainImageUrl,
    images: p.images.main.map(img => toImageInfo(img, p.title)),
    skus: p.skus.map(s => toSkuInfo(s, currency)),
  }
}

function toImageInfo(img: { url: string; index: number; fileName: string }, alt: string): ImageInfo {
  return { url: img.url, alt }
}

function toSkuInfo(s: CatalogSku, currency: string): SkuInfo {
  const hasPricing = s.supplyPrice != null && s.suggestedPrice != null
  return {
    skuCode: s.skuCode,
    nameZh: s.nameZh,
    nameEn: s.nameEn,
    imageUrl: s.imageUrl,
    pricing: hasPricing ? toPricingInfo(s.supplyPrice!, s.suggestedPrice!, currency) : null,
  }
}

function toPricingInfo(supply: number, suggested: number, currency: string): PricingInfo {
  return {
    supplyPrice: supply,
    suggestedPrice: suggested,
    profitMargin: ((suggested - supply) / supply) * 100,
    profitAmount: suggested - supply,
    currency,
  }
}

// ============================================================
//  Utilities (shared with catalogAdapter)
// ============================================================

function buildCategories(products: { category: string }[]): CategoryInfo[] {
  const map = new Map<string, number>()
  const order: string[] = []

  for (const p of products) {
    if (!p.category) continue
    if (!map.has(p.category)) { map.set(p.category, 0); order.push(p.category) }
    map.set(p.category, map.get(p.category)! + 1)
  }

  return [
    { name: '全部', productCount: products.length },
    ...order.map(name => ({ name, productCount: map.get(name)! })),
  ]
}
