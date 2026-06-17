import { test, expect, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// ── Helpers ────────────────────────────────────────────────────────────────

function createTestImage(): string {
  const imgPath = path.join('/tmp', 'test-fossil.jpg')
  const jpegBytes = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
    'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
    'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
    'MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA' +
    'AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA' +
    '/9oADAMBAAIRAxEAPwCwABmX/9k=',
    'base64'
  )
  fs.writeFileSync(imgPath, jpegBytes)
  return imgPath
}

const TEST_IMAGE = createTestImage()

const DEMO_FOSSIL = {
  id: 'test-fossil-id-123',
  name: 'Ammonite',
  scientificName: 'Ammonitida',
  period: 'Devonian to Cretaceous',
  age: '400-66 million years ago',
  description: 'Ammonites were cephalopod mollusks related to modern nautiluses.',
  formationProcess: 'When an ammonite died, it sank to the seafloor where sediment gradually covered the shell.',
  habitat: 'Open marine environments',
  diet: 'Carnivorous',
  size: '1cm to 2 meters',
  geography: 'Found on every continent',
  rarity: 'Common',
  significance: 'Ammonites are index fossils used to date rock layers globally.',
  funFact: 'Some ammonites grew larger than a car tire.',
  imageUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  savedAt: Date.now(),
}

/** Seed sessionStorage with a fossil and navigate to its detail page */
async function goToFossilDetail(page: Page) {
  await page.goto('/')
  await page.evaluate((fossil) => {
    sessionStorage.setItem(`fossil_${fossil.id}`, JSON.stringify(fossil))
  }, DEMO_FOSSIL)
  await page.goto(`/fossil/${DEMO_FOSSIL.id}`)
  await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
}

/** Seed localStorage with N fake fossils */
async function seedFossils(page: Page, count: number, premium = false) {
  await page.goto('/findings')
  const fossils = Array.from({ length: count }, (_, i) => ({
    ...DEMO_FOSSIL,
    id: `fake-${i}`,
    name: `Test Fossil ${i}`,
    savedAt: Date.now() - i * 1000,
  }))
  await page.evaluate(({ fossils, premium }) => {
    localStorage.setItem('fossil_findings', JSON.stringify(fossils))
    if (premium) localStorage.setItem('fossil_premium', 'true')
    else localStorage.removeItem('fossil_premium')
  }, { fossils, premium })
  await page.reload()
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────
test.describe('Home Page', () => {
  test('loads with correct title and hero text', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/FossilLens/)
    await expect(page.locator('h1')).toContainText('Discover Ancient')
    await expect(page.locator('text=Life in Stone')).toBeVisible()
  })

  test('shows upload zone with camera and upload buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Take or upload a fossil photo')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Take Photo' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Upload Image' })).toBeVisible()
  })

  test('shows 4 feature cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=AI Identification')).toBeVisible()
    await expect(page.locator('text=Rich History')).toBeVisible()
    await expect(page.locator('text=Share Findings')).toBeVisible()
    await expect(page.locator('text=Premium Collection')).toBeVisible()
  })

  test('View Plans CTA navigates to subscribe', async ({ page }) => {
    await page.goto('/')
    await page.locator('a', { hasText: 'View Plans' }).click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('drag-over shows drop text', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('[data-testid="upload-zone"]')
    await expect(zone).toBeVisible()
    // Dispatch without init to avoid DragEvent dataTransfer serialization error
    await zone.dispatchEvent('dragover')
    await expect(page.locator('text=Drop your fossil photo here')).toBeVisible({ timeout: 3000 })
  })

  test('file input accepts image and shows analyzing state', async ({ page }) => {
    await page.goto('/')
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').evaluate((el: HTMLInputElement) => el.click()),
    ])
    await fileChooser.setFiles(TEST_IMAGE)
    await expect(page.locator('text=Analyzing your fossil...')).toBeVisible({ timeout: 5000 })
  })

  test('full identification flow redirects to fossil page', async ({ page }) => {
    await page.goto('/')
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').evaluate((el: HTMLInputElement) => el.click()),
    ])
    await fileChooser.setFiles(TEST_IMAGE)
    await page.waitForURL(/\/fossil\//, { timeout: 15000 })
    await expect(page.url()).toMatch(/\/fossil\/[a-f0-9-]+/)
  })
})

// ── NAVIGATION ─────────────────────────────────────────────────────────────
test.describe('Navigation', () => {
  test('desktop nav shows FossilLens brand', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav').first().locator('text=FossilLens')).toBeVisible()
  })

  test('Findings nav link navigates correctly', async ({ page }) => {
    await page.goto('/')
    await page.locator('nav').first().locator('a', { hasText: 'Findings' }).click()
    await expect(page).toHaveURL('/findings')
  })

  test('Premium nav link navigates correctly', async ({ page }) => {
    await page.goto('/')
    await page.locator('nav').first().locator('a', { hasText: 'Premium' }).click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('Identify nav link navigates back to home', async ({ page }) => {
    await page.goto('/findings')
    await page.locator('nav').first().locator('a', { hasText: 'Identify' }).click()
    await expect(page).toHaveURL('/')
  })
})

// ── FOSSIL DETAIL PAGE ─────────────────────────────────────────────────────
test.describe('Fossil Detail Page', () => {
  test('shows fossil name, scientific name and rarity badge', async ({ page }) => {
    await goToFossilDetail(page)
    await expect(page.locator('h1')).toContainText('Ammonite')
    await expect(page.locator('p.italic')).toContainText('Ammonitida')
    await expect(page.locator('text=Common')).toBeVisible()
  })

  test('shows all stat cards (Period, Age, Size, Diet)', async ({ page }) => {
    await goToFossilDetail(page)
    await expect(page.locator('text=Period')).toBeVisible()
    await expect(page.locator('text=Age')).toBeVisible()
    await expect(page.locator('text=Size')).toBeVisible()
    await expect(page.locator('text=Diet')).toBeVisible()
  })

  test('shows all 5 info sections', async ({ page }) => {
    await goToFossilDetail(page)
    await expect(page.locator('text=Formation Process')).toBeVisible()
    await expect(page.locator('text=Original Habitat')).toBeVisible()
    await expect(page.locator('text=Global Distribution')).toBeVisible()
    await expect(page.locator('text=Scientific Significance')).toBeVisible()
    await expect(page.locator('text=Did You Know?')).toBeVisible()
  })

  test('save button saves fossil and shows confirmation', async ({ page }) => {
    await goToFossilDetail(page)
    const saveBtn = page.locator('button', { hasText: 'Save Finding' })
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
    await expect(page.locator('text=Saved to findings!')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Saved!' })).toBeVisible()
  })

  test('saved fossil appears in localStorage after saving', async ({ page }) => {
    await goToFossilDetail(page)
    await page.locator('button', { hasText: 'Save Finding' }).click()
    await expect(page.locator('text=Saved to findings!')).toBeVisible()
    const saved = await page.evaluate(() => {
      const data = localStorage.getItem('fossil_findings')
      return data ? JSON.parse(data) : []
    })
    expect(saved.length).toBeGreaterThan(0)
    expect(saved[0].name).toBe('Ammonite')
  })

  test('header bookmark button toggles save/unsave', async ({ page }) => {
    await goToFossilDetail(page)
    // Save via bottom button
    await page.locator('button', { hasText: 'Save Finding' }).click()
    await expect(page.locator('text=Saved to findings!')).toBeVisible()
    // Unsave via header bookmark
    await page.locator('button[aria-label="Save fossil"]').click()
    await expect(page.locator('text=Removed from findings')).toBeVisible({ timeout: 3000 })
  })

  test('share button opens share modal', async ({ page }) => {
    await goToFossilDetail(page)
    await page.locator('button[aria-label="Share fossil"]').click()
    await expect(page.locator('text=Share Discovery')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=Copy Link')).toBeVisible()
    await expect(page.locator('text=Twitter')).toBeVisible()
    await expect(page.locator('text=Email')).toBeVisible()
  })

  test('share modal closes when clicking X', async ({ page }) => {
    await goToFossilDetail(page)
    await page.locator('button[aria-label="Share fossil"]').click()
    await expect(page.locator('text=Share Discovery')).toBeVisible({ timeout: 3000 })
    await page.locator('button[aria-label="Close"]').click()
    await expect(page.locator('text=Share Discovery')).not.toBeVisible({ timeout: 3000 })
  })

  test('copy link button changes to Copied!', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await goToFossilDetail(page)
    await page.locator('button[aria-label="Share fossil"]').click()
    await expect(page.locator('text=Share Discovery')).toBeVisible()
    await page.locator('button', { hasText: 'Copy Link' }).click()
    await expect(page.locator('text=Copied!')).toBeVisible()
  })

  test('back arrow navigates back', async ({ page }) => {
    await goToFossilDetail(page)
    await page.locator('button[aria-label="Go back"]').click()
    await expect(page).not.toHaveURL(`/fossil/${DEMO_FOSSIL.id}`)
  })

  test('bottom save CTA shows Add to Your Collection', async ({ page }) => {
    await goToFossilDetail(page)
    // Scroll to bottom to reveal Framer Motion whileInView elements
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('text=Add to Your Collection')).toBeVisible({ timeout: 5000 })
  })
})

// ── FINDINGS PAGE ──────────────────────────────────────────────────────────
test.describe('Findings Page', () => {
  test('shows empty state when no fossils saved', async ({ page }) => {
    await page.goto('/findings')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.locator('text=No findings yet')).toBeVisible()
    await expect(page.locator('a', { hasText: 'Identify a Fossil' })).toBeVisible()
  })

  test('Identify a Fossil link goes to home', async ({ page }) => {
    await page.goto('/findings')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.locator('a', { hasText: 'Identify a Fossil' }).click()
    await expect(page).toHaveURL('/')
  })

  test('Premium link in header navigates to subscribe', async ({ page }) => {
    await page.goto('/findings')
    await page.locator('a', { hasText: 'Premium' }).last().click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('saved fossils appear as cards', async ({ page }) => {
    await seedFossils(page, 2)
    const cards = page.locator('[class*="fossil-card"]')
    await expect(cards.first()).toBeVisible()
    await expect(page.locator('text=Test Fossil 0')).toBeVisible()
  })

  test('shows correct fossil count in header', async ({ page }) => {
    await seedFossils(page, 3)
    await expect(page.locator('text=3 fossils discovered')).toBeVisible()
  })

  test('fossil card click opens detail page', async ({ page }) => {
    await seedFossils(page, 1)
    const card = page.locator('[class*="fossil-card"]').first()
    await card.click()
    await expect(page).toHaveURL(/\/fossil\//)
  })

  test('delete button removes fossil from list', async ({ page }) => {
    await seedFossils(page, 2)
    // Hover over first card to reveal delete button
    const card = page.locator('[class*="fossil-card"]').first()
    await card.hover()
    await card.locator('button').click()
    await expect(page.locator('text=1 fossil discovered')).toBeVisible({ timeout: 3000 })
  })

  test('free tier shows lock message after 3 fossils', async ({ page }) => {
    await seedFossils(page, 4, false)
    await expect(page.locator('text=/more finding/')).toBeVisible()
    await expect(page.locator('a', { hasText: 'Unlock Premium' })).toBeVisible()
  })

  test('Unlock Premium button navigates to subscribe', async ({ page }) => {
    await seedFossils(page, 4, false)
    await page.locator('a', { hasText: 'Unlock Premium' }).click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('premium user sees all fossils without lock', async ({ page }) => {
    await seedFossils(page, 5, true)
    await expect(page.locator('text=Unlock Premium')).not.toBeVisible()
    await expect(page.locator('text=5 fossils discovered')).toBeVisible()
  })
})

// ── SUBSCRIBE PAGE ─────────────────────────────────────────────────────────
test.describe('Subscribe Page', () => {
  test('shows both Explorer and Paleontologist plans', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Explorer')).toBeVisible()
    await expect(page.locator('text=Paleontologist')).toBeVisible()
    await expect(page.locator('text=Most Popular')).toBeVisible()
  })

  test('monthly/annual toggle switches price', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=$8')).toBeVisible()
    await page.locator('button', { hasText: 'Annual' }).click()
    await expect(page.locator('text=$5')).toBeVisible()
    await expect(page.locator('text=$8')).not.toBeVisible()
    await page.locator('button', { hasText: 'Monthly' }).click()
    await expect(page.locator('text=$8')).toBeVisible()
  })

  test('shows Save 37% badge on annual', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Save 37%')).toBeVisible()
  })

  test('Continue Free goes to findings', async ({ page }) => {
    await page.goto('/subscribe')
    await page.locator('button', { hasText: 'Continue Free' }).click()
    await expect(page).toHaveURL('/findings')
  })

  test('Get Premium activates and redirects to findings', async ({ page }) => {
    await page.goto('/subscribe')
    await page.evaluate(() => localStorage.removeItem('fossil_premium'))
    await page.locator('button', { hasText: 'Get Premium' }).click()
    await expect(page.locator('text=Activating...')).toBeVisible()
    await page.waitForURL('/findings', { timeout: 5000 })
    const premium = await page.evaluate(() => localStorage.getItem('fossil_premium'))
    expect(premium).toBe('true')
  })

  test('shows 4 benefit cards', async ({ page }) => {
    await page.goto('/subscribe')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('text=Unlimited Everything')).toBeVisible()
    await expect(page.locator('text=Expert Reports')).toBeVisible()
    // Use exact heading to avoid matching "Community feed" in plan features
    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible()
    await expect(page.locator('text=Offline Mode')).toBeVisible()
  })

  test('premium plan shows all feature items', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Unlimited identifications')).toBeVisible()
    await expect(page.locator('text=Unlimited findings saved')).toBeVisible()
    await expect(page.locator('text=Priority AI processing')).toBeVisible()
    // Offline access appears in both plans; check the non-strikethrough (premium) version
    await expect(page.locator('span.text-stone-300', { hasText: 'Offline access' })).toBeVisible()
  })

  test('free plan shows locked features with strikethrough', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Unlimited saves').first()).toBeVisible()
  })
})
