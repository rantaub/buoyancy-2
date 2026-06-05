'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Microscope, BookOpen, Share2, Star, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setError(null)
    setIsAnalyzing(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      try {
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64.split(',')[1], mimeType: file.type }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Identification failed')
        const fossilId = uuidv4()
        const fossil = { ...data, id: fossilId, imageUrl: base64, savedAt: Date.now() }
        sessionStorage.setItem(`fossil_${fossilId}`, JSON.stringify(fossil))
        router.push(`/fossil/${fossilId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to identify fossil. Please try again.')
        setIsAnalyzing(false)
        setPreview(null)
      }
    }
    reader.readAsDataURL(file)
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }

  const features = [
    { icon: Microscope, title: 'AI Identification', desc: 'Powered by advanced vision AI trained on thousands of fossil specimens' },
    { icon: BookOpen, title: 'Rich History', desc: 'Formation process, fossil type, geological period and scientific significance' },
    { icon: Share2, title: 'Share Findings', desc: 'Share your discoveries with the fossil community worldwide' },
    { icon: Star, title: 'Premium Collection', desc: 'Save unlimited findings and access exclusive features with Premium' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero with Prehistoric Animal */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* CSS prehistoric atmosphere — no external image needed */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 90% 70% at 65% 40%, rgba(120,53,15,0.55) 0%, rgba(28,20,18,0.85) 55%, #0c0a09 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 60% at 20% 70%, rgba(44,20,8,0.6) 0%, transparent 70%)',
        }} />
        {/* Dinosaur silhouette */}
        <div className="absolute right-4 md:right-16 bottom-0 text-[18rem] md:text-[22rem] leading-none opacity-[0.07] pointer-events-none select-none"
          style={{ filter: 'sepia(1) saturate(3) hue-rotate(10deg)' }}>
          🦖
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-transparent to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-stone-950/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/40 border border-amber-700/40 text-amber-400 text-sm mb-6 backdrop-blur-sm">
              <Microscope className="w-4 h-4" />
              AI-Powered Fossil Identification
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-stone-100 mb-4 leading-tight drop-shadow-2xl">
              Discover Ancient
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Life in Stone
              </span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10 drop-shadow-lg">
              Photograph any fossil and instantly reveal its name, type, formation story, and the incredible animal that created it.
            </p>
          </motion.div>

          {/* Upload Buttons — prominent in hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-2xl shadow-amber-900/50 hover:scale-105"
            >
              <Camera className="w-6 h-6" />
              Take Photo
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center gap-3 px-8 py-4 bg-stone-800/80 hover:bg-stone-700/80 text-stone-100 rounded-2xl font-semibold text-lg transition-all backdrop-blur-sm border border-stone-600/50 hover:scale-105"
            >
              <Upload className="w-6 h-6" />
              Upload from Gallery
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-stone-400/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-stone-400/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Analyzing State Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            {preview && (
              <div className="mb-8 relative">
                <img src={preview} alt="Fossil" className="w-56 h-56 object-cover rounded-2xl opacity-60" />
                <div className="absolute inset-0 shimmer rounded-2xl" />
              </div>
            )}
            <Loader2 className="w-14 h-14 text-amber-400 animate-spin mb-5" />
            <p className="text-stone-200 text-2xl font-semibold mb-2">Analyzing your fossil...</p>
            <p className="text-stone-500">Our AI paleontologist is at work</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone (drag and drop) */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-testid="upload-zone"
          className={`fossil-card rounded-2xl p-10 cursor-pointer transition-all duration-300 text-center ${
            isDragging ? 'border-amber-500/60 bg-amber-900/10 amber-glow' : 'hover:border-amber-700/40'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-stone-200 text-lg font-semibold mb-1">
            {isDragging ? 'Drop your fossil photo here' : 'Or drag & drop a fossil image here'}
          </p>
          <p className="text-stone-500 text-sm">JPG, PNG, WebP supported</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-900/30 border border-red-700/30 rounded-xl flex items-center gap-3 text-red-300"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </section>

      {/* What you get section */}
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center text-stone-400 text-sm uppercase tracking-widest mb-8"
        >
          What FossilLens reveals
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="fossil-card rounded-xl p-6"
            >
              <feature.icon className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="text-stone-200 font-semibold mb-2">{feature.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 max-w-2xl mx-auto text-center">
        <div className="glass-card rounded-2xl p-10">
          <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-100 mb-3">Unlock Premium Features</h2>
          <p className="text-stone-400 mb-6">Save unlimited findings, get expert analysis, and connect with fossil hunters worldwide.</p>
          <a href="/subscribe" className="inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all">
            View Plans
          </a>
        </div>
      </section>
    </div>
  )
}
