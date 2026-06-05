'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bookmark, BookmarkCheck, Share2, Clock, MapPin,
  Layers, Dna, Leaf, Ruler, Star, Lightbulb, Shield, FlaskConical, PawPrint
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

const fossilTypeColors: Record<string, string> = {
  'Permineralized': 'text-amber-400 bg-amber-900/20 border-amber-700/30',
  'Mold': 'text-blue-400 bg-blue-900/20 border-blue-700/30',
  'Cast': 'text-green-400 bg-green-900/20 border-green-700/30',
  'Carbon Film': 'text-stone-300 bg-stone-800/50 border-stone-600/30',
  'Trace Fossil': 'text-orange-400 bg-orange-900/20 border-orange-700/30',
  'Amber Preservation': 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30',
  'Replacement': 'text-purple-400 bg-purple-900/20 border-purple-700/30',
}

export default function FossilDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [fossil, setFossil] = useState<FossilInfo | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [animalImgError, setAnimalImgError] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem(`fossil_${id}`)
    if (data) {
      const parsed = JSON.parse(data)
      setFossil(parsed)
      const saved = getSavedFossils()
      setIsSaved(saved.some((f: FossilInfo) => f.id === id))
    }
  }, [id])

  const handleSave = () => {
    if (!fossil) return
    if (isSaved) {
      removeFossil(fossil.id); setIsSaved(false); setSaveMsg('Removed from findings')
    } else {
      saveFossil(fossil); setIsSaved(true); setSaveMsg('Saved to findings!')
    }
    setTimeout(() => setSaveMsg(''), 2000)
  }

  if (!fossil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 mb-4">Fossil not found</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-amber-700 rounded-lg text-stone-100">Go Home</button>
        </div>
      </div>
    )
  }

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
              {isSaved ? <BookmarkCheck className="w-5 h-5 text-amber-400" /> : <Bookmark className="w-5 h-5 text-stone-300 hover:text-white" />}
            </button>
          </div>
        </div>

        {saveMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-800 border border-amber-700/30 rounded-lg text-amber-400 text-sm whitespace-nowrap"
          >
            {saveMsg}
          </motion.div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative">
        {/* Title Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fossil-card rounded-2xl p-6 mb-4 amber-glow">
          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
            <div>
              <h1 className="text-3xl font-bold text-stone-100">{fossil.name}</h1>
              <p className="text-amber-400/80 italic text-lg">{fossil.scientificName}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {fossil.fossilType && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${fossilTypeColors[fossil.fossilType] || 'text-stone-400 bg-stone-800/50 border-stone-600/50'}`}>
                  {fossil.fossilType}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${rarityColors[fossil.rarity]}`}>
                {fossil.rarity}
              </span>
            </div>
          </div>
          <p className="text-stone-300 leading-relaxed mb-5">{fossil.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: 'Period', value: fossil.period },
              { icon: Layers, label: 'Age', value: fossil.age },
              { icon: Ruler, label: 'Size', value: fossil.animalSize || fossil.animalSize },
              { icon: Dna, label: 'Diet', value: fossil.diet },
            ].map(stat => (
              <div key={stat.label} className="bg-stone-900/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                  <stat.icon className="w-3.5 h-3.5" />{stat.label}
                </div>
                <p className="text-stone-200 text-sm font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fossil Type Section */}
        {fossil.fossilType && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="fossil-card rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-stone-900">
                <FlaskConical className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-stone-200 font-semibold text-lg">Fossil Type: {fossil.fossilType}</h2>
              </div>
            </div>
            <p className="text-stone-400 leading-relaxed">{fossil.fossilTypeExplanation}</p>
          </motion.div>
        )}

        {/* Formation Process */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-stone-900"><Layers className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">How This Fossil Formed</h2>
          </div>
          <p className="text-stone-400 leading-relaxed">{fossil.formationProcess}</p>
        </motion.div>

        {/* The Animal — with image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-stone-900"><PawPrint className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">The Living Animal</h2>
          </div>

          {fossil.animalImageUrl && !animalImgError && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={fossil.animalImageUrl}
                alt={`Illustration of ${fossil.name}`}
                className="w-full max-h-64 object-cover"
                onError={() => setAnimalImgError(true)}
              />
              <p className="text-xs text-stone-600 text-center mt-1 pb-1">Artistic/scientific reconstruction · Wikipedia</p>
            </div>
          )}

          <p className="text-stone-400 leading-relaxed mb-4">{fossil.animalDescription}</p>
          <div className="bg-stone-900/60 rounded-xl p-4">
            <h3 className="text-stone-300 font-medium mb-2 flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-amber-400" /> Behaviour
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">{fossil.animalBehavior}</p>
          </div>
        </motion.div>

        {/* Habitat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-stone-900"><Leaf className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">Original Habitat</h2>
          </div>
          <p className="text-stone-400 leading-relaxed">{fossil.habitat}</p>
        </motion.div>

        {/* Geography */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-stone-900"><MapPin className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">Where Found Today</h2>
          </div>
          <p className="text-stone-400 leading-relaxed">{fossil.geography}</p>
        </motion.div>

        {/* Significance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-stone-900"><Shield className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">Scientific Significance</h2>
          </div>
          <p className="text-stone-400 leading-relaxed">{fossil.significance}</p>
        </motion.div>

        {/* Fun Fact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="fossil-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-stone-900"><Lightbulb className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-stone-200 font-semibold text-lg">Did You Know?</h2>
          </div>
          <p className="text-stone-400 leading-relaxed">{fossil.funFact}</p>
        </motion.div>

        {/* Save CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 text-center mt-4">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-stone-200 font-semibold mb-2">Add to Your Collection</h3>
          <p className="text-stone-500 text-sm mb-4">Save this fossil to your findings and build your personal paleontology archive.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleSave} className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaved ? 'Saved!' : 'Save Finding'}
            </button>
            <button onClick={() => setShowShare(true)} className="px-6 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl font-medium transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </motion.div>
      </div>

      {showShare && fossil && <ShareModal fossil={fossil} onClose={() => setShowShare(false)} />}
    </div>
  )
}
