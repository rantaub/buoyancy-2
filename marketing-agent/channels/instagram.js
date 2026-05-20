'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function post({ caption, hashtags = [], image_prompt = '' }) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const imageUrl = process.env.INSTAGRAM_DEFAULT_IMAGE_URL; // must be public URL

  const fullCaption = buildCaption(caption, hashtags);
  const content = `CAPTION:\n${fullCaption}\n\nIMAGE CONCEPT:\n${image_prompt}`;
  const savedFile = saveFile('instagram.txt', content);

  if (accessToken && igUserId && imageUrl) {
    try {
      // Step 1: Create media container
      const container = await graphPost(
        `/${igUserId}/media`,
        { image_url: imageUrl, caption: fullCaption, access_token: accessToken }
      );
      if (!container.id) throw new Error('No container ID returned');

      // Step 2: Publish
      await graphPost(
        `/${igUserId}/media_publish`,
        { creation_id: container.id, access_token: accessToken }
      );
      return `Instagram post published. File saved: ${savedFile}`;
    } catch (err) {
      return `Instagram error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] Instagram content saved: ${savedFile}\n  Set INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID + INSTAGRAM_DEFAULT_IMAGE_URL to auto-post.`;
}

function graphPost(path, params) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const host = 'graph.facebook.com';
    const fullPath = `/v18.0${path}`;
    const data = query;
    const req = https.request(
      {
        hostname: host,
        path: fullPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json.error) reject(new Error(json.error.message));
            else resolve(json);
          } catch {
            reject(new Error(raw));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function buildCaption(caption, hashtags) {
  const tags = hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
  return tags ? `${caption}\n\n${tags}` : caption;
}

module.exports = { post };
