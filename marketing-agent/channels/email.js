'use strict';

const https = require('https');
const { saveFile } = require('../output');

function httpsPost(urlStr, body, headers) {
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
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: raw });
          } else {
            reject(new Error(`SendGrid ${res.statusCode}: ${raw}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function send({ subject, preview_text, body_html, body_text, from_name = 'Marketing Team' }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.SENDGRID_TO_EMAIL;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  // Save HTML file regardless
  const htmlFile = saveFile('email.html', buildFullHtml(subject, preview_text, body_html));
  const txtFile = saveFile('email.txt', `Subject: ${subject}\nPreview: ${preview_text}\n\n${body_text}`);

  if (apiKey && toEmail && fromEmail) {
    const payload = {
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: from_name },
      subject,
      content: [
        { type: 'text/plain', value: body_text },
        { type: 'text/html', value: body_html },
      ],
    };

    try {
      await httpsPost('https://api.sendgrid.com/v3/mail/send', payload, {
        Authorization: `Bearer ${apiKey}`,
      });
      return `Email sent via SendGrid to ${toEmail}. Files saved: ${htmlFile}`;
    } catch (err) {
      return `SendGrid error (${err.message}). Saved locally: ${htmlFile}`;
    }
  }

  return `[DRY RUN] Email ready — saved to:\n  HTML: ${htmlFile}\n  Text: ${txtFile}\n  Set SENDGRID_API_KEY + SENDGRID_FROM_EMAIL + SENDGRID_TO_EMAIL to send.`;
}

function buildFullHtml(subject, preview, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { background: #1a1a2e; padding: 30px 40px; }
  .content { padding: 40px; }
  .footer { background: #f4f4f4; padding: 20px 40px; font-size: 12px; color: #888; text-align: center; }
</style>
</head>
<body>
<span style="display:none;max-height:0;overflow:hidden;">${preview}</span>
<div class="wrapper">
  <div class="header"></div>
  <div class="content">${body}</div>
  <div class="footer">
    <p>You received this because you subscribed to our marketing list.</p>
    <p><a href="#">Unsubscribe</a></p>
  </div>
</div>
</body>
</html>`;
}

module.exports = { send };
