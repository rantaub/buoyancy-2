'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Microscope, BookOpen, Star, Home } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', icon: Home, label: 'Identify' },
    { href: '/findings', icon: BookOpen, label: 'Findings' },
    { href: '/subscribe', icon: Star, label: 'Premium' },
  ]

  return (
    <>
      {/* Top Nav (desktop) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-4 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
        <Link href="/" className="flex items-center gap-2 text-stone-100 font-bold text-lg">
          <Microscope className="w-6 h-6 text-amber-400" />
          FossilLens
        </Link>
        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-amber-900/30 text-amber-400'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-xl border-t border-stone-800/50 px-4 py-2">
        <div className="flex justify-around">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                pathname === link.href ? 'text-amber-400' : 'text-stone-500'
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for desktop nav */}
      <div className="hidden md:block h-16" />
    </>
  )
}
