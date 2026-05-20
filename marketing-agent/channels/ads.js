'use strict';

const { saveFile } = require('../output');

async function createGoogleAd({ headlines, descriptions, keywords, final_url }) {
  const content = buildAdContent(headlines, descriptions, keywords, final_url);
  const savedFile = saveFile('google-ads.txt', content);
  return `Google Ads copy saved: ${savedFile}`;
}

function buildAdContent(headlines, descriptions, keywords, finalUrl) {
  const lines = [
    '═══════════════════════════════════════',
    'GOOGLE RESPONSIVE SEARCH AD',
    '═══════════════════════════════════════',
    '',
    'HEADLINES (max 30 chars each):',
  ];

  headlines.forEach((h, i) => {
    const warning = h.length > 30 ? ` ⚠️  (${h.length} chars — exceeds 30)` : ` (${h.length} chars)`;
    lines.push(`  ${i + 1}. ${h}${warning}`);
  });

  lines.push('', 'DESCRIPTIONS (max 90 chars each):');
  descriptions.forEach((d, i) => {
    const warning = d.length > 90 ? ` ⚠️  (${d.length} chars — exceeds 90)` : ` (${d.length} chars)`;
    lines.push(`  ${i + 1}. ${d}${warning}`);
  });

  if (keywords && keywords.length > 0) {
    lines.push('', 'TARGET KEYWORDS:');
    keywords.forEach((k) => lines.push(`  • ${k}`));
  }

  if (finalUrl) {
    lines.push('', `FINAL URL: ${finalUrl}`);
  }

  lines.push('', '═══════════════════════════════════════');
  return lines.join('\n');
}

module.exports = { createGoogleAd };
