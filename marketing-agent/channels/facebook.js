'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function post({ message, link }) {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  const savedFile = saveFile('facebook.txt', link ? `${message}\n\nLink: ${link}` : message);

  if (pageToken && pageId) {
    const params = new URLSearchParams({ message, access_token: pageToken });
    if (link) params.append('link', link);
    const urlStr = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    try {
      const res = await httpsPost(urlStr, Object.fromEntries(params), {
        'Content-Type': 'application/x-www-form-urlencoded',
      }, true);
      return `Facebook post published (id: ${res.id || 'ok'}). File saved: ${savedFile}`;
    } catch (err) {
      return `Facebook error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] Facebook content saved: ${savedFile}\n  Set FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID to auto-post.`;
}

function httpsPost(urlStr, body, extraHeaders = {}, formEncoded = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = formEncoded
      ? new URLSearchParams(body).toString()
      : JSON.stringify(body);
    const contentType = formEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json';

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(data),
          ...extraHeaders,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
            else reject(new Error(parsed.error ? parsed.error.message : raw));
          } catch {
            if (res.statusCode >= 200 && res.statusCode < 300) resolve({});
            else reject(new Error(raw));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { post };
