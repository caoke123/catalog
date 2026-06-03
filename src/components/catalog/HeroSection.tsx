'use client'
import { motion } from 'framer-motion'
import { CatalogData } from '@/types/catalog'

interface HeroSectionProps {
  catalog: CatalogData
  onEnter: () => void
}

export default function HeroSection({ catalog, onEnter }: HeroSectionProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 背景图 */}
      {catalog.coverImageUrl ? (
        <img
          src={catalog.coverImageUrl}
          alt={catalog.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      )}
      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-black/35" />
      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            {catalog.brand}
          </h1>
          <p className="text-white/80 text-lg">
            {catalog.name}
          </p>
          <button
            onClick={onEnter}
            className="mt-4 px-8 py-3 border-2 border-white text-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-colors"
          >
            查看图册 →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
