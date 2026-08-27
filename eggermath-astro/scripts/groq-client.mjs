import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

let GROQ_KEYS = [];

if (fs.existsSync(CONFIG_PATH)) {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  GROQ_KEYS = config.groqKeys || [];
}

if (GROQ_KEYS.length === 0 && process.env.GROQ_API_KEY) {
  GROQ_KEYS = [process.env.GROQ_API_KEY];
}

if (GROQ_KEYS.length === 0) {
  console.error('No Groq API keys found. Set GROQ_API_KEY env var or create config.json with groqKeys array.');
  process.exit(1);
}

let currentKeyIndex = 0;

function getNextKey() {
  const key = GROQ_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
  return key;
}

export async function groqChat(messages, options = {}) {
  const { model = 'openai/gpt-oss-120b', temperature = 0.7, max_tokens = 2000 } = options;
  const apiKey = getNextKey();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
