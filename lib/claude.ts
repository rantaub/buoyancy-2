import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function getAnimalImage(searchTerm: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(searchTerm.split(' ').slice(0, 3).join(' '))
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { 'User-Agent': 'FossilLens/1.0 (educational)' },
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data.thumbnail?.source || ''
  } catch {
    return ''
  }
}

const FOSSIL_PROMPT = `You are an expert paleontologist. Analyze this fossil image and return ONLY a valid JSON object (no markdown, no extra text):
{
  "name": "Common name of the fossil organism",
  "scientificName": "Scientific/Latin name",
  "period": "Geological period (e.g. Jurassic, Cretaceous)",
  "age": "Approximate age range (e.g. '150-145 million years ago')",
  "description": "2-3 sentence overview of the fossil",
  "fossilType": "One of: Permineralized, Mold, Cast, Carbon Film, Trace Fossil, Amber Preservation, Freeze Preservation, Replacement, or Recrystallization",
  "fossilTypeExplanation": "A clear paragraph explaining what this specific fossil type means and how THIS fossil became that type — written for a curious non-scientist",
  "formationProcess": "Step-by-step paragraph describing the full fossilization journey of this specific specimen — from organism death to discovery",
  "animalDescription": "Rich 2-3 paragraph description of the living animal — what it looked like, how big it was, where it lived, and its place in the ecosystem",
  "animalBehavior": "How the animal behaved — was it predator or prey, solitary or social, how it reproduced, what made it unique",
  "animalSize": "Specific size details — length, height, weight compared to something familiar",
  "diet": "What it ate and how it hunted or foraged",
  "habitat": "Detailed description of the original environment and ecosystem",
  "geography": "Where these fossils are found globally today",
  "rarity": "One of: Common, Uncommon, Rare, Very Rare, Exceptional",
  "significance": "Why this fossil matters to science and what we have learned from it",
  "funFact": "One fascinating, surprising fact",
  "wikipediaSearchTerm": "Best Wikipedia search term to find an image of the LIVING animal (e.g. 'Tyrannosaurus rex' not 'T-rex fossil')"
}
If not a fossil, use best guesses based on what you see.`

export async function identifyFossil(imageBase64: string, mimeType: string) {
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageBase64 } },
        { type: 'text', text: FOSSIL_PROMPT },
      ],
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response')
  const parsed = JSON.parse(content.text.trim())
  const animalImageUrl = await getAnimalImage(parsed.wikipediaSearchTerm || parsed.name)
  return { ...parsed, animalImageUrl }
}

export const DEMO_FOSSIL = {
  name: 'Ammonite',
  scientificName: 'Ammonitida',
  period: 'Devonian to Cretaceous',
  age: '400-66 million years ago',
  description: 'Ammonites were cephalopod mollusks with coiled, chambered shells. They were among the most successful and diverse marine animals in Earth\'s history, surviving for over 300 million years before the mass extinction that ended the age of dinosaurs.',
  fossilType: 'Permineralized',
  fossilTypeExplanation: 'This ammonite is a permineralized fossil — meaning the original shell material was gradually replaced by minerals carried in groundwater. As the organism was buried in sediment, mineral-rich water seeped into the pores and hollow spaces of the shell. Over millions of years, minerals like silica, calcite, or pyrite crystallized inside, turning the once-living shell into solid rock while preserving its intricate shape and structure in extraordinary detail.',
  formationProcess: 'When this ammonite died approximately 100 million years ago, it sank to the seafloor of a shallow tropical sea. The soft body quickly decomposed, but the hard shell was buried under layers of fine sediment — mud and silt that would eventually become limestone. As more sediment accumulated above, pressure built up and the sediment lithified into rock. Mineral-rich groundwater slowly percolated through the shell, replacing calcium carbonate molecule by molecule with more stable minerals. After tens of millions of years of geological uplift and erosion, the rock containing the fossil was exposed at the surface, where a fossil hunter eventually discovered it.',
  animalDescription: 'The living ammonite was a free-swimming predator that resembled a nautilus with a coiled shell. Its shell was divided into sealed gas-filled chambers that it used for buoyancy — by adjusting the gas levels, it could rise and sink through the water column. The animal itself lived in the outermost, largest chamber. It had a ring of tentacles around its mouth, large eyes for hunting in the depths, and a sharp beak for seizing prey. Ammonites ranged from the size of a coin to larger than a tractor wheel, with some species reaching over 2 metres in diameter.',
  animalBehavior: 'Ammonites were active hunters that likely migrated vertically in the water column — ascending at night to feed in shallower waters rich with plankton and small fish, then descending to deeper, safer depths during the day. They were probably solitary hunters but gathered in large groups during breeding season. Their rapid evolution and widespread distribution made them one of the most diverse animal groups that ever lived, with thousands of species adapting to every ocean on Earth.',
  animalSize: '1 cm to over 2 metres in diameter. Most common species were 10-30 cm — about the size of a dinner plate. The largest known species, Parapuzosia seppenradensis, reached 2.55 metres across — larger than a car tyre.',
  diet: 'Carnivorous — plankton, small fish, crustaceans, and other invertebrates seized with tentacles',
  habitat: 'Open marine environments ranging from warm shallow tropical seas to deeper ocean waters',
  geography: 'Found on every continent including Antarctica. Major fossil sites in England (Jurassic Coast), Morocco, Madagascar, Germany, and North America',
  rarity: 'Common' as const,
  significance: 'Ammonites are the most important index fossils in geology. Their rapid evolution means each species existed for only a short geological window, allowing scientists to precisely date rock layers worldwide. They have revolutionized our understanding of ancient ocean environments and mass extinction events.',
  funFact: 'In medieval Europe, ammonite fossils were called "snakestones" and sold as religious relics — people believed they were coiled snakes turned to stone by saints. Some entrepreneurial monks even carved snake heads onto them to make them more convincing.',
  animalImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ammonite_section_Solnhofen.JPG/320px-Ammonite_section_Solnhofen.JPG',
}
