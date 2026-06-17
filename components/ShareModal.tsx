'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Twitter, Mail, Check } from 'lucide-react'
import { FossilInfo } from '@/lib/types'

interface Props {
  fossil: FossilInfo
  onClose: () => void
}

export default function ShareModal({ fossil, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const shareText = `I just identified a ${fossil.name} (${fossil.scientificName}) fossil from the ${fossil.period} period using FossilLens! 🦕`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    {
      icon: copied ? Check : Link2,
      label: copied ? 'Copied!' : 'Copy Link',
      action: copyLink,
      color: 'bg-stone-700 hover:bg-stone-600',
      textColor: copied ? 'text-green-400' : 'text-stone-100',
    },
    {
      icon: Twitter,
      label: 'Twitter / X',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`),
      color: 'bg-sky-800 hover:bg-sky-700',
      textColor: 'text-stone-100',
    },
    {
      icon: Mail,
      label: 'Email',
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Fossil Find: ' + fossil.name)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`),
      color: 'bg-stone-700 hover:bg-stone-600',
      textColor: 'text-stone-100',
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-sm fossil-card rounded-2xl p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-stone-100 font-semibold text-lg">Share Discovery</h3>
            <button aria-label="Close" onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-900/60 rounded-xl mb-5">
            <img src={fossil.imageUrl} alt={fossil.name} className="w-14 h-14 object-cover rounded-lg" />
            <div>
              <p className="text-stone-200 font-medium">{fossil.name}</p>
              <p className="text-stone-500 text-sm">{fossil.period}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {shareOptions.map(option => (
              <button
                key={option.label}
                onClick={option.action}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${option.color} ${option.textColor}`}
              >
                <option.icon className="w-5 h-5" />
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
