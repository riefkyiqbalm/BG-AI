# BG-AI
BG-AI adalah platform chatbot multimodal berbasis LLM open-source (Qwen, Sahabat AI) yang berperan sebagai jembatan antara input pengguna (teks, foto, video) dengan model AI.


## Github Pages File -> docs (folder)

## Arsitektur

```
Browser  ←→  Next.js :3000  ←→  Flask :5000  ←→  LM Studio :1234
              (routing/UI)       (API proxy)       (Qwen3-4B)
```

- **Next.js** — routing halaman, UI React, TypeScript
- **Flask** — API backend, koneksi ke LM Studio
- **LM Studio** — menjalankan model Qwen3-4B secara lokal

## Struktur Folder

```
BG-AI/
|-- ui/                  ← Next.js
|   |-- src/
|   |   |-- app/
|   |   |   |-- layout.tsx
|   |   |   |-- page.tsx       ← redirect ke /chat
|   |   |   |-- not-found.tsx  ← halaman 404
|   |   |   |-- chat/
|   |   |   |   |-- page.tsx   ← halaman chat utama
|   |   |   |-- login/
|   |   |   |   |-- page.tsx   ← login & register
|   |   |   |-- auth/
|   |   |   |   |-- page.tsx   ← pengaturan akun
|   |   |   |-- terms/
|   |   |       |-- page.tsx   ← ketentuan layanan
|   |   |-- components/
|   |   |   |-- StatusDot.tsx  ← indikator status LM Studio
|   |   |-- lib/
|   |   |   |-- api.ts         ← fetch helper ke Flask
|   |   |-- styles/
|   |       |-- globals.css
|   |-- next.config.js         ← proxy /api/* ke Flask :5000
|   |-- package.json
|   |-- tsconfig.json
|
|-- log/                       ← Flask
|    |-- main.py
|    |-- requirements.txt
```

## Cara Menjalankan

### 1. Prerequisites

- **LM Studio** — Download dari https://lmstudio.ai/
- **Python 3.8+** — Untuk Flask backend
- **Node.js + npm** — Untuk Next.js frontend
- **Qwen3-4B Model** — Dimuat di LM Studio

### 2. Setup Backend (Flask)

#### 2.1 Install Dependencies

```bash
cd log/
pip install -r requirements.txt
```

Required packages:
- `flask>=3.0.0` — Web framework
- `flask-cors>=4.0.0` — Enable CORS for frontend
- `requests>=2.31.0` — HTTP client untuk LM Studio
- `python-dotenv>=1.0.0` — Load environment variables

#### 2.2 Konfigurasi Environment (Opsional)

Buat file `.env` di root project (copy dari `.env.example`):

```bash
# LM Studio Configuration
LM_STUDIO_BASE=http://localhost:1234/v1
MODEL_NAME=qwen3-4b
MAX_TOKENS=1024
TEMPERATURE=0.7

# Flask Configuration
FLASK_PORT=5000
FLASK_DEBUG=true
```

Atau gunakan default — semua sudah dikonfigurasi.

#### 2.3 Jalankan Flask Backend

```bash
cd log/
python main.py
```

Expected output:
```
=================================================================
  BG-AI  -  Flask Backend
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

### 3. Setup LM Studio

1. **Buka LM Studio** application
2. **Select Model** → Cari **Qwen3-4B** di Library
3. **Load Model** → Klik tombol ⚙ Load dan tunggu selesai
4. **Start Server** → Klik tombol ↻ Start Server
5. **Verify** → Pastikan server berjalan di `http://localhost:1234`

### 4. Setup Frontend (Next.js)

#### 4.1 Install Dependencies

```bash
cd ui/
npm install
```

#### 4.2 Jalankan Development Server

```bash
npm run dev
```

Frontend berjalan di: `http://localhost:3000`

**Available scripts:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production server
npm run lint       # Run ESLint
npm run export     # Export static files
npm run deploy:s3  # Build and deploy to AWS S3
```

### 5. Verifikasi Setup

Buka browser dan kunjungi: `http://localhost:3000`

Jika semua berjalan lancar:
- ✅ Frontend muncul dengan UI chat
- ✅ Status indicator menunjukkan "● Online" (LM Studio terhubung)
- ✅ Bisa mengirim dan menerima pesan dari Qwen3-4B

### 6. Quick Start (All-in-One)

**Windows PowerShell:**
```powershell
.\start.ps1
```

**Windows Command Prompt:**
```cmd
start.bat
```

Script ini akan otomatis:
1. Install dependencies (jika belum) 
2. Start Flask backend (terminal baru)
3. Start Next.js frontend (terminal baru)

Tunggu ~10 detik, lalu buka `http://localhost:3000`

## Rute Halaman

| URL         | Halaman              |
|-------------|----------------------|
| `/`         | Redirect ke `/chat`  |
| `/chat`     | Chat utama           |
| `/login`    | Login & Register     |
| `/auth`     | Pengaturan Akun      |
| `/terms`    | Ketentuan Layanan    |
| `/*`        | 404 Not Found        |


## API Endpoint (Flask)

### Ringkas

| Method | Endpoint      | Fungsi                          |
|--------|---------------|---------------------------------|
| POST   | `/api/chat`   | Kirim pesan ke Qwen3-4B         |
| GET    | `/api/status` | Cek apakah LM Studio online     |
| GET    | `/api/models` | Daftar model tersedia           |
| GET    | `/api/config` | Info konfigurasi server         |

### Detail

#### 1. POST `/api/chat` — Kirim Pesan

**Request:**
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful AI assistant."},
    {"role": "user", "content": "Hello, how are you?"}
  ]
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you for asking!",
  "model": "qwen3-4b",
  "tokens": 42
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

#### 2. GET `/api/status` — Cek Status LM Studio

**Response (Online):**
```json
{
  "status": "online",
  "lm_studio": "http://localhost:1234/v1",
  "model": "qwen3-4b"
}
```

**Response (Offline):**
```json
{
  "status": "offline",
  "error": "Connection refused: http://localhost:1234/v1"
}
```

#### 3. GET `/api/models` — Daftar Model

**Response:**
```json
{
  "models": [
    {
      "id": "qwen3-4b",
      "object": "model",
      "owned_by": "lmstudio"
    }
  ]
}
```

#### 4. GET `/api/config` — Info Konfigurasi

**Response:**
```json
{
  "lm_studio_url": "http://localhost:1234/v1",
  "model_name": "qwen3-4b",
  "max_tokens": 1024,
  "temperature": 0.7,
  "port": 5000
}
```

## Troubleshooting

### ❌ "Connection refused: http://localhost:1234"

**Masalah:** LM Studio tidak running atau port salah

**Solusi:**
1. Buka LM Studio application
2. Se sure model **Qwen3-4B** sudah loaded (ditandai ✓)
3. Klik tombol **Start Server** di tab **Local Server**
4. Tunggu sampai status berubah menjadi "Server Running"
5. Verify di: `http://localhost:1234/api/models` (buka di browser)

### ❌ "npm error: Missing script 'dev'"

**Masalah:** Node modules tidak terinstall atau package.json corrupted

**Solusi:**
```bash
cd ui/
rm -r node_modules package-lock.json  # Windows: del /s node_modules, del package-lock.json
npm install
npm run dev
```

### ❌ "Port 5000 already in use"

**Masalah:** Flask backend sudah berjalan atau aplikasi lain menggunakan port

**Solusi:**
```bash
# Cari proses yang menggunakan port 5000
netstat -ano | findstr :5000  # Windows

# Kill proses (ganti PID dengan nomor proses)
taskkill /PID <PID> /F  # Windows

# Atau ubah port di .env
FLASK_PORT=5001
```

### ❌ "Port 3000 already in use"

**Solusi:**
```bash
# Cari proses yang menggunakan port 3000
netstat -ano | findstr :3000  # Windows

# Kill proses
taskkill /PID <PID> /F  # Windows
```

### ❌ "Module 'flask' not found"

**Masalah:** Dependencies belum terinstall

**Solusi:**
```bash
cd log/
pip install -r requirements.txt
```

### ❌ Chat tidak merespons

**Checklist:**
- ✓ LM Studio server running (`http://localhost:1234/api/models` responsive)
- ✓ Flask backend running (terminal menampilkan "Running on http://0.0.0.0:5000")
- ✓ Status indicator di UI menunjukkan "● Online" (bukan "● Offline")
- ✓ Tidak ada error di browser console (F12 → Console tab)
- ✓ Tidak ada error di Flask terminal

**Debug:**
```bash
# Test Flask backend directly
curl http://localhost:5000/api/status

# Test LM Studio directly
curl http://localhost:1234/v1/models
```

## Environment Variables

| Variable         | Default                    | Deskripsi                                |
|------------------|----------------------------|------------------------------------------|
| `LM_STUDIO_BASE` | `http://localhost:1234/v1` | URL LM Studio API                        |
| `MODEL_NAME`     | `qwen3-4b`                 | Model yang digunakan                     |
| `MAX_TOKENS`     | `1024`                     | Token output maksimal                    |
| `TEMPERATURE`    | `0.7`                      | Kreativitas respons (0-2)                |
| `FLASK_PORT`     | `5000`                     | Port Flask server                        |
| `FLASK_DEBUG`    | `false`                    | Enable debug mode                        |

## Deployment ke AWS S3

### Prasyarat
- AWS Account dengan S3 bucket
- AWS CLI terinstall
- AWS credentials configured

### Build & Deploy

```bash
cd ui/
npm run build          # Generate static files ke /out
npm run deploy:s3      # Upload ke S3
```

Script akan:
1. Build Next.js (production mode)
2. Export static HTML ke folder `/out`
3. Upload semua file ke S3 bucket
4. Invalidate CloudFront cache (jika ada)

### Manual Deployment

```bash
cd ui/
npm run export

# Upload dengan AWS CLI
aws s3 sync out/ s3://your-bucket-name/ \
  --delete \
  --cache-control "max-age=3600"
```

## Kontribusi

Untuk menambah fitur atau memperbaiki bug:

1. Fork repository
2. Buat branch feature (`git checkout -b feature/nama`)
3. Commit perubahan (`git commit -am 'Add feature'`)
4. Push ke branch (`git push origin feature/nama`)
5. Buat Pull Request

## Lisensi

MIT License — Lihat file [LICENSE](LICENSE) untuk detail.

## Support

Untuk pertanyaan atau masalah:
1. Cek [Troubleshooting](#troubleshooting) section
2. Lihat error messages di terminal/console
3. Buka issue di repository dengan deskripsi detail

## Environment Variable (opsional)

### Backend (Flask)
```bash
LM_STUDIO_BASE=http://localhost:1234/v1
MODEL_NAME=qwen3-4b
MAX_TOKENS=1024
TEMPERATURE=0.7
FLASK_PORT=5000
```

### Frontend (Next.js)
Tidak diperlukan — proxy dikonfigurasi di `next.config.js`.


