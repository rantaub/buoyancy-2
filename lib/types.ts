export interface FossilInfo {
  id: string
  name: string
  scientificName: string
  period: string
  age: string
  description: string
  fossilType: string
  fossilTypeExplanation: string
  formationProcess: string
  animalDescription: string
  animalBehavior: string
  animalSize: string
  diet: string
  habitat: string
  geography: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Exceptional'
  significance: string
  funFact: string
  imageUrl: string
  animalImageUrl: string
  savedAt: number
  sharedBy?: string
}
