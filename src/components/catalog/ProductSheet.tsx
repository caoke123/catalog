'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ShieldCheck, Sliders } from 'lucide-react'
import { ProductInfo, SkuInfo, FeatureFlags } from '@/adapters/catalogAdapter'
import ProductSwiper from './ProductSwiper'
import SkuRow from './SkuRow'

interface ProductSheetProps {
  product: ProductInfo | null
  onClose: () => void
  features?: FeatureFlags
}

export default function ProductSheet({ product, onClose, features }: ProductSheetProps) {
  const [selectedSku, setSelectedSku] = useState<SkuInfo | null>(null)
  const [swiperIndex, setSwiperIndex] = useState(0)
  const showPrice = features?.showPrice ?? false

  useEffect(() => { if (product) { setSelectedSku(null); setSwiperIndex(0) } }, [product])
  useEffect(() => {
    if (product) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = originalOverflow }
    }
  }, [product])

  const carouselImages = useMemo(() => {
    if (!product) return []
    const imgs = [...product.images]
    product.skus.forEach((sku) => {
      if (!imgs.some(img => img.url === sku.imageUrl) && sku.imageUrl) imgs.push({ url: sku.imageUrl, alt: sku.nameZh })
    })
    return imgs
  }, [product])

  function handleSelectSku(sku: SkuInfo) {
    setSelectedSku(sku)
    const idx = carouselImages.findIndex(img => img.url === sku.imageUrl)
    if (idx !== -1) setSwiperIndex(idx)
  }

  const activePricing = selectedSku?.pricing ?? (product?.skus[0]?.pricing ?? null)

  if (!product) return null

  return (
    <AnimatePresence>
      {!!product && (
        <>
          <motion.div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
          <motion.div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white rounded-t-[32px] border-t border-zinc-100 z-50 overflow-hidden shadow-2xl flex flex-col pointer-events-auto" style={{ maxHeight: '90vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 220 }} drag="y" dragConstraints={{ top: 0 }} dragElastic={0.35} onDragEnd={(_e, info) => { if (info.offset.y > 110) onClose() }}>
            <div className="w-full flex justify-center py-4 bg-zinc-50 border-b border-zinc-100 select-none cursor-grab active:cursor-grabbing shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
            </div>
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-none pb-12 flex-1">
              <div className="w-full relative">
                <ProductSwiper images={carouselImages} currentIndex={swiperIndex} onIndexChange={setSwiperIndex} />
                <button onClick={onClose} className="absolute top-4 left-4 bg-zinc-950/75 backdrop-blur-md text-white hover:text-rose-400 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all z-20"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.8 rounded-full border border-amber-200 uppercase flex items-center gap-1 leading-none"><Sparkles className="w-2.5 h-2.5 animate-spin-slow" /><span>{product.category || '流行首饰'}</span></span>
                  <span className="bg-zinc-100 text-zinc-500 font-mono text-[9px] font-medium tracking-wider px-2 py-0.5 rounded leading-none">{product.spuCode}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-wide font-sans leading-snug">{product.title}</h1>
              </div>
              <hr className="border-zinc-100" />
              <SkuRow skus={product.skus} selectedSkuCode={selectedSku?.skuCode ?? null} onSelectSku={handleSelectSku} />

              {/* ★ Pricing display — Distribution mode */}
              {showPrice && activePricing && (
                <div className="bg-gradient-to-br from-amber-500/[0.04] to-zinc-50/50 border border-amber-500/15 rounded-2xl p-4 space-y-3 shadow-inner select-none">
                  <div className="flex justify-between items-center pb-2 border-b border-amber-500/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      <span>分销价格及利润评测 {selectedSku ? `(${selectedSku.nameZh})` : '(参考均价)'}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono tracking-wider">币种: {activePricing.currency}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-0.5 bg-white border border-amber-500/10 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="text-[8px] text-zinc-400 font-bold">代发供货结算价</span>
                      <div className="text-amber-600 font-mono font-extrabold text-sm sm:text-lg mt-1">{activePricing.currency}{activePricing.supplyPrice.toFixed(2)}</div>
                      <p className="text-[7.5px] text-zinc-400 truncate mt-0.5">大厂批发代发价格</p>
                    </div>
                    <div className="space-y-0.5 bg-white border border-zinc-100 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="text-[8px] text-zinc-400 font-bold">建议零售指导价</span>
                      <div className="text-zinc-700 font-mono font-extrabold text-sm sm:text-lg mt-1">{activePricing.currency}{activePricing.suggestedPrice.toFixed(1)}</div>
                      <p className="text-[7.5px] text-zinc-400 truncate mt-0.5">建议市场零售限价</p>
                    </div>
                    <div className="space-y-0.5 bg-white border border-emerald-500/10 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="text-[8px] text-emerald-800 font-bold">估计出栏利润率</span>
                      <div className="text-emerald-600 font-mono font-extrabold text-sm sm:text-lg mt-1">+{activePricing.profitMargin.toFixed(0)}%</div>
                      <p className="text-[7.5px] text-emerald-500 font-semibold truncate mt-0.5">每件纯利+{activePricing.currency}{activePricing.profitAmount.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-xs text-zinc-600 font-sans leading-relaxed select-none">
                <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs tracking-wider"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>雨图品质及服务声明</span></div>
                <p className="pl-6 text-[11px] text-zinc-500">本品采用雨图精选耐磨材质工艺，抗氧化，不生锈。所有配饰经过拉力与色牢测试，支持多色定制加工配对。纯手工抛光，支持PIM系统大图一件代发。</p>
                <div className="grid grid-cols-2 gap-4 pl-6 pt-1 text-[10px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-zinc-400" /><span>做工等级: A级精工</span></div>
                  <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /><span>过敏评估: 低敏材质</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
