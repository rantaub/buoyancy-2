'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function publish({
  title,
  slug,
  meta_description,
  content,
  primary_keyword,
  secondary_keywords = [],
  tags = [],
}) {
  const mdContent = buildMarkdown(title, meta_description, primary_keyword, secondary_keywords, tags, content);
  const savedFile = saveFile(`${slug || 'blog-post'}.md`, mdContent);

  // Optional: publish to WordPress REST API
  const wpUrl = process.env.WORDPRESS_API_URL;
  const wpUser = process.env.WORDPRESS_USERNAME;
  const wpAppPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (wpUrl && wpUser && wpAppPassword) {
    try {
      const credentials = Buffer.from(`${wpUser}:${wpAppPassword}`).toString('base64');
      await httpsPost(
        `${wpUrl}/wp-json/wp/v2/posts`,
        {
          title,
          content: markdownToBasicHtml(content),
          status: 'publish',
          slug,
          excerpt: meta_description,
          tags: tags.join(','),
        },
        { Authorization: `Basic ${credentials}` }
      );
      return `Blog post published to WordPress and saved: ${savedFile}`;
    } catch (err) {
      return `WordPress error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] Blog post saved: ${savedFile}\n  Set WORDPRESS_API_URL + WORDPRESS_USERNAME + WORDPRESS_APP_PASSWORD to auto-publish.`;
}

function buildMarkdown(title, metaDesc, primaryKw, secondaryKws, tags, content) {
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `description: "${metaDesc}"`,
    `primary_keyword: "${primaryKw}"`,
    `keywords: [${[primaryKw, ...secondaryKws].map((k) => `"${k}"`).join(', ')}]`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    `date: "${new Date().toISOString().slice(0, 10)}"`,
    '---',
    '',
  ].join('\n');
  return frontmatter + content;
}

function markdownToBasicHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>');
}

function httpsPost(urlStr, body, extraHeaders = {}) {
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
          ...extraHeaders,
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

module.exports = { publish };
