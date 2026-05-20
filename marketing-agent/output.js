'use strict';

const fs = require('fs');
const path = require('path');

let campaignDir = null;

function setCampaignName(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  const timestamp = new Date().toISOString().slice(0, 10);
  campaignDir = path.join(process.cwd(), 'marketing-outputs', `${slug}-${timestamp}`);
  fs.mkdirSync(campaignDir, { recursive: true });
  return campaignDir;
}

function saveFile(filename, content) {
  if (!campaignDir) setCampaignName('campaign');
  const filepath = path.join(campaignDir, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

function getCampaignDir() {
  if (!campaignDir) setCampaignName('campaign');
  return campaignDir;
}

module.exports = { setCampaignName, saveFile, getCampaignDir };
