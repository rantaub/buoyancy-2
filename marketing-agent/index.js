#!/usr/bin/env node
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const readline = require('readline');
const path = require('path');
const { runMarketingCampaign } = require('./agent');
const { setCampaignName } = require('./output');

const BANNER = `
╔══════════════════════════════════════════════════════════╗
║          🎯 MARKETING AUTOMATION AGENT                   ║
║   Powered by Claude Opus 4.7 — Omnichannel Campaigns    ║
╚══════════════════════════════════════════════════════════╝

Channels: Email · Twitter/X · LinkedIn · Facebook · Instagram
          Discord · Slack · Blog · SMS · Google Ads · YouTube
`;

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log(BANNER);

  // Product info can come from CLI args or interactive prompt
  let productInfo = process.argv.slice(2).join(' ').trim();

  if (!productInfo) {
    console.log('Describe the product or service you want to market.');
    console.log('Include: name, what it does, target audience, key features, and any campaign goals.\n');
    productInfo = await prompt('Product description:\n> ');
  }

  if (!productInfo) {
    console.error('Error: No product description provided.');
    process.exit(1);
  }

  // Extract a short campaign name from the first sentence
  const firstSentence = productInfo.split(/[.\n]/)[0].substring(0, 60);
  setCampaignName(firstSentence);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\nError: ANTHROPIC_API_KEY environment variable is not set.');
    console.error('Add it to your .env file or export it in your shell.\n');
    process.exit(1);
  }

  await runMarketingCampaign(productInfo);
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
