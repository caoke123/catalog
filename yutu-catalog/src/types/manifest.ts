export interface CatalogManifestItem {
  id: string
  type: 'catalog'
  name: string
  brand: string
  productCount: number
  coverImageUrl: string
  updatedAt: string
}

export interface DistributionManifestItem {
  id: string
  type: 'distribution'
  name: string
  brand: string
  productCount: number
  distributorName: string
  coverImageUrl: string
  updatedAt: string
}

export interface CatalogManifest {
  version: string
  generatedAt: string
  catalogs: CatalogManifestItem[]
  distributions: DistributionManifestItem[]
}
