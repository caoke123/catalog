'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CatalogViewModel, ProductInfo } from '@/adapters/catalogAdapter'
import { BookOpen, Home } from 'lucide-react'
import HeroSection from './HeroSection'
import ProductGrid from './ProductGrid'
import ProductSheet from './ProductSheet'
import DistributorBanner from './DistributorBanner'
import AgreementModal from './AgreementModal'

interface CatalogViewProps {
  viewModel: CatalogViewModel
}

export default function CatalogView({ viewModel }: CatalogViewProps) {
  const [viewMode, setViewMode] = useState<'cover' | 'list'>('cover')
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [agreementOpen, setAgreementOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const originalStyle = document.body.style.overflow
    if (viewMode === 'cover' || agreementOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [viewMode, agreementOpen])

  function handleEnter() {
    setViewMode('list')
  }

  return (
    <>
      <AnimatePresence mode="sync">
        {viewMode === 'cover' && (
          <motion.div
            key="showroom-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{}}
            className="fixed inset-0 z-40 w-full h-full overflow-hidden bg-black"
          >
            <HeroSection
              hero={viewModel.hero}
              onEnter={handleEnter}
              showCustomerName={viewModel.features.showCustomerName}
            />
          </motion.div>
        )}

        {viewMode === 'list' && (
          <motion.div
            key="showroom-catalog"
            ref={gridRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{}}
            className="relative w-full flex-grow flex flex-col"
          >
            {/* Distributor Banner */}
            {viewModel.features.showCustomerName && viewModel.distributor && (
              <DistributorBanner distributor={viewModel.distributor} />
            )}

            <div className="bg-zinc-50 min-h-screen">
              {/* Navigation Bar */}
              <div className="w-full bg-zinc-50 border-b border-zinc-200/40 py-3.5 select-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-800">
                    <BookOpen className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span className="font-extrabold text-zinc-900 text-sm tracking-tight">当前图册：{viewModel.meta.name}</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setViewMode('cover')}
                      className="p-2.5 sm:p-3 rounded-full bg-gradient-to-b from-white to-amber-50/10 border border-amber-500/20 hover:border-amber-500/55 text-amber-500 hover:text-amber-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none shadow-[0_3px_10px_rgba(245,158,11,0.06)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.18)] hover:-translate-y-0.5"
                      title="返回封面"
                    >
                      <Home className="w-4.5 h-4.5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
              <ProductGrid
                products={viewModel.products}
                activeCategory={activeCategory}
                onProductClick={setSelectedProduct}
                features={viewModel.features}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
