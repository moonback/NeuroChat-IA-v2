import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

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

app.get('/api/ping', (_req, res) => {
  res.type('text/plain').send('pong');
});

// ==========================
// Mémoire utilisateur (persistée côté serveur)
// ==========================
const DATA_DIR = path.join(__dirname, 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

function getWorkspace(req) {
  const w = (req.query.workspace || req.body?.workspace || 'default');
  return typeof w === 'string' && w.trim().length > 0 ? w.trim() : 'default';
}

function memoryFilePath(workspace) {
  return path.join(DATA_DIR, `memory-${workspace}.json`);
}

async function readMemories(workspace) {
  await ensureDataDir();
  const fp = memoryFilePath(workspace);
  try {
    const buf = await fs.readFile(fp, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMemories(workspace, memories) {
  await ensureDataDir();
  const fp = memoryFilePath(workspace);
  await fs.writeFile(fp, JSON.stringify(memories ?? [], null, 2), 'utf8');
}

app.get('/api/memory', async (req, res) => {
  try {
    const workspace = getWorkspace(req);
    const list = await readMemories(workspace);
    res.json({ workspace, memories: list });
  } catch (e) {
    res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
  }
});

app.post('/api/memory/save', async (req, res) => {
  try {
    const workspace = getWorkspace(req);
    const memories = Array.isArray(req.body?.memories) ? req.body.memories : [];
    await writeMemories(workspace, memories);
    res.json({ ok: true, workspace, count: memories.length });
  } catch (e) {
    res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


