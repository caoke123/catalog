export interface CatalogImage {
  index: number
  url: string
  fileName: string
}

export interface CatalogSku {
  skuCode: string
  nameZh: string
  nameEn: string
  imageUrl: string
  supplyPrice?: number
  suggestedPrice?: number
}

export interface CatalogProduct {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: { main: CatalogImage[] }
  skus: CatalogSku[]
}

export interface DistributorInfo {
  distributorName: string
  cooperationLevel: string
  currency: string
  agreementText?: string
  validUntil?: string
  contactManager?: string
}

export interface CatalogData {
  id: string
  name: string
  brand: string
  createdAt: string
  coverImageUrl: string
  products: CatalogProduct[]
  distributorInfo?: DistributorInfo
}
