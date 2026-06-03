'use client'
import { useState, useRef } from 'react'
import { CatalogViewModel, ProductInfo } from '@/adapters/catalogAdapter'
import HeroSection from './HeroSection'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'
import ProductSheet from './ProductSheet'
import DistributorBanner from './DistributorBanner'
import AgreementModal from './AgreementModal'

interface CatalogViewProps {
  viewModel: CatalogViewModel
}

export default function CatalogView({ viewModel }: CatalogViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [agreementOpen, setAgreementOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  function handleEnter() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <HeroSection
        hero={viewModel.hero}
        onEnter={handleEnter}
        showCustomerName={viewModel.features.showCustomerName}
      />

      {/* Distributor Banner */}
      {viewModel.features.showCustomerName && viewModel.distributor && (
        <DistributorBanner distributor={viewModel.distributor} />
      )}

      <div ref={gridRef} className="bg-zinc-50 min-h-screen">
        <CategoryTabs
          products={viewModel.products}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <ProductGrid
          products={viewModel.products}
          activeCategory={activeCategory}
          onProductClick={setSelectedProduct}
          features={viewModel.features}
        />
      </div>

      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        features={viewModel.features}
      />

      {/* Agreement FAB + Modal */}
      {viewModel.features.showAgreement && viewModel.agreement && (
        <>
          <button
            onClick={() => setAgreementOpen(true)}
            className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-medium shadow-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <span>合作协议</span>
          </button>
          <AgreementModal
            agreement={viewModel.agreement}
            isOpen={agreementOpen}
            onClose={() => setAgreementOpen(false)}
          />
        </>
      )}
    </>
  )
}
