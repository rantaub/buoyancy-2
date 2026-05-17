'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bookmark, BookmarkCheck, Share2, Clock, MapPin,
  Layers, Dna, Leaf, Ruler, Star, Lightbulb, Shield
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { FossilInfo } from '@/lib/types'
import { saveFossil, getSavedFossils, removeFossil } from '@/lib/storage'
import ShareModal from '@/components/ShareModal'

const rarityColors: Record<string, string> = {
  'Common': 'text-gray-400 bg-gray-800/50 border-gray-700/50',
  'Uncommon': 'text-green-400 bg-green-900/30 border-green-700/30',
  'Rare': 'text-blue-400 bg-blue-900/30 border-blue-700/30',
  'Very Rare': 'text-purple-400 bg-purple-900/30 border-purple-700/30',
  'Exceptional': 'text-amber-400 bg-amber-900/30 border-amber-700/30',
}

export default function FossilDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [fossil, setFossil] = useState<FossilInfo | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem(`fossil_${id}`)
    if (data) {
      const parsed = JSON.parse(data)
      setFossil(parsed)
      const saved = getSavedFossils()
      setIsSaved(saved.some(f => f.id === id))
    }
  }, [id])

  const handleSave = () => {
    if (!fossil) return
    if (isSaved) {
      removeFossil(fossil.id)
      setIsSaved(false)
      setSaveMsg('Removed from findings')
    } else {
      saveFossil(fossil)
      setIsSaved(true)
      setSaveMsg('Saved to findings!')
    }
    setTimeout(() => setSaveMsg(''), 2000)
  }

  if (!fossil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 mb-4">Fossil not found</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-amber-700 rounded-lg text-stone-100">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const sections = [
    { icon: Layers, label: 'Formation Process', content: fossil.formationProcess, accent: 'amber' },
    { icon: Leaf, label: 'Original Habitat', content: fossil.habitat, accent: 'green' },
    { icon: MapPin, label: 'Global Distribution', content: fossil.geography, accent: 'blue' },
    { icon: Shield, label: 'Scientific Significance', content: fossil.significance, accent: 'purple' },
    { icon: Lightbulb, label: 'Did You Know?', content: fossil.funFact, accent: 'orange' },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Header Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={fossil.imageUrl} alt={fossil.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button aria-label="Go back" onClick={() => router.back()} className="p-2 glass-card rounded-xl text-stone-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button aria-label="Share fossil" onClick={() => setShowShare(true)} className="p-2 glass-card rounded-xl text-stone-300 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button aria-label="Save fossil" onClick={handleSave} className="p-2 glass-card rounded-xl transition-colors">
              {isSaved
                ? <BookmarkCheck className="w-5 h-5 text-amber-400" />
                : <Bookmark className="w-5 h-5 text-stone-300 hover:text-white" />
              }
            </button>
          </div>
        </div>

        {saveMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-800 border border-amber-700/30 rounded-lg text-amber-400 text-sm whitespace-nowrap"
          >
            {saveMsg}
          </motion.div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative">
        {/* Title Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fossil-card rounded-2xl p-6 mb-6 amber-glow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-stone-100">{fossil.name}</h1>
              <p className="text-amber-400/80 italic text-lg">{fossil.scientificName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${rarityColors[fossil.rarity]}`}>
              {fossil.rarity}
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed">{fossil.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { icon: Clock, label: 'Period', value: fossil.period },
              { icon: Layers, label: 'Age', value: fossil.age },
              { icon: Ruler, label: 'Size', value: fossil.size },
              { icon: Dna, label: 'Diet', value: fossil.diet },
            ].map(stat => (
              <div key={stat.label} className="bg-stone-900/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                  <stat.icon className="w-3.5 h-3.5" />
                  {stat.label}
                </div>
                <p className="text-stone-200 text-sm font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detail Sections */}
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="fossil-card rounded-2xl p-6 mb-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-stone-900">
                <section.icon className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-stone-200 font-semibold text-lg">{section.label}</h2>
            </div>
            <p className="text-stone-400 leading-relaxed">{section.content}</p>
          </motion.div>
        ))}

        {/* Save CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 text-center mt-6"
        >
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-stone-200 font-semibold mb-2">Add to Your Collection</h3>
          <p className="text-stone-500 text-sm mb-4">Save this fossil to your findings and build your personal paleontology archive.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaved ? 'Saved!' : 'Save Finding'}
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="px-6 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </motion.div>
      </div>

      {showShare && fossil && (
        <ShareModal fossil={fossil} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
