import AsyncStorage from '@react-native-async-storage/async-storage'
import { FossilInfo } from './types'

const STORAGE_KEY = 'fossil_findings'
const PREMIUM_KEY = 'fossil_premium'

export async function getSavedFossils(): Promise<FossilInfo[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export async function saveFossil(fossil: FossilInfo): Promise<void> {
  const fossils = await getSavedFossils()
  if (!fossils.find(f => f.id === fossil.id)) {
    fossils.unshift(fossil)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fossils))
  }
}

export async function removeFossil(id: string): Promise<void> {
  const fossils = (await getSavedFossils()).filter(f => f.id !== id)
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fossils))
}

export async function isPremiumUser(): Promise<boolean> {
  return (await AsyncStorage.getItem(PREMIUM_KEY)) === 'true'
}

export async function setPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_KEY, String(value))
}
