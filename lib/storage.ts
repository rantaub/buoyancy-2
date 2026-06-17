import { FossilInfo } from './types'

const STORAGE_KEY = 'fossil_findings'
const PREMIUM_KEY = 'fossil_premium'

export function getSavedFossils(): FossilInfo[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveFossil(fossil: FossilInfo): void {
  if (typeof window === 'undefined') return
  const fossils = getSavedFossils()
  const exists = fossils.find(f => f.id === fossil.id)
  if (!exists) {
    fossils.unshift(fossil)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fossils))
  }
}

export function removeFossil(id: string): void {
  if (typeof window === 'undefined') return
  const fossils = getSavedFossils().filter(f => f.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fossils))
}

export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PREMIUM_KEY) === 'true'
}

export function setPremium(value: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREMIUM_KEY, String(value))
}
