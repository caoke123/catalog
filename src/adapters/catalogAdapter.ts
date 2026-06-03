import { CatalogData, CatalogProduct, CatalogSku, CatalogImage } from '@/types/catalog'

// ============================================================
//  CatalogViewModel — 统一视图模型 (仅 Catalog 模式)
//  Distribution 模式由 distributionAdapter 提供 (未来)
// ============================================================

export interface CatalogViewModel {
  meta: CatalogMeta
  hero: HeroInfo
  categories: CategoryInfo[]
  products: ProductInfo[]
  features: FeatureFlags
  distributor: DistributorInfo | null
  agreement: AgreementInfo | null
}

export interface CatalogMeta {
  id: string
  name: string
  brand: string
  createdAt: string
}

export interface HeroInfo {
  coverImageUrl: string | null
  brand: string
  name: string
  createdAt: string
  productCount: number
  customerName: string | null
}

export interface CategoryInfo {
  name: string
  productCount: number
}

export interface ProductInfo {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: ImageInfo[]
  skus: SkuInfo[]
}

export interface ImageInfo {
  url: string
  alt: string
}

export interface SkuInfo {
  skuCode: string
  nameZh: string
  nameEn: string
  imageUrl: string
  pricing: PricingInfo | null
}

export interface PricingInfo {
  supplyPrice: number
  suggestedPrice: number
  profitMargin: number
  profitAmount: number
  currency: string
}

export interface FeatureFlags {
  showPrice: boolean
  showCustomerName: boolean
  showAgreement: boolean
  showQualityAssurance: boolean
}

export interface DistributorInfo {
  distributorName: string
  cooperationLevel: string
  currency: string
  validUntil: string | null
  contactManager: string | null
}

export interface AgreementInfo {
  text: string
}

// ============================================================
//  Adapter: CatalogData → CatalogViewModel
// ============================================================

export function catalogToViewModel(data: CatalogData): CatalogViewModel {
  return {
    meta: {
      id: data.id,
      name: data.name,
      brand: data.brand,
      createdAt: data.createdAt,
    },
    hero: {
      coverImageUrl: data.coverImageUrl || null,
      brand: data.brand,
      name: data.name,
      createdAt: data.createdAt,
      productCount: data.products.length,
      customerName: null,
    },
    categories: buildCategories(data.products),
    products: data.products.map(toProductInfo),
    features: {
      showPrice: false,
      showCustomerName: false,
      showAgreement: false,
      showQualityAssurance: true,
    },
    distributor: null,
    agreement: null,
  }
}

// ============================================================
//  工具函数
// ============================================================

function buildCategories(products: CatalogProduct[]): CategoryInfo[] {
  const map = new Map<string, number>()
  const order: string[] = []

  for (const p of products) {
    if (!p.category) continue
    if (!map.has(p.category)) {
      map.set(p.category, 0)
      order.push(p.category)
    }
    map.set(p.category, map.get(p.category)! + 1)
  }

  return [
    { name: '全部', productCount: products.length },
    ...order.map(name => ({ name, productCount: map.get(name)! })),
  ]
}

function toProductInfo(p: CatalogProduct): ProductInfo {
  return {
    spuCode: p.spuCode,
    title: p.title,
    category: p.category,
    mainImageUrl: p.mainImageUrl,
    images: p.images.main.map(img => ({
      url: img.url,
      alt: p.title,
    })),
    skus: p.skus.map(sku => ({
      skuCode: sku.skuCode,
      nameZh: sku.nameZh,
      nameEn: sku.nameEn,
      imageUrl: sku.imageUrl,
      pricing: null,
    })),
  }
}
