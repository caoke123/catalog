'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, FilterX } from 'lucide-react'
import { ProductInfo, FeatureFlags } from '@/adapters/catalogAdapter'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: ProductInfo[]
  activeCategory: string
  onProductClick: (product: ProductInfo) => void
  features?: FeatureFlags
}

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
} as const

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 160, damping: 18 } }
} as const

export default function ProductGrid({ products, activeCategory, onProductClick, features }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(12)
  const loaderRef = useRef<HTMLDivElement>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === '全部' || p.category === activeCategory
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.spuCode.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [products, activeCategory, searchQuery])

  useEffect(() => { setDisplayCount(12) }, [activeCategory, searchQuery])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setDisplayCount(prev => Math.min(prev + 12, filteredProducts.length)) },
      { threshold: 0.1, rootMargin: '100px' }
    )
    const currentLoader = loaderRef.current
    if (currentLoader) observer.observe(currentLoader)
    return () => { if (currentLoader) observer.unobserve(currentLoader) }
  }, [filteredProducts.length])

  const paginatedProducts = useMemo(() => filteredProducts.slice(0, displayCount), [filteredProducts, displayCount])

  return (
    <div id="catalog-section" className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 scroll-mt-20">
      <div className="relative max-w-md mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-400" />
        </div>
        <input
          type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索产品名称或编码..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <motion.div variants={gridContainerVariants} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {paginatedProducts.map((p) => (
            <motion.div key={p.spuCode} variants={cardItemVariants}>
              <ProductCard product={p} onClick={onProductClick} features={features} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 rounded-3xl bg-zinc-50 border border-zinc-100/70">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <FilterX className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-700">没有找到匹配的饰品</h4>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">请尝试修改您的搜索词，或者切换到不同的产品分类</p>
          </div>
        </div>
      )}

      {filteredProducts.length > displayCount && (
        <div ref={loaderRef} className="w-full flex justify-center py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-50 border border-zinc-100/60 rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="aspect-square bg-zinc-200 rounded-xl w-full" />
                <div className="h-4 bg-zinc-200 rounded w-2/3" />
                <div className="h-3 bg-zinc-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length > 0 && filteredProducts.length <= displayCount && (
        <div className="text-center py-8 text-[11px] font-sans font-medium text-zinc-400 select-none flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>已经向您展示全部雨图精品配饰，感谢浏览</span>
        </div>
      )}
    </div>
  )
}
