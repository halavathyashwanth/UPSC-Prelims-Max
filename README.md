# UPSC Prelims-Max Engine 🎯

> AI-powered 360° analysis of UPSC CSE Prelims PYQs — deconstruct traps, eliminate wrong options, and build revision-ready flashcards in seconds.

---

## Project Structure

```
upsc-engine/
├── backend/
│   ├── server.js          ← Express proxy server (keeps API key safe)
│   ├── package.json
│   ├── .env.example       ← Copy this to .env and fill in your key
│   └── .gitignore
├── frontend/
│   └── index.html         ← The full UI (pure HTML/CSS/JS, no build step)
├── render.yaml            ← One-click deploy backend to Render.com
├── vercel.json            ← One-click deploy frontend to Vercel
└── README.md
```

---

## Local Development (run in 5 minutes)

### 1. Get your Anthropic API key
Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Now open .env and paste your ANTHROPIC_API_KEY
npm run dev        # starts with nodemon (auto-restarts on changes)
# OR
npm start          # plain node
```

The backend will start at **http://localhost:3001**

Test it's working:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Open the frontend

Just open `frontend/index.html` in your browser — no build step needed.

> **Tip:** Use VS Code's Live Server extension or run `npx serve frontend` so the file is served over HTTP (not `file://`), which avoids some browser restrictions.

---

## Deployment (Free Hosting)

### Backend → Render.com

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add Environment Variables:
   - `ANTHROPIC_API_KEY` → your key
   - `ALLOWED_ORIGINS` → your frontend URL (e.g. `https://upsc-engine.vercel.app`)
8. Deploy — Render gives you a free URL like `https://upsc-prelims-max-backend.onrender.com`

### Frontend → Vercel / Netlify / GitHub Pages

**Vercel (recommended):**
1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Set **Root Directory** to `frontend`
3. Deploy — you get a URL like `https://upsc-engine.vercel.app`

**After both are deployed:**
- Open `frontend/index.html`
- Change the `API_BASE` constant at the top of the `<script>` to your Render backend URL:
  ```js
  const API_BASE = 'https://upsc-prelims-max-backend.onrender.com';
  ```
- Redeploy the frontend.

---

## API Reference

### `GET /health`
Returns server status.

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### `POST /api/analyze`
Analyzes a UPSC question.

**Request body:**
```json
{ "question": "Consider the following statements..." }
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "answer": "Option (a) – 1 and 2 only",
    "anchor": "Government Budget Taxonomy",
    "risk": "2/5 (Easy-Moderate)",
    "riskScore": 2,
    "trap": "The Concept Inversion",
    "autopsy": [
      { "stmt": "Statement 1", "correct": true, "explanation": "..." },
      { "stmt": "Statement 3", "correct": false, "explanation": "..." }
    ],
    "eliminationDrill": "...",
    "horizontalIntegration": "...",
    "mindMap": "Capital Budget → contains → Capital Receipts → includes → Disinvestment",
    "examinerAngle": "...",
    "predictionTag": "...",
    "flashcard": "Capital Receipt = Creates Liability OR Reduces Asset."
  }
}
```

---

## Rate Limiting

The backend limits each IP to **20 requests per minute** to prevent abuse.

---

## Customising the AI Prompt

The system prompt lives in `backend/server.js` in the `SYSTEM_PROMPT` constant. Edit it to:
- Change the output structure
- Add more analysis sections
- Tune the tone / depth of explanations

---

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | HTML · CSS · Vanilla JS     |
| Backend  | Node.js · Express           |
| AI       | Claude Sonnet (Anthropic)   |
| Hosting  | Render (backend) · Vercel (frontend) |

---

## Roadmap Ideas

- [ ] Question history (localStorage or a database)
- [ ] User authentication + subscription (Stripe)
- [ ] Topic tagging and subject-wise filtering
- [ ] Export flashcards to Anki / PDF
- [ ] Batch upload (paste 10 questions at once)
- [ ] Mobile app (React Native / PWA)
