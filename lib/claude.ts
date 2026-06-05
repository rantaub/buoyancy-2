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

const DEMO_FOSSILS = [
  {
    name: 'Ammonite',
    scientificName: 'Ammonitida',
    period: 'Devonian to Cretaceous',
    age: '400–66 million years ago',
    description: 'Ammonites were cephalopod mollusks with coiled, chambered shells. They were among the most successful and diverse marine animals in Earth\'s history, surviving for over 300 million years before the mass extinction that ended the age of dinosaurs.',
    fossilType: 'Permineralized',
    fossilTypeExplanation: 'This ammonite is a permineralized fossil — the original shell material was gradually replaced by minerals carried in groundwater. Over millions of years, minerals like silica, calcite, or pyrite crystallized inside the shell, turning it into solid rock while preserving its intricate spiral structure in extraordinary detail.',
    formationProcess: 'When this ammonite died roughly 100 million years ago it sank to the seafloor. The soft body decayed, but the hard shell was buried under fine sediment that slowly compressed into limestone. Mineral-rich groundwater then percolated through the shell, replacing calcium carbonate molecule by molecule. Geological uplift eventually brought the rock near the surface, where erosion exposed the fossil.',
    animalDescription: 'The living ammonite resembled a nautilus with a coiled shell divided into sealed buoyancy chambers. The animal itself occupied the outermost chamber, using tentacles to capture prey and a sharp beak to consume it. Species ranged from coin-sized to over 2 metres across.',
    animalBehavior: 'Ammonites were vertical migrators — rising at night to feed in shallower, plankton-rich waters and descending to safer depths by day. Thousands of species evolved rapidly, making them invaluable "index fossils" for dating rock layers.',
    animalSize: '1 cm to over 2 metres in diameter. Most species were 10–30 cm — roughly dinner-plate sized.',
    diet: 'Carnivorous — plankton, small fish, and crustaceans',
    habitat: 'Open marine environments from shallow tropical seas to deeper ocean basins',
    geography: 'Found on every continent. Major sites in England, Morocco, Madagascar, Germany, and North America',
    rarity: 'Common' as const,
    significance: 'Ammonites are the world\'s most important index fossils, allowing geologists to date rock layers on every continent with precision.',
    funFact: 'In medieval Europe ammonite fossils were called "snakestones" — people believed they were coiled serpents petrified by saints, and monks sometimes carved snake heads onto them to sell as relics.',
    animalImageUrl: '',
  },
  {
    name: 'Trilobite',
    scientificName: 'Trilobita',
    period: 'Cambrian to Permian',
    age: '521–252 million years ago',
    description: 'Trilobites were among the earliest complex animals on Earth — armoured arthropods that dominated the Palaeozoic seas for nearly 270 million years before being wiped out in the Great Dying, the largest mass extinction in history.',
    fossilType: 'Mold',
    fossilTypeExplanation: 'Most trilobite fossils are moulds — the hard exoskeleton dissolved away long ago, leaving a perfect impression in the surrounding rock. When you see a trilobite fossil, you are looking at the negative space where the animal once was, like a stamp pressed into clay.',
    formationProcess: 'The trilobite moulted its exoskeleton repeatedly throughout life, and these shed shells are what most often fossilised. After death, the animal settled into fine seafloor mud. The mud slowly lithified around the shell; later, acidic groundwater dissolved the calcite shell, leaving only the impression behind.',
    animalDescription: 'Trilobites had three body lobes (hence the name) running head to tail: the central axial lobe flanked by two pleural lobes. Their eyes were among the first complex eyes ever evolved — compound eyes made of calcite lenses that could see in nearly every direction simultaneously.',
    animalBehavior: 'Different species filled every ecological niche: hunters, scavengers, filter feeders, and even parasites. Some could roll into a defensive ball like a woodlouse. Many species migrated in huge swarms, as evidenced by mass fossil beds.',
    animalSize: '1 mm to 72 cm. The giant Isotelus rex reached 72 cm — the largest trilobite known.',
    diet: 'Varied by species: plankton, detritus, worms, or other invertebrates',
    habitat: 'Shallow to deep marine environments on continental shelves worldwide',
    geography: 'Every continent, with exceptional specimens from Morocco, Utah (USA), Bohemia, and Ontario',
    rarity: 'Common' as const,
    significance: 'Trilobites are essential tools for dating Palaeozoic rocks and tracking ancient ocean currents through their global distribution patterns.',
    funFact: 'Trilobite eyes were made of calcite — the same mineral as limestone. They were the first animals to have mineralized eyes, giving them crystal-clear vision 500 million years ago.',
    animalImageUrl: '',
  },
  {
    name: 'Megalodon Tooth',
    scientificName: 'Otodus megalodon',
    period: 'Miocene to Pliocene',
    age: '23–3.6 million years ago',
    description: 'A tooth from Otodus megalodon — a shark so large it makes the great white shark look modest. Megalodon is the largest predatory fish that ever lived, reaching estimated lengths of 15–20 metres and capable of biting a whale in half.',
    fossilType: 'Replacement',
    fossilTypeExplanation: 'Shark teeth are already composed of dense hydroxyapatite mineral — essentially pre-fossilised. When a Megalodon tooth was buried in sediment, additional minerals gradually replaced and reinforced the enamel over millions of years, resulting in a tooth that is heavier and harder than the original but identical in shape.',
    formationProcess: 'Megalodon shed thousands of teeth throughout its lifetime. Lost teeth sank to the seafloor and were quickly buried in sediment. The dense enamel resisted decay, and groundwater minerals gradually infiltrated the dentine beneath, turning the tooth black, grey, or dark brown as iron and manganese compounds replaced organic material.',
    animalDescription: 'Megalodon was a apex predator of ancient oceans — a true leviathan. Based on tooth size and comparisons with living sharks, scientists estimate it reached 15–20 metres in length and weighed 50–100 tonnes. Its jaws could open nearly 2 metres wide and deliver a bite force of roughly 108,000 newtons — enough to crush a whale skull.',
    animalBehavior: 'Evidence from fossil whale bones shows Megalodon preferentially targeted the ribcage and fins of large whales — disabling them before consuming them. It likely ambushed prey from below in the deep ocean, a behaviour seen in great white sharks today.',
    animalSize: '15–20 metres long, weighing an estimated 50–100 tonnes. Teeth up to 18 cm tall.',
    diet: 'Large marine mammals — whales, dolphins, sea turtles, and giant seals',
    habitat: 'Warm coastal and open ocean waters worldwide, preferring tropical to temperate zones',
    geography: 'Teeth found on every continent except Antarctica — famous sites in North Carolina (USA), South Carolina, Morocco, and Australia',
    rarity: 'Uncommon' as const,
    significance: 'Megalodon teeth have revolutionised our understanding of ancient marine food webs and the evolution of large body size in sharks.',
    funFact: 'A single Megalodon tooth can be larger than a human hand. Sailors once believed giant triangular shark teeth found on cliff faces were "tongue stones" — petrified dragon tongues — until naturalists identified them correctly in the 17th century.',
    animalImageUrl: '',
  },
  {
    name: 'Fern Imprint',
    scientificName: 'Pecopteris sp.',
    period: 'Carboniferous',
    age: '359–299 million years ago',
    description: 'A carbon-film fossil of a Carboniferous fern, preserved as a dark silhouette in fine-grained shale. The vast forests of tree-like ferns and clubmosses from this period formed the coal seams that powered the Industrial Revolution.',
    fossilType: 'Carbon Film',
    fossilTypeExplanation: 'This is a carbon film fossil — the most delicate form of preservation. As the fern frond was compressed between layers of fine mud, pressure and heat drove off oxygen, hydrogen, and nitrogen. What remained was a thin film of pure carbon tracing the plant\'s exact shape, like a photographic negative printed in ancient rock.',
    formationProcess: 'The fern frond fell into a swampy lagoon and sank into oxygen-poor mud — an environment where decay was extremely slow. Burial under more sediment increased pressure and temperature, squeezing out the volatile compounds in the plant tissue. Over millions of years only the carbon skeleton remained, perfectly capturing every vein and leaflet in microscopic detail.',
    animalDescription: 'Pecopteris was not an animal but a tree fern — part of the vast "Coal Forests" that covered equatorial regions during the Carboniferous. These forests were humid, dense jungles where ferns grew up to 30 metres tall. They produced the oxygen-rich atmosphere (35% oxygen vs. today\'s 21%) that allowed giant insects to evolve.',
    animalBehavior: 'As a plant, Pecopteris reproduced by releasing spores from structures on the undersides of its fronds. It grew rapidly in the warm, humid swamp environment, competing for light in dense forest canopies.',
    animalSize: 'Individual fronds up to 1 metre long on tree ferns reaching 15–30 metres in height',
    diet: 'Photosynthetic — absorbed sunlight, water, and CO₂',
    habitat: 'Tropical coal swamps — dense, humid forests similar to modern rainforests',
    geography: 'Coal-bearing rocks on every continent. Exceptional specimens from Yorkshire (UK), the Ruhr (Germany), and Pennsylvania (USA)',
    rarity: 'Common' as const,
    significance: 'Carboniferous plant fossils explain the origin of coal and reveal why Earth\'s atmosphere was dramatically more oxygen-rich 300 million years ago — a fact with profound consequences for the evolution of giant insects.',
    funFact: 'Every piece of coal you burn was once a Carboniferous forest. The carbon locked inside has been underground for 300 million years — releasing it in decades is one of the fastest geological changes in Earth\'s history.',
    animalImageUrl: '',
  },
]

export function getRandomDemoFossil() {
  return DEMO_FOSSILS[Math.floor(Math.random() * DEMO_FOSSILS.length)]
}

export const DEMO_FOSSIL = DEMO_FOSSILS[0]
