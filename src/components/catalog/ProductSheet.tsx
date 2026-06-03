'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Swiper as SwiperType } from 'swiper'
import { CatalogProduct } from '@/types/catalog'
import ProductSwiper from './ProductSwiper'
import SkuRow from './SkuRow'

interface ProductSheetProps {
  product: CatalogProduct | null
  onClose: () => void
}

export default function ProductSheet({ product, onClose }: ProductSheetProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)

  const isOpen = !!product

  const allImages = product ? [
    ...product.images.main.map(img => ({ url: img.url, alt: product.title })),
    ...product.skus.map(sku => ({ url: sku.imageUrl, alt: sku.nameZh }))
  ] : []

  const mainImageCount = product?.images.main.length ?? 0

  function handleSkuClick(skuIndex: number) {
    swiperInstance?.slideTo(mainImageCount + skuIndex)
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[90vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100) onClose()
            }}
          >
            {/* 拖拽条 */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 图片轮播（固定不滚动） */}
            <div className="flex-shrink-0">
              <ProductSwiper images={allImages} onSwiper={setSwiperInstance} />
            </div>

            {/* 可滚动内容区 */}
            <div className="overflow-y-auto flex-1">
              {/* 产品信息 */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs text-gray-400 mb-1">{product.spuCode}</p>
                <h2 className="text-lg font-semibold text-gray-900 leading-snug">{product.title}</h2>
                {product.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {product.category}
                  </span>
                )}
              </div>

              {/* SKU 列表 */}
              <div className="mt-2">
                <SkuRow skus={product.skus} onSkuClick={handleSkuClick} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
