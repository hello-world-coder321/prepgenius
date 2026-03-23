/**
 * Groq (Llama) API Service
 * 
 * Central wrapper for all AI calls using the Groq high-speed API.
 * Model: llama-3.3-70b-versatile
 */

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_MODEL = 'llama-3.3-70b-versatile';

/**
 * Send a chat completion request to Grok
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {object} options - Optional overrides
 * @param {number} options.temperature - Temperature (default 0.7)
 * @param {number} options.max_tokens - Max tokens (default 2048)
 * @param {boolean} options.stream - Stream response (default false)
 * @returns {Promise<string>} The assistant's response text
 */
async function chatCompletion(messages, options = {}) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured in .env');
  }

  const body = {
    model: options.model || GROK_MODEL,
    messages,
    stream: false,
    temperature: options.temperature ?? 0.7,
  };
  if (options.max_tokens) body.max_tokens = options.max_tokens;

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        if (res.status === 429 && attempt < 2) {
          console.log(`⏳ Grok rate limited, retrying in ${(attempt + 1) * 3}s...`);
          await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
          continue;
        }
        throw new Error(`Grok API error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      lastErr = e;
      if (e.message?.includes('429') && attempt < 2) {
        console.log(`⏳ Rate limited, retrying in ${(attempt + 1) * 3}s...`);
        await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
      } else if (attempt < 2 && (e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT')) {
        await new Promise(r => setTimeout(r, 2000));
      } else {
        break;
      }
    }
  }
  throw lastErr;
}

/**
 * Check if Grok is configured
 */
function isConfigured() {
  return !!(process.env.GROK_API_KEY && process.env.GROK_API_KEY !== 'YOUR_GROK_API_KEY_HERE');
}

module.exports = { chatCompletion, isConfigured };
