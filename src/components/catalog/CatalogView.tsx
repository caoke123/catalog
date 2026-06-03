'use client'
import { useState, useRef } from 'react'
import { CatalogData, CatalogProduct } from '@/types/catalog'
import HeroSection from './HeroSection'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'
import ProductSheet from './ProductSheet'

interface CatalogViewProps {
  catalog: CatalogData
}

export default function CatalogView({ catalog }: CatalogViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredProducts = activeCategory === '全部'
    ? catalog.products
    : catalog.products.filter(p => p.category === activeCategory)

  function handleEnter() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* 封面区 */}
      <HeroSection catalog={catalog} onEnter={handleEnter} />

      {/* 分类 Tab + 产品网格 */}
      <div ref={gridRef} className="bg-gray-50 min-h-screen">
        <CategoryTabs
          products={catalog.products}
          onCategoryChange={setActiveCategory}
        />
        <div className="pt-2">
          <ProductGrid
            products={filteredProducts}
            onProductClick={setSelectedProduct}
          />
        </div>
      </div>

      {/* Bottom Sheet */}
      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
