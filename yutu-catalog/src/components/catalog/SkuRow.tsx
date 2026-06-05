'use client'
import { Check } from 'lucide-react'
import { SkuInfo } from '@/adapters/catalogAdapter'

interface SkuRowProps {
  skus: SkuInfo[]
  selectedSkuCode: string | null
  onSelectSku: (sku: SkuInfo) => void
}

export default function SkuRow({ skus, selectedSkuCode, onSelectSku }: SkuRowProps) {
  if (!skus || skus.length === 0) return null

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-zinc-900 tracking-wider uppercase">
          可用规格选项 ({skus.length} 种配色/材质)
        </h4>
        <span className="text-[10px] text-zinc-400 font-mono">点击规格切换图片预览</span>
      </div>

      <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none pr-4">
        {skus.map((sku) => {
          const isSelected = selectedSkuCode === sku.skuCode

          return (
            <button
              key={sku.skuCode}
              onClick={() => onSelectSku(sku)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all truncate shrink-0 max-w-[210px] text-left cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-950/15 font-semibold'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
              }`}
            >
              <div className="relative w-10 h-10 rounded-xl bg-zinc-200 overflow-hidden shrink-0 shadow-inner">
                <img
                  src={sku.imageUrl}
                  alt={sku.nameZh}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white stroke-[3.5]" />
                  </div>
                )}
              </div>

              <div className="truncate pr-1 space-y-0.5">
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
                  {sku.nameZh}
                </p>
                <p className="text-[9px] font-mono tracking-wider truncate text-zinc-400">
                  {sku.nameEn}
                </p>
                <p className={`text-[8px] font-mono truncate leading-none ${isSelected ? 'text-amber-400/90' : 'text-zinc-400'}`}>
                  {sku.skuCode}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
