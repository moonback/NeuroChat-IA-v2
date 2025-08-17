import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

app.post('/api/gemini', async (req, res) => {
  try {
    const apiKey = requireEnv('GEMINI_API_KEY');
    const { contents, generationConfig, safetySettings } = req.body || {};
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig, safetySettings })
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
  }
});

app.post('/api/openai', async (req, res) => {
  try {
    const apiKey = requireEnv('OPENAI_API_KEY');
    const { model, messages, temperature, top_p, max_tokens } = req.body || {};
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature, top_p, max_tokens })
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
  }
});

app.post('/api/mistral', async (req, res) => {
  try {
    const apiKey = requireEnv('MISTRAL_API_KEY');
    const { model, messages, temperature, top_p, max_tokens } = req.body || {};
    const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature, top_p, max_tokens })
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


