# BG-AI Backend Setup & Run Instructions

## Prerequisites

1. **LM Studio** - Download from https://lmstudio.ai/
2. **Python 3.8+** - For running Flask backend
3. **Qwen3-4B Model** - Loaded in LM Studio

## Installation

### 1. Install Python Dependencies

```bash
cd log/
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

Create `.env` file in project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Or use defaults:
- LM Studio: `http://localhost:1234/v1`
- Port: `5000`
- Model: `qwen3-4b`

## Running the Backend

### Step 1: Start LM Studio

1. Open **LM Studio** application
2. Select **Qwen3-4B** model from library
3. Click **⚙ Load** to load the model
4. Click **↻ Start Server** button
5. Confirm server is running at `http://localhost:1234`

### Step 2: Start Flask Backend

```bash
cd log/
python main.py
```

Expected output:
```
=================================================================
  SATU-AI | NutriGuard  -  Flask Backend
=================================================================
  Port       : 5000
  LM Studio  : http://localhost:1234/v1
  Model      : qwen3-4b
-----------------------------------------------------------------
  API Endpoint (dipanggil oleh Next.js)
    POST /api/chat    ->  Kirim pesan ke qwen3-4b
    GET  /api/status  ->  Cek koneksi LM Studio
    GET  /api/models  ->  Daftar model tersedia
    GET  /api/config  ->  Info konfigurasi
=================================================================
```

### Step 3: Start Next.js Frontend

In another terminal:

```bash
cd ui/
npm run dev
```

Frontend runs at: `http://localhost:3000`

## API Endpoints

### `/api/chat` (POST)

Send chat messages to Qwen3-4B:

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Analisis gizi nasi goreng"}
    ]
  }'
```

**Response:**
```json
{
  "reply": "Nasi goreng dengan telur dan sayuran mengandung...",
  "model": "qwen3-4b",
  "tokens": {"prompt_tokens": 80, "completion_tokens": 220, "total_tokens": 300},
  "error": null
}
```

### `/api/status` (GET)

Check LM Studio connection:

```bash
curl http://localhost:5000/api/status
```

**Response:**
```json
{
  "status": "online",
  "models": ["qwen3-4b"]
}
```

### `/api/models` (GET)

List available models:

```bash
curl http://localhost:5000/api/models
```

### `/api/config` (GET)

View current configuration:

```bash
curl http://localhost:5000/api/config
```

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Run `pip install -r requirements.txt` again
- Check if port 5000 is available

### "Cannot connect to LM Studio"
- Ensure LM Studio application is running
- Click **↻ Start Server** button in LM Studio
- Verify server is at `http://localhost:1234`
- Check firewall settings

### "Model not loaded"
- Open LM Studio
- Go to **Library** tab
- Search for **Qwen3-4B**
- Click **⚙ Load Model**+ Wait for completion

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled (already enabled in Flask)
- Frontend should call `/api/chat` not `http://localhost:5000/api/chat`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js Frontend (Port 3000)                               │
│  ├─ Chat UI (page.tsx)                                      │
│  ├─ Login page (login/page.tsx)                             │
│  └─ Auth page (auth/page.tsx)                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ API calls to /api/chat & /api/status
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Flask Backend (Port 5000) - log/main.py                    │
│  ├─ POST /api/chat  (process messages)                      │
│  ├─ GET  /api/status (health check)                         │
│  ├─ GET  /api/models (list models)                          │
│  └─ GET  /api/config (show config)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP requests via LM Studio API
                           ▼
        ┌─────────────────────────────────────────┐
        │  LM Studio (Port 1234)                 │
        │  OpenAI-compatible API                 │
        │  ├─ /v1/chat/completions               │
        │  ├─ /v1/models                         │
        │  └─ Qwen3-4B Model (Loaded)            │
        └─────────────────────────────────────────┘
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LM_STUDIO_BASE` | `http://localhost:1234/v1` | LM Studio API endpoint |
| `MODEL_NAME` | `qwen3-4b` | Model name to use |
| `MAX_TOKENS` | `1024` | Max response length |
| `TEMPERATURE` | `0.7` | Model creativity (0-1) |
| `FLASK_PORT` | `5000` | Backend port |
| `FLASK_DEBUG` | `true` | Debug mode (set to false in production) |

## Notes

- The backend is fully CORS-enabled for Next.js frontend
- All API responses include error handling
- System prompt includes NutriGuard specialization
- Supports multi-turn conversation via message history
- Timeouts set to 120 seconds for LM Studio responses
