'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function post({ content, embed_title, embed_description, embed_color = 5814783, embed_fields = [] }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const payload = buildPayload(content, embed_title, embed_description, embed_color, embed_fields);
  const savedFile = saveFile('discord.json', JSON.stringify(payload, null, 2));

  if (webhookUrl) {
    try {
      await webhookPost(webhookUrl, payload);
      return `Discord message sent. File saved: ${savedFile}`;
    } catch (err) {
      return `Discord error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] Discord content saved: ${savedFile}\n  Set DISCORD_WEBHOOK_URL to auto-post.`;
}

function buildPayload(content, title, description, color, fields) {
  const payload = { content };
  if (title || description) {
    payload.embeds = [
      {
        title,
        description,
        color,
        fields: fields.map((f) => ({ name: f.name, value: f.value, inline: !!f.inline })),
        footer: { text: 'Marketing Announcement' },
        timestamp: new Date().toISOString(),
      },
    ];
  }
  return payload;
}

function webhookPost(urlStr, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
          else reject(new Error(`${res.statusCode}: ${raw}`));
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { post };
