'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { executeTool, TOOL_DEFINITIONS } = require('./tools');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert marketing automation agent with deep knowledge of all major marketing channels, copywriting techniques, and audience psychology.

When given a product or service to market, you:
1. **Analyze** it thoroughly: identify the unique value proposition, target audiences, key benefits, competitive angles, and emotional hooks.
2. **Strategize**: determine the best messaging for each channel and how to adapt tone, length, and format.
3. **Execute** the full omnichannel campaign by calling EVERY available channel tool — no exceptions.
4. **Summarize** what was created with a brief campaign overview at the end.

Channel-specific guidelines:

**Email** — Full HTML email. Compelling subject (curiosity/benefit/urgency). Preview text. Header with logo area, body with story/benefits/social proof, prominent CTA button (#e74c3c or brand color), unsubscribe footer. Use real HTML with inline CSS.

**Twitter/X** — Under 280 chars total. Hook immediately. Use 2-3 hashtags max. Can add a 2-3 tweet thread for depth.

**LinkedIn** — Professional thought-leadership. Open with a bold insight or question. 3-4 paragraphs. Concrete value. End with 3-5 industry hashtags. No emoji overload.

**Facebook** — Conversational and warm. Start with a question or relatable statement. 1-3 paragraphs. Emojis welcome. Strong CTA. 2-3 hashtags.

**Instagram** — Visual first. Hook in first line (before "more"). Storytelling body. Do NOT put hashtags in caption field — put them in the hashtags array. Describe a vivid, shareable image.

**Discord** — Community-forward. Friendly tone. Use markdown formatting. Rich embed with title, color, and 2-4 key detail fields (pricing, availability, links, etc.).

**Slack** — Professional and brief. Use Block Kit with a header block, section blocks, and ideally a button block. Keep it scannable.

**Blog** — 800-1200 words in Markdown. SEO-optimized. Compelling H1 title. Hook intro. 3-4 H2 sections with H3 sub-points. Bullet lists. Conclusion with CTA. Weave keywords naturally.

**SMS** — Absolute maximum 160 chars. Brand name first. One clear offer/hook. One CTA. Always end with opt-out text.

**Google Ads** — 3-5 headlines (STRICT 30-char limit each). 2-3 descriptions (STRICT 90-char limit each). Use a variety of angles: benefit, feature, CTA, urgency.

**YouTube** — SEO title with primary keyword. Description starts with the value proposition (first 2 lines visible). Chapters if relevant. Links section. 3-5 hashtags.

Be creative, persuasive, and platform-appropriate. Generate genuinely high-quality marketing content, not generic filler.`;

async function runMarketingCampaign(productInfo) {
  const messages = [{ role: 'user', content: productInfo }];

  console.log('\n🚀 Marketing Agent activated — creating your full omnichannel campaign...\n');
  console.log('═'.repeat(60));

  while (true) {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Stream text blocks to console
    for (const block of response.content) {
      if (block.type === 'text' && block.text) {
        process.stdout.write(block.text);
      }
    }

    if (response.stop_reason === 'end_turn') {
      console.log('\n\n' + '═'.repeat(60));
      console.log('✅ Campaign complete! All assets saved to marketing-outputs/');
      break;
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        const channelName = block.name
          .replace(/^(post_|create_|publish_|send_)/, '')
          .replace(/_/g, ' ')
          .toUpperCase();

        process.stdout.write(`\n\n📣 [${channelName}] Deploying...`);

        let resultContent;
        let isError = false;

        try {
          const result = await executeTool(block.name, block.input);
          resultContent = typeof result === 'string' ? result : JSON.stringify(result);
          process.stdout.write(' ✓\n   ' + resultContent.split('\n').join('\n   '));
        } catch (err) {
          resultContent = `Error: ${err.message}`;
          isError = true;
          process.stdout.write(` ✗\n   ${resultContent}`);
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: resultContent,
          ...(isError && { is_error: true }),
        });
      }

      messages.push({ role: 'user', content: toolResults });
    } else {
      // Unexpected stop reason
      break;
    }
  }
}

module.exports = { runMarketingCampaign };
