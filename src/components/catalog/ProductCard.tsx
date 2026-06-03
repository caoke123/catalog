'use client'
import { CatalogProduct } from '@/types/catalog'

interface ProductCardProps {
  product: CatalogProduct
  onClick: (product: CatalogProduct) => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-square">
        <img
          src={product.mainImageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {product.skus && product.skus.length > 1 && (
          <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
            {product.skus.length} 款
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm leading-snug line-clamp-2 text-gray-800">{product.title}</p>
        <p className="text-xs text-gray-400 mt-1">{product.spuCode}</p>
      </div>
    </div>
  )
}
