'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { AgreementInfo } from '@/adapters/catalogAdapter'

interface AgreementModalProps {
  agreement: AgreementInfo
  isOpen: boolean
  onClose: () => void
}

export default function AgreementModal({ agreement, isOpen, onClose }: AgreementModalProps) {
  const lines = agreement.text.split('\n')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-4 top-16 max-w-lg mx-auto bg-white rounded-2xl z-50 overflow-hidden shadow-2xl flex flex-col"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-zinc-900">分销合作协议</h2>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <X className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 text-sm text-zinc-700 leading-relaxed space-y-3 scrollbar-none flex-1">
              {lines.map((line, i) => {
                const isH1 = line.startsWith('# ')
                const isH2 = line.startsWith('## ')
                const isEmpty = line.trim() === ''
                const content = line.replace(/^#+ /, '')

                if (isEmpty) return <div key={i} className="h-2" />
                if (isH1) return <h1 key={i} className="text-base font-extrabold text-zinc-900 border-b border-zinc-200 pb-2">{content}</h1>
                if (isH2) return <h2 key={i} className="text-sm font-bold text-zinc-800 mt-3">{content}</h2>
                return <p key={i} className="text-[13px] text-zinc-500">{line}</p>
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
