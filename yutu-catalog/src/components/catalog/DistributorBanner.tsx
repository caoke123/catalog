'use client'
import { ShieldCheck, Building2, Calendar, Users } from 'lucide-react'
import { DistributorInfo as DistributorInfoType } from '@/adapters/catalogAdapter'

interface DistributorBannerProps {
  distributor: DistributorInfoType
}

export default function DistributorBanner({ distributor }: DistributorBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-white overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{distributor.distributorName}</span>
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[9px] font-mono text-amber-300 whitespace-nowrap">{distributor.cooperationLevel}</span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono tracking-wider">
          {distributor.validUntil && (
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3 text-zinc-500" />
              <span>有效期至 {new Date(distributor.validUntil).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
          {distributor.contactManager && (
            <div className="flex items-center gap-1 shrink-0">
              <Users className="w-3 h-3 text-zinc-500" />
              <span>客户经理: {distributor.contactManager}</span>
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>币种: {distributor.currency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
