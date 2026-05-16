import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const FOSSIL_PROMPT = `You are an expert paleontologist. Analyze this fossil image and provide detailed information.

Return ONLY a valid JSON object with exactly these fields (no markdown, no extra text):
{
  "name": "Common name of the fossil",
  "scientificName": "Scientific/Latin name",
  "period": "Geological period (e.g. Jurassic, Cretaceous, Cambrian)",
  "age": "Approximate age range (e.g. '150-145 million years ago')",
  "description": "2-3 sentence description of the fossil and organism",
  "formationProcess": "Detailed paragraph explaining how this fossil formed - the fossilization process specific to this type of organism",
  "habitat": "Original habitat and environment where the organism lived",
  "diet": "What the organism ate (or 'N/A' for plants/invertebrates)",
  "size": "Typical size of the organism",
  "geography": "Where these fossils are typically found globally",
  "rarity": "One of: Common, Uncommon, Rare, Very Rare, or Exceptional",
  "significance": "Why this fossil is scientifically or historically important",
  "funFact": "One fascinating and surprising fact about this fossil or organism"
}

If the image does not show a fossil, set name to "Unknown Specimen" and provide best guesses for all fields based on what you can see.`

export async function identifyFossil(imageBase64: string, mimeType: string) {
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: FOSSIL_PROMPT,
          },
        ],
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const jsonStr = content.text.trim()
  return JSON.parse(jsonStr)
}

export const DEMO_FOSSIL = {
  name: 'Ammonite',
  scientificName: 'Ammonitida',
  period: 'Devonian to Cretaceous',
  age: '400-66 million years ago',
  description: 'Ammonites were cephalopod mollusks related to modern nautiluses and squids. They had coiled external shells divided into chambers and were one of the most successful marine animals in Earth\'s history.',
  formationProcess: 'When an ammonite died, it sank to the seafloor where sediment gradually covered the shell. Over millions of years, minerals percolated through the shell, replacing the original calcium carbonate with harder minerals like silica or pyrite. The surrounding sediment compacted into rock (lithification), preserving the shell\'s intricate spiral structure in stunning three-dimensional detail. This process of permineralization is why ammonites are among the most commonly found and well-preserved fossils worldwide.',
  habitat: 'Open marine environments, from shallow coastal waters to deep ocean basins',
  diet: 'Carnivorous - plankton, small fish, and invertebrates',
  size: 'Ranged from 1cm to over 2 meters in diameter',
  geography: 'Found on every continent, including Antarctica. Major sites in England, Morocco, Madagascar, and North America',
  rarity: 'Common' as const,
  significance: 'Ammonites are index fossils used to date rock layers globally. Their rapid evolution and widespread distribution make them invaluable for geological dating and understanding ancient marine ecosystems.',
  funFact: 'Some ammonites grew to be larger than a car tire, and in medieval Europe their coiled fossils were thought to be petrified coiled snakes, earning them the nickname "snakestones."',
}
