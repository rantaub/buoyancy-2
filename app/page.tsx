'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Microscope, BookOpen, Share2, Star, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function HomePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
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
          body: JSON.stringify({
            imageBase64: base64.split(',')[1],
            mimeType: file.type,
          }),
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
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }

  const features = [
    { icon: Microscope, title: 'AI Identification', desc: 'Powered by advanced vision AI trained on thousands of fossil specimens' },
    { icon: BookOpen, title: 'Rich History', desc: 'Get formation process, geological period, habitat, and scientific significance' },
    { icon: Share2, title: 'Share Findings', desc: 'Share your discoveries with the fossil community worldwide' },
    { icon: Star, title: 'Premium Collection', desc: 'Save unlimited findings and access exclusive features with Premium' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-stone-700/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30 border border-amber-700/30 text-amber-400 text-sm mb-6">
              <Microscope className="w-4 h-4" />
              AI-Powered Fossil Identification
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-stone-100 mb-6 leading-tight">
              Discover Ancient
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Life in Stone
              </span>
            </h1>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-12">
              Photograph any fossil and instantly reveal its name, age, formation story, and significance — millions of years of history in seconds.
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fossil-card rounded-2xl p-12 amber-glow"
                >
                  {preview && (
                    <div className="mb-6 relative">
                      <img src={preview} alt="Fossil" className="w-48 h-48 object-cover rounded-xl mx-auto opacity-50" />
                      <div className="absolute inset-0 shimmer rounded-xl" />
                    </div>
                  )}
                  <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                  <p className="text-stone-300 text-lg font-medium">Analyzing your fossil...</p>
                  <p className="text-stone-500 text-sm mt-2">Our AI paleontologist is at work</p>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`fossil-card rounded-2xl p-12 cursor-pointer transition-all duration-300 ${
                    isDragging ? 'border-amber-500/60 bg-amber-900/10 amber-glow' : 'hover:border-amber-700/40'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-amber-900/30 border border-amber-700/30 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-amber-400" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-stone-800 border border-stone-600 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-stone-300" />
                      </div>
                    </div>
                    <div>
                      <p className="text-stone-200 text-xl font-semibold mb-1">
                        {isDragging ? 'Drop your fossil photo here' : 'Take or upload a fossil photo'}
                      </p>
                      <p className="text-stone-500 text-sm">
                        Tap to use camera or drag & drop an image • JPG, PNG, WebP
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Take Photo
                      </button>
                      <button className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl font-medium transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Image
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-stone-400 text-sm uppercase tracking-widest mb-12"
          >
            What FossilLens does
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
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-10">
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-100 mb-3">Unlock Premium Features</h2>
            <p className="text-stone-400 mb-6">Save unlimited findings, get expert analysis, and connect with fossil hunters worldwide.</p>
            <a href="/subscribe" className="inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all">
              View Plans
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
