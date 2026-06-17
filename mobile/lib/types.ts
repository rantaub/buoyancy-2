export interface FossilInfo {
  id: string
  name: string
  scientificName: string
  period: string
  age: string
  description: string
  formationProcess: string
  habitat: string
  diet: string
  size: string
  geography: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Exceptional'
  significance: string
  funFact: string
  imageUri: string
  savedAt: number
}
