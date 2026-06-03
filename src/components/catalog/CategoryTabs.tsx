'use client'
import { useMemo } from 'react'
import { Sparkles, Grid } from 'lucide-react'
import { ProductInfo } from '@/adapters/catalogAdapter'

interface CategoryTabsProps {
  products: ProductInfo[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryTabs({ products, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const categories = useMemo(() => {
    const list = products.map((p) => p.category).filter(Boolean)
    return ['全部', ...Array.from(new Set(list))]
  }, [products])

  return (
    <div className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="hidden lg:flex items-center gap-2 text-zinc-500 font-sans text-xs shrink-0 py-1 font-medium bg-zinc-50 border border-zinc-100 px-3 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>雨图精选图册 · 品质保障</span>
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-2 py-1 select-none">
          {categories.map((category) => {
            const isSelected = activeCategory === category
            const count = category === '全部'
              ? products.length
              : products.filter(p => p.category === category).length

            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/15 font-bold scale-[1.03]'
                    : 'bg-zinc-100/70 hover:bg-zinc-200/50 text-zinc-600 border border-transparent'
                }`}
              >
                {category === '全部' && <Grid className="w-3.5 h-3.5" />}
                <span>{category}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200/60 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
