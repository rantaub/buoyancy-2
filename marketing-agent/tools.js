'use strict';

const email = require('./channels/email');
const twitter = require('./channels/twitter');
const linkedin = require('./channels/linkedin');
const facebook = require('./channels/facebook');
const instagram = require('./channels/instagram');
const discord = require('./channels/discord');
const slack = require('./channels/slack');
const blog = require('./channels/blog');
const sms = require('./channels/sms');
const ads = require('./channels/ads');
const youtube = require('./channels/youtube');

const TOOL_DEFINITIONS = [
  {
    name: 'post_email',
    description:
      'Send an HTML email marketing campaign. Generate a compelling subject, preview text, full HTML body, and plain text version.',
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject line (60 chars max, high open-rate)' },
        preview_text: { type: 'string', description: 'Preview shown in inbox below subject (90 chars max)' },
        body_html: {
          type: 'string',
          description:
            'Full HTML email body — include a header section, engaging body paragraphs, a prominent CTA button, and sign-off. Use inline CSS.',
        },
        body_text: { type: 'string', description: 'Plain-text fallback version of the email' },
        from_name: { type: 'string', description: 'Sender display name (defaults to "Marketing Team")' },
      },
      required: ['subject', 'preview_text', 'body_html', 'body_text'],
    },
  },
  {
    name: 'post_twitter',
    description:
      'Post a tweet to Twitter/X. Total text including hashtags must be ≤280 chars. Optionally include reply tweets to form a thread.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Main tweet text with hashtags (≤280 chars total). Be punchy and attention-grabbing.',
        },
        thread: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional follow-up tweets that form a reply thread (2-3 additional tweets)',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'post_linkedin',
    description:
      'Create a LinkedIn post. Use a professional, thought-leadership tone. 3-5 paragraphs. End with 3-5 relevant hashtags.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description:
            'Full post content — hook in first line, professional insights, concrete value, hashtags at end.',
        },
        article_url: { type: 'string', description: 'Optional URL to share with the post' },
      },
      required: ['text'],
    },
  },
  {
    name: 'post_facebook',
    description:
      'Create a Facebook post. Conversational and engaging. Include emojis where appropriate. Clear CTA. 2-4 hashtags.',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Post message — engaging, conversational, with emojis and a call-to-action.',
        },
        link: { type: 'string', description: 'Optional URL to share' },
      },
      required: ['message'],
    },
  },
  {
    name: 'post_instagram',
    description:
      'Create an Instagram post. Use visual storytelling in the caption. Must include 20-30 hashtags. Describe the ideal image.',
    input_schema: {
      type: 'object',
      properties: {
        caption: {
          type: 'string',
          description:
            'Caption with a strong hook in the first line, storytelling body, and CTA. Do NOT include hashtags here.',
        },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: '20-30 relevant hashtags without the # symbol (e.g. "productlaunch", "startup")',
        },
        image_prompt: {
          type: 'string',
          description: 'Detailed description of the ideal image or graphic for this post',
        },
      },
      required: ['caption', 'hashtags', 'image_prompt'],
    },
  },
  {
    name: 'post_discord',
    description:
      'Send an announcement to Discord. Use Discord markdown. Create an embed with title, description, and key fields.',
    input_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Main message text (supports **bold**, *italic*, Discord pings)',
        },
        embed_title: { type: 'string', description: 'Title of the embed card' },
        embed_description: { type: 'string', description: 'Body text of the embed card' },
        embed_color: {
          type: 'integer',
          description: 'Embed sidebar color as decimal integer (e.g. 5814783 = blue, 15158332 = red)',
        },
        embed_fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'string' },
              inline: { type: 'boolean' },
            },
            required: ['name', 'value'],
          },
          description: 'Up to 5 inline fields showing key info (price, date, features, etc.)',
        },
      },
      required: ['content', 'embed_title', 'embed_description'],
    },
  },
  {
    name: 'post_slack',
    description: 'Send a message to Slack. Use Block Kit for rich formatting with sections, dividers, and buttons.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Fallback plain text message (also shown in notifications)',
        },
        blocks: {
          type: 'array',
          description:
            'Slack Block Kit blocks for rich formatting. Use section, header, divider, and button blocks.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'publish_blog_post',
    description:
      'Generate and save a complete SEO-optimized blog post in Markdown. 800-1500 words. Include H2/H3 headers, bullet points, intro, body sections, and conclusion.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'SEO-optimized blog post title (60 chars max)' },
        slug: { type: 'string', description: 'URL slug (lowercase, hyphens only, no spaces)' },
        meta_description: { type: 'string', description: 'SEO meta description (120-160 chars)' },
        content: {
          type: 'string',
          description:
            'Full blog post in Markdown (800-1500 words). Start with an engaging intro, use ## H2 and ### H3 headings, include bullet points, and end with a conclusion + CTA.',
        },
        primary_keyword: { type: 'string', description: 'Main SEO keyword to optimize for' },
        secondary_keywords: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 secondary keywords to weave naturally into the content',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Blog categories/tags',
        },
      },
      required: ['title', 'slug', 'meta_description', 'content', 'primary_keyword'],
    },
  },
  {
    name: 'send_sms',
    description:
      'Send an SMS marketing message. MAX 160 characters total. Must be direct, urgent, and include opt-out instruction.',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description:
            'SMS message text (160 chars max). Include a CTA and "Reply STOP to unsubscribe." at the end.',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'create_google_ad',
    description:
      'Create a Google Responsive Search Ad. Provide 3-5 headlines (≤30 chars each) and 2-3 descriptions (≤90 chars each).',
    input_schema: {
      type: 'object',
      properties: {
        headlines: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 unique headlines (max 30 chars each). Mix benefit, feature, and CTA angles.',
        },
        descriptions: {
          type: 'array',
          items: { type: 'string' },
          description: '2-3 descriptions (max 90 chars each). Be specific about benefits and include a CTA.',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: '5-10 target keywords for this ad group',
        },
        final_url: { type: 'string', description: 'Landing page URL' },
      },
      required: ['headlines', 'descriptions', 'keywords'],
    },
  },
  {
    name: 'create_youtube_description',
    description:
      'Create a YouTube video description optimized for SEO. Include timestamps if relevant, link section, and 3-5 hashtags.',
    input_schema: {
      type: 'object',
      properties: {
        video_title: {
          type: 'string',
          description: 'YouTube video title (SEO-optimized, max 100 chars, include primary keyword)',
        },
        description: {
          type: 'string',
          description:
            'Full video description. First 2-3 lines are most important (shown before "more"). Include keyword-rich text, what viewers will learn, and a CTA.',
        },
        chapters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string', description: 'Timestamp e.g. "0:00"' },
              title: { type: 'string', description: 'Chapter title' },
            },
            required: ['time', 'title'],
          },
          description: 'Video chapter timestamps (start with 0:00)',
        },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 hashtags (without # symbol)',
        },
        links: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Named links to include e.g. {"Website": "https://...", "Twitter": "https://..."}',
        },
      },
      required: ['video_title', 'description'],
    },
  },
];

async function executeTool(name, input) {
  switch (name) {
    case 'post_email':
      return email.send(input);
    case 'post_twitter':
      return twitter.post(input);
    case 'post_linkedin':
      return linkedin.post(input);
    case 'post_facebook':
      return facebook.post(input);
    case 'post_instagram':
      return instagram.post(input);
    case 'post_discord':
      return discord.post(input);
    case 'post_slack':
      return slack.post(input);
    case 'publish_blog_post':
      return blog.publish(input);
    case 'send_sms':
      return sms.send(input);
    case 'create_google_ad':
      return ads.createGoogleAd(input);
    case 'create_youtube_description':
      return youtube.create(input);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool };
