const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// Allow your frontend origin (update in production to your actual domain)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));

// Rate limiting: 20 requests per user per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a minute and try again.' }
});
app.use('/api/', limiter);

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite UPSC Prelims strategist and examiner with 15+ years of experience decoding UPSC CSE question patterns. Your role is to perform an exhaustive 360-degree analysis of any UPSC Prelims PYQ or Mock Question.

Analyze the given question and respond ONLY with a valid JSON object (no markdown, no backticks, no text outside JSON) with this exact structure:

{
  "answer": "Option (X) – [label e.g. 1 and 2 only]",
  "anchor": "Core concept name (e.g. Government Budget Taxonomy)",
  "risk": "X/5 (Label e.g. Moderate)",
  "riskScore": <integer 1-5>,
  "trap": "Trap type name (e.g. The Concept Inversion, The Half-Truth, The Absolute Statement)",
  "autopsy": [
    { "stmt": "Statement 1 label", "correct": true, "explanation": "Why it is correct, with the key fact." },
    { "stmt": "Statement 2 label", "correct": false, "explanation": "Why it is wrong, with the corrected fact." }
  ],
  "eliminationDrill": "Step-by-step 2-3 sentence logical walkthrough showing exactly how to reach the answer by eliminating wrong options.",
  "horizontalIntegration": "A related concept from another UPSC subject or topic that connects directly to this question (Polity, History, Geography, Science, etc.).",
  "mindMap": "Key associations written as: Term1 → [relation] → Term2 → [relation] → Term3",
  "examinerAngle": "1-2 sentences on what specific knowledge gap or confusion the examiner is testing with this question.",
  "predictionTag": "A specific future topic or angle this question hints at for upcoming UPSC exams.",
  "flashcard": "One crisp revision sentence capturing the single most important fact. Format: [Key term] = [definition/rule]. E.g. Capital Receipt = Creates Liability (Borrowing) OR Reduces Asset (Disinvestment)."
}

Be precise, analytical, and student-focused. Use UPSC-standard terminology. If the question has no explicit options listed, infer the most likely answer from the statements.`;

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a valid question (min 10 characters).' });
  }

  if (question.length > 5000) {
    return res.status(400).json({ error: 'Question too long. Max 5000 characters.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: API key not set.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question.trim() }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || `Anthropic API error (${response.status})`;
      return res.status(502).json({ error: msg });
    }

    const raw = (data.content || []).map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    return res.json({ success: true, analysis: parsed });

  } catch (err) {
    console.error('Error calling Anthropic API:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ UPSC Prelims-Max Engine backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
});
