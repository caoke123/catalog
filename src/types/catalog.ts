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
}

export interface CatalogProduct {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: { main: CatalogImage[] }
  skus: CatalogSku[]
}

export interface CatalogData {
  id: string
  name: string
  brand: string
  createdAt: string
  coverImageUrl: string
  products: CatalogProduct[]
}
