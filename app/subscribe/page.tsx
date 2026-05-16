'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Shield, Users, BookOpen, Share2, Infinity, Camera } from 'lucide-react'
import { setPremium } from '@/lib/storage'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  const [activating, setActivating] = useState(false)

  const handleSubscribe = async (plan: string) => {
    if (plan === 'free') {
      router.push('/findings')
      return
    }
    setActivating(true)
    await new Promise(r => setTimeout(r, 1500))
    setPremium(true)
    setActivating(false)
    router.push('/findings')
  }

  const plans = [
    {
      id: 'free',
      name: 'Explorer',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual fossil hunters',
      icon: Camera,
      color: 'stone',
      features: [
        { text: '5 identifications per day', included: true },
        { text: 'Save up to 3 findings', included: true },
        { text: 'Basic fossil info', included: true },
        { text: 'Share via link', included: true },
        { text: 'Unlimited saves', included: false },
        { text: 'Expert analysis reports', included: false },
        { text: 'Community feed', included: false },
        { text: 'Offline access', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Paleontologist',
      price: isAnnual ? '$5' : '$8',
      period: isAnnual ? '/mo, billed annually' : '/month',
      description: 'For serious fossil enthusiasts',
      icon: Star,
      color: 'amber',
      popular: true,
      features: [
        { text: 'Unlimited identifications', included: true },
        { text: 'Unlimited findings saved', included: true },
        { text: 'Detailed expert analysis', included: true },
        { text: 'Share + community feed', included: true },
        { text: 'Formation 3D visualizations', included: true },
        { text: 'Export to PDF reports', included: true },
        { text: 'Offline access', included: true },
        { text: 'Priority AI processing', included: true },
      ],
    },
  ]

  const benefits = [
    { icon: Infinity, title: 'Unlimited Everything', desc: 'Identify and save as many fossils as you find' },
    { icon: BookOpen, title: 'Expert Reports', desc: 'Detailed scientific analysis and formation stories' },
    { icon: Users, title: 'Community', desc: 'Share discoveries and learn from other fossil hunters' },
    { icon: Shield, title: 'Offline Mode', desc: 'Access your collection anywhere, even without internet' },
  ]

  return (
    <div className="min-h-screen pt-8 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30 border border-amber-700/30 text-amber-400 text-sm mb-4">
            <Zap className="w-4 h-4" /> Unlock the full experience
          </div>
          <h1 className="text-4xl font-bold text-stone-100 mb-3">Choose Your Plan</h1>
          <p className="text-stone-400 text-lg mb-6">Start for free, upgrade when you&apos;re ready</p>

          <div className="inline-flex items-center gap-3 p-1 bg-stone-800 rounded-xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isAnnual ? 'bg-stone-600 text-stone-100' : 'text-stone-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isAnnual ? 'bg-amber-700 text-stone-100' : 'text-stone-500'}`}
            >
              Annual <span className="text-xs text-amber-400 ml-1">Save 37%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-b from-amber-900/40 to-stone-900/60 border border-amber-600/40 amber-glow'
                  : 'fossil-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${plan.popular ? 'bg-amber-800/50' : 'bg-stone-800'}`}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-amber-400' : 'text-stone-400'}`} />
                </div>
                <div>
                  <h2 className="text-stone-100 font-bold text-lg">{plan.name}</h2>
                  <p className="text-stone-500 text-sm">{plan.description}</p>
                </div>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-bold text-stone-100">{plan.price}</span>
                <span className="text-stone-500 ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map(feature => (
                  <li key={feature.text} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.included ? 'bg-amber-700/50' : 'bg-stone-800'
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${feature.included ? 'text-amber-400' : 'text-stone-700'}`} />
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-stone-300' : 'text-stone-600 line-through'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={activating}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                    : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                } disabled:opacity-50`}
              >
                {activating && plan.popular ? 'Activating...' : plan.id === 'free' ? 'Continue Free' : 'Get Premium'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="fossil-card rounded-xl p-4 text-center"
            >
              <benefit.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <h3 className="text-stone-300 font-medium text-sm mb-1">{benefit.title}</h3>
              <p className="text-stone-600 text-xs">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
