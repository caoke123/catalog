'use client'
import { motion } from 'framer-motion'
import { ChevronDown, Calendar, Building2 } from 'lucide-react'
import { HeroInfo } from '@/adapters/catalogAdapter'

interface HeroSectionProps {
  hero: HeroInfo
  onEnter: () => void
  showCustomerName?: boolean
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}年${m}月${day}日`
}

export default function HeroSection({ hero, onEnter, showCustomerName }: HeroSectionProps) {
  const formattedDate = formatDate(hero.createdAt)

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between select-none">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hero.coverImageUrl ? (
          <motion.img src={hero.coverImageUrl} alt={hero.name} className="w-full h-full object-cover scale-110 filter brightness-90 saturate-105" referrerPolicy="no-referrer" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-zinc-950/90" />
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center font-bold text-white text-lg tracking-wider">Y</div>
          <span className="font-medium text-white tracking-widest text-lg">{hero.brand}</span>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center flex-grow -translate-y-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="flex flex-col items-center gap-4">
          <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[11px] tracking-wider font-mono uppercase backdrop-blur-sm shadow-sm">{hero.brand} COLLECTIVE</div>
          <h1 className="font-sans font-extrabold text-white tracking-tight leading-none text-4xl sm:text-5xl md:text-6xl text-balance">{hero.name}</h1>

          {/* Customer Name — Distribution 模式 */}
          {showCustomerName && hero.customerName && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/80 text-xs tracking-wide">专属合作客户</span>
              <span className="text-white font-semibold text-sm">{hero.customerName}</span>
            </motion.div>
          )}

          <div className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm tracking-wide mt-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>发布日期：{formattedDate}</span>
            <span className="text-zinc-500">•</span>
            <span>共 {hero.productCount} 款优选新品</span>
          </div>
          <div className="mt-8">
            <button onClick={onEnter} id="btn-scroll-to-products" className="px-10 py-4 rounded-full bg-white text-zinc-950 font-bold text-xs sm:text-sm tracking-[0.15em] hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 cursor-pointer flex items-center justify-center gap-2.5 active:scale-95">
              <span>开启数字化展厅</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-zinc-600" />
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full pb-8 flex flex-col items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 1, 0.3], y: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} onClick={onEnter} className="cursor-pointer flex flex-col items-center gap-1.5">
          <span className="text-zinc-400 text-[10px] uppercase tracking-widest font-mono">向上轻扫 或 点击进入</span>
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </footer>
    </div>
  )
}
