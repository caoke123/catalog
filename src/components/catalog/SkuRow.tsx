'use client'
import { CatalogSku } from '@/types/catalog'

interface SkuRowProps {
  skus: CatalogSku[]
  onSkuClick: (skuIndex: number) => void
}

export default function SkuRow({ skus, onSkuClick }: SkuRowProps) {
  if (!skus || skus.length === 0) return null

  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-gray-400 mb-2">颜色 / 款式</p>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {skus.map((sku, index) => (
          <button
            key={sku.skuCode}
            onClick={() => onSkuClick(index)}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 active:border-black transition-colors">
              <img
                src={sku.imageUrl}
                alt={sku.nameZh}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-500 max-w-[3rem] truncate">{sku.nameZh}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
