'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function post({ text, article_url }) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID; // urn:li:person:xxxxx

  const savedFile = saveFile('linkedin.txt', buildContent(text, article_url));

  if (accessToken && personId) {
    const shareContent = {
      shareCommentary: { text },
      shareMediaCategory: article_url ? 'ARTICLE' : 'NONE',
    };
    if (article_url) {
      shareContent.media = [{ status: 'READY', originalUrl: article_url }];
    }

    const payload = {
      author: personId,
      lifecycleState: 'PUBLISHED',
      specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    try {
      const res = await httpsPost(
        'https://api.linkedin.com/v2/ugcPosts',
        payload,
        { Authorization: `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' }
      );
      return `LinkedIn post published. File saved: ${savedFile}`;
    } catch (err) {
      return `LinkedIn error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] LinkedIn content saved: ${savedFile}\n  Set LINKEDIN_ACCESS_TOKEN + LINKEDIN_PERSON_ID to auto-post.`;
}

function httpsPost(urlStr, body, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
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

function buildContent(text, url) {
  return url ? `${text}\n\nLink: ${url}` : text;
}

module.exports = { post };
