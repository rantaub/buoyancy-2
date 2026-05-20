'use strict';

const https = require('https');
const { saveFile } = require('../output');

async function send({ message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_TO_NUMBER;

  const savedFile = saveFile('sms.txt', `SMS MESSAGE:\n${message}\n\nCharacter count: ${message.length}/160`);

  if (accountSid && authToken && from && to) {
    try {
      await twilioSend(accountSid, authToken, from, to, message);
      return `SMS sent to ${to}. File saved: ${savedFile}`;
    } catch (err) {
      return `Twilio error (${err.message}). Saved: ${savedFile}`;
    }
  }

  return `[DRY RUN] SMS content saved: ${savedFile}\n  Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER + TWILIO_TO_NUMBER to send.`;
}

function twilioSend(accountSid, authToken, from, to, body) {
  return new Promise((resolve, reject) => {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams({ From: from, To: to, Body: body }).toString();
    const path = `/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const req = https.request(
      {
        hostname: 'api.twilio.com',
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(params),
          Authorization: `Basic ${credentials}`,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json.sid) resolve(json.sid);
            else reject(new Error(json.message || raw));
          } catch {
            reject(new Error(raw));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(params);
    req.end();
  });
}

module.exports = { send };
