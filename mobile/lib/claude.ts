import * as FileSystem from 'expo-file-system'

const DEMO_FOSSIL = {
  name: 'Ammonite',
  scientificName: 'Ammonitida',
  period: 'Devonian to Cretaceous',
  age: '400–66 million years ago',
  description: "Ammonites were cephalopod mollusks related to modern nautiluses and squids. They had coiled external shells divided into chambers and were one of the most successful marine animals in Earth's history.",
  formationProcess: "When an ammonite died, it sank to the seafloor where sediment gradually covered the shell. Over millions of years, minerals percolated through the shell, replacing the original calcium carbonate with harder minerals like silica or pyrite. The surrounding sediment compacted into rock, preserving the shell's intricate spiral structure in stunning three-dimensional detail.",
  habitat: 'Open marine environments, from shallow coastal waters to deep ocean basins',
  diet: 'Carnivorous — plankton, small fish, and invertebrates',
  size: 'Ranged from 1 cm to over 2 metres in diameter',
  geography: 'Found on every continent including Antarctica. Major sites in England, Morocco, Madagascar, and North America',
  rarity: 'Common' as const,
  significance: 'Ammonites are index fossils used to date rock layers globally. Their rapid evolution and widespread distribution make them invaluable for geological dating.',
  funFact: 'Some ammonites grew larger than a car tyre, and in medieval Europe their coiled fossils were called "snakestones" — thought to be petrified serpents.',
}

export async function identifyFossil(imageUri: string): Promise<typeof DEMO_FOSSIL> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY

  if (!apiKey) {
    await new Promise(r => setTimeout(r, 2000))
    return DEMO_FOSSIL
  }

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: `You are an expert paleontologist. Analyze this fossil image and return ONLY a valid JSON object with these exact fields (no markdown):
{
  "name": "Common name",
  "scientificName": "Scientific name",
  "period": "Geological period",
  "age": "Age range",
  "description": "2-3 sentence description",
  "formationProcess": "Detailed paragraph on fossilization process",
  "habitat": "Original habitat",
  "diet": "Diet or N/A",
  "size": "Typical size",
  "geography": "Where fossils are found",
  "rarity": "Common|Uncommon|Rare|Very Rare|Exceptional",
  "significance": "Scientific importance",
  "funFact": "One surprising fact"
}`,
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  return JSON.parse(data.content[0].text)
}
