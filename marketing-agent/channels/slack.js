'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function post({ text, blocks }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const payload = blocks ? { text, blocks } : { text };
  const savedFile = saveFile('slack.json', JSON.stringify(payload, null, 2));

  if (webhookUrl) {
    try {
      await webhookPost(webhookUrl, payload);
      return `Slack message sent. File saved: ${savedFile}`;
    } catch (err) {
      return `Slack error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] Slack content saved: ${savedFile}\n  Set SLACK_WEBHOOK_URL to auto-post.`;
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
