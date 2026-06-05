'use client'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { ProductInfo, FeatureFlags } from '@/adapters/catalogAdapter'

interface ProductCardProps {
  product: ProductInfo
  onClick: (product: ProductInfo) => void
  features?: FeatureFlags
}

export default function ProductCard({ product, onClick, features }: ProductCardProps) {
  const skuCount = product.skus?.length ?? 0
  const hasMultipleSkus = skuCount > 1
  const showPrice = features?.showPrice ?? false

  const supplyPrices = product.skus.map(s => s.pricing?.supplyPrice).filter((p): p is number => p != null)
  const suggestedPrices = product.skus.map(s => s.pricing?.suggestedPrice).filter((p): p is number => p != null)
  const minSupplyPrice = supplyPrices.length > 0 ? Math.min(...supplyPrices) : null
  const minRetailPrice = suggestedPrices.length > 0 ? Math.min(...suggestedPrices) : null

  return (
    <motion.div
      onClick={() => onClick(product)}
      id={`card-${product.spuCode}`}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.982 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="group bg-white rounded-2xl border border-zinc-100/60 overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.032)] hover:shadow-[0_20px_45px_rgb(0,0,0,0.08)] transition-all flex flex-col justify-between"
    >
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden shrink-0 select-none">
        <img src={product.mainImageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.8 rounded-md text-[9px] font-mono font-medium text-white tracking-widest leading-none">{product.spuCode}</div>
        {hasMultipleSkus && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide leading-none select-none shadow-sm bg-amber-500 text-zinc-950 animate-fade-in">
            <Layers className="w-3 h-3 stroke-[2.5]" /><span>{skuCount}sku</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between min-h-[6rem]">
        <div className="space-y-2">
          <h3 className="text-zinc-800 text-xs sm:text-sm font-semibold tracking-wide leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-zinc-950 transition-colors">{product.title}</h3>

          {showPrice && minSupplyPrice !== null && (
            <div className="py-1.5 px-2 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/15 rounded-xl flex items-center justify-between text-xs select-none">
              <span className="text-[8px] text-amber-800 font-bold uppercase leading-none tracking-widest shrink-0">代发批发价</span>
              <span className="text-amber-600 font-mono font-extrabold text-[13px] sm:text-sm leading-none">¥{minSupplyPrice.toFixed(2)}<span className="text-[9px] font-sans text-zinc-400 font-normal ml-0.5">起</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100/60 font-sans text-[10px] text-zinc-400">
          <span className="bg-zinc-50 border border-zinc-100 rounded px-1.5 py-0.5 tracking-wider uppercase font-medium">{product.category || '精品配饰'}</span>
        </div>
      </div>
    </motion.div>
  )
}
