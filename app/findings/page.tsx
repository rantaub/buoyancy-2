'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trash2, Clock, Star, Camera } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FossilInfo } from '@/lib/types'
import { getSavedFossils, removeFossil, isPremiumUser } from '@/lib/storage'

const FREE_LIMIT = 3

export default function FindingsPage() {
  const router = useRouter()
  const [fossils, setFossils] = useState<FossilInfo[]>([])
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    setFossils(getSavedFossils())
    setIsPremium(isPremiumUser())
  }, [])

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFossil(id)
    setFossils(getSavedFossils())
  }

  const handleViewFossil = (fossil: FossilInfo) => {
    sessionStorage.setItem(`fossil_${fossil.id}`, JSON.stringify(fossil))
    router.push(`/fossil/${fossil.id}`)
  }

  const displayedFossils = isPremium ? fossils : fossils.slice(0, FREE_LIMIT)
  const locked = !isPremium && fossils.length > FREE_LIMIT

  return (
    <div className="min-h-screen pt-8 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-100 mb-1">My Findings</h1>
              <p className="text-stone-500">
                {fossils.length} fossil{fossils.length !== 1 ? 's' : ''} discovered
                {!isPremium && ` · ${FREE_LIMIT} max on free plan`}
              </p>
            </div>
            <Link href="/subscribe" className="flex items-center gap-1.5 px-4 py-2 bg-amber-900/30 border border-amber-700/30 rounded-xl text-amber-400 text-sm hover:bg-amber-900/50 transition-colors">
              <Star className="w-4 h-4" /> Premium
            </Link>
          </div>
        </motion.div>

        {fossils.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <BookOpen className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <h2 className="text-stone-400 text-xl font-medium mb-2">No findings yet</h2>
            <p className="text-stone-600 mb-6">Start by photographing a fossil to build your collection.</p>
            <Link href="/" className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2">
              <Camera className="w-4 h-4" /> Identify a Fossil
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFossils.map((fossil, i) => (
                <motion.div
                  key={fossil.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleViewFossil(fossil)}
                  className="fossil-card rounded-2xl overflow-hidden cursor-pointer hover:border-amber-700/40 transition-all group"
                >
                  <div className="relative h-44">
                    <img src={fossil.imageUrl} alt={fossil.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                    <button
                      onClick={(e) => handleRemove(fossil.id, e)}
                      className="absolute top-2 right-2 p-1.5 bg-stone-900/80 rounded-lg text-stone-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xs px-2 py-0.5 bg-amber-900/60 border border-amber-700/30 text-amber-400 rounded-full">
                        {fossil.rarity}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-stone-200 font-semibold">{fossil.name}</h3>
                    <p className="text-stone-500 text-sm italic mb-2">{fossil.scientificName}</p>
                    <div className="flex items-center gap-1 text-stone-600 text-xs">
                      <Clock className="w-3 h-3" />
                      {fossil.period}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {locked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 glass-card rounded-2xl p-8 text-center"
              >
                <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-stone-200 font-bold text-xl mb-2">
                  {fossils.length - FREE_LIMIT} more finding{fossils.length - FREE_LIMIT > 1 ? 's' : ''} locked
                </h3>
                <p className="text-stone-500 mb-5">Upgrade to Premium to save unlimited fossils and unlock all features.</p>
                <Link href="/subscribe" className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all inline-block">
                  Unlock Premium
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
