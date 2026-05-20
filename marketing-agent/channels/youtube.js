'use strict';

const { saveFile } = require('../output');

async function create({ video_title, description, chapters = [], hashtags = [], links = {} }) {
  const content = buildDescription(video_title, description, chapters, hashtags, links);
  const savedFile = saveFile('youtube.txt', content);
  return `YouTube description saved: ${savedFile}`;
}

function buildDescription(title, description, chapters, hashtags, links) {
  const lines = [
    `VIDEO TITLE: ${title}`,
    '',
    '─────────────────────────────────────',
    'DESCRIPTION:',
    '─────────────────────────────────────',
    description,
  ];

  if (chapters.length > 0) {
    lines.push('', '─────────────────────────────────────');
    lines.push('CHAPTERS:');
    lines.push('─────────────────────────────────────');
    chapters.forEach((c) => lines.push(`${c.time} ${c.title}`));
  }

  const linkEntries = Object.entries(links);
  if (linkEntries.length > 0) {
    lines.push('', '─────────────────────────────────────');
    lines.push('LINKS:');
    lines.push('─────────────────────────────────────');
    linkEntries.forEach(([label, url]) => lines.push(`${label}: ${url}`));
  }

  if (hashtags.length > 0) {
    lines.push('');
    lines.push(hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
  }

  return lines.join('\n');
}

module.exports = { create };
