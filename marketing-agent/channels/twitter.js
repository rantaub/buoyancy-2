'use strict';

const https = require('https');
const { saveFile } = require('../output');

// Twitter API v2 uses OAuth 1.0a — requires oauth-1.0a library.
// Without the library we fall back to saving the content.
async function post({ text, thread = [] }) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const savedFile = saveFile('twitter.txt', buildContent(text, thread));

  if (bearerToken) {
    // Bearer token only supports read; posting requires OAuth 1.0a user context.
    // Real posting needs: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
    const allCreds =
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_SECRET;

    if (allCreds) {
      try {
        // Dynamic import — works if user has 'oauth-1.0a' installed
        const OAuth = require('oauth-1.0a'); // optional dep
        const crypto = require('crypto');
        const oauth = OAuth({
          consumer: { key: process.env.TWITTER_API_KEY, secret: process.env.TWITTER_API_SECRET },
          signature_method: 'HMAC-SHA1',
          hash_function: (base, key) =>
            crypto.createHmac('sha1', key).update(base).digest('base64'),
        });
        const token = {
          key: process.env.TWITTER_ACCESS_TOKEN,
          secret: process.env.TWITTER_ACCESS_SECRET,
        };
        const tweetUrl = 'https://api.twitter.com/2/tweets';
        const authHeader = oauth.toHeader(oauth.authorize({ url: tweetUrl, method: 'POST' }, token));

        const tweetIds = [];
        for (const tweetText of [text, ...thread]) {
          const body = JSON.stringify(
            tweetIds.length > 0
              ? { text: tweetText, reply: { in_reply_to_tweet_id: tweetIds[tweetIds.length - 1] } }
              : { text: tweetText }
          );
          const id = await postTweet(tweetUrl, body, authHeader.Authorization);
          tweetIds.push(id);
        }
        return `Posted ${tweetIds.length} tweet(s). File saved: ${savedFile}`;
      } catch (err) {
        return `Twitter post failed (${err.message}). Saved: ${savedFile}`;
      }
    }
  }

  return `[DRY RUN] Twitter content saved: ${savedFile}\n  Set TWITTER_API_KEY/SECRET + TWITTER_ACCESS_TOKEN/SECRET to auto-post.`;
}

function postTweet(url, body, authHeader) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: authHeader,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json.data && json.data.id) resolve(json.data.id);
            else reject(new Error(raw));
          } catch {
            reject(new Error(raw));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildContent(text, thread) {
  const lines = [`TWEET:\n${text}`];
  if (thread.length > 0) {
    lines.push('\nTHREAD REPLIES:');
    thread.forEach((t, i) => lines.push(`[${i + 2}] ${t}`));
  }
  return lines.join('\n');
}

module.exports = { post };
