'use client'
import { useState } from 'react'
import { CatalogProduct } from '@/types/catalog'

interface CategoryTabsProps {
  products: CatalogProduct[]
  onCategoryChange: (category: string) => void
}

export default function CategoryTabs({ products, onCategoryChange }: CategoryTabsProps) {
  const [active, setActive] = useState('全部')
  const categories = ['全部', ...new Set(products.map(p => p.category).filter(Boolean))]

  function handleClick(cat: string) {
    setActive(cat)
    onCategoryChange(cat)
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === cat
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
