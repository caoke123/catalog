'use client'
import { useState, useEffect, useRef } from 'react'
import { CatalogProduct } from '@/types/catalog'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: CatalogProduct[]
  onProductClick: (product: CatalogProduct) => void
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  const [displayCount, setDisplayCount] = useState(12)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayCount(12)
  }, [products])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < products.length) {
        setLoading(true)
        setTimeout(() => {
          setDisplayCount(prev => Math.min(prev + 12, products.length))
          setLoading(false)
        }, 300)
      }
    }, { threshold: 0.1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [displayCount, products.length])

  const visible = products.slice(0, displayCount)

  return (
    <div className="px-2 pb-8">
      <div className="grid grid-cols-2 gap-2">
        {visible.map(product => (
          <ProductCard
            key={product.spuCode}
            product={product}
            onClick={onProductClick}
          />
        ))}
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
      {/* 无限滚动触发点 */}
      <div ref={loaderRef} className="h-4" />
      {/* 到底提示 */}
      {displayCount >= products.length && products.length > 0 && (
        <p className="text-center text-xs text-gray-300 mt-4">
          共 {products.length} 件产品
        </p>
      )}
    </div>
  )
}
