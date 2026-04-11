"""
BG-AI — Flask Backend
======================================
Install  : pip install -r requirements.txt
Jalankan : python main.py
Port     : 5000 (default)

Next.js Frontend (port 3000) calls these endpoints:
  - POST /api/chat    → Send chat messages to Qwen3-4B
  - GET  /api/status  → Check LM Studio connection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file if exists

# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────

LM_STUDIO_BASE = os.getenv("LM_STUDIO_BASE", "http://localhost:1234/v1")
MODEL_NAME     = os.getenv("MODEL_NAME",      "qwen3-4b")
MAX_TOKENS     = int(os.getenv("MAX_TOKENS",  "1024"))
TEMPERATURE    = float(os.getenv("TEMPERATURE", "0.7"))
FLASK_PORT     = int(os.getenv("FLASK_PORT",  "5000"))
FLASK_DEBUG    = os.getenv("FLASK_DEBUG",     "true").lower() == "true"

CHAT_URL   = LM_STUDIO_BASE + "/chat/completions"
MODELS_URL = LM_STUDIO_BASE + "/models"

SYSTEM_PROMPT = """Anda adalah BG-AI, asisten AI multimodal Indonesia yang ahli dalam:
1. Analisis kandungan gizi makanan (kalori, protein, karbohidrat, lemak, serat, vitamin, mineral)
2. Perbandingan menu dengan standar AKG (Angka Kecukupan Gizi) Kemenkes RI
3. Deteksi defisiensi gizi dan rekomendasi perbaikan menu dalam Bahasa Indonesia
4. Pengawasan vendor Makan Bergizi Gratis (MBG) dan deteksi fraud dokumen

Aturan respons:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan informatif
- Untuk analisis gizi: tampilkan estimasi kandungan nutrisi secara terstruktur
- Sertakan rekomendasi praktis berdasarkan standar Kemenkes RI
- Jika ditanya di luar topik gizi/MBG, tetap bantu dengan ramah dan sopan
- Jangan berikan diagnosis medis definitif; sarankan konsultasi profesional
"""

# ──────────────────────────────────────────────────────────────
#  FLASK APP
# ──────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)   # izinkan request dari Next.js di port 3000


# ──────────────────────────────────────────────────────────────
#  HELPER
# ──────────────────────────────────────────────────────────────

def lm_chat(messages, system=None):
    payload = {
        "model":       MODEL_NAME,
        "messages":    [{"role": "system", "content": system or SYSTEM_PROMPT}] + messages,
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
        "stream":      False,
    }
    try:
        r = requests.post(CHAT_URL, json=payload, timeout=300)
        r.raise_for_status()
        data = r.json()
        return {
            "reply":  data["choices"][0]["message"]["content"],
            "model":  data.get("model", MODEL_NAME),
            "tokens": data.get("usage", {}),
            "error":  None,
        }
    except requests.ConnectionError:
        return {
            "reply": (
                "Tidak dapat terhubung ke LM Studio.\n\n"
                "Pastikan:\n"
                "1. LM Studio sudah dibuka\n"
                "2. Klik tombol Start Server di LM Studio\n"
                "3. Model Qwen3-4B sudah dimuat\n"
                f"4. Server berjalan di {LM_STUDIO_BASE}"
            ),
            "model": "error", "tokens": {}, "error": "connection_error",
        }
    except requests.Timeout:
        return {
            "reply":  "LM Studio timeout (>120 detik). Model mungkin masih loading, coba lagi.",
            "model":  "error", "tokens": {}, "error": "timeout",
        }
    except requests.HTTPError as e:
        return {
            "reply":  f"LM Studio HTTP error {e.response.status_code}: {e.response.text[:300]}",
            "model":  "error", "tokens": {}, "error": f"http_{e.response.status_code}",
        }
    except Exception as e:
        return {
            "reply":  f"Error tidak terduga: {e}",
            "model":  "error", "tokens": {}, "error": str(e),
        }


def lm_status():
    try:
        r = requests.get(MODELS_URL, timeout=5)
        r.raise_for_status()
        models = [m["id"] for m in r.json().get("data", [])]
        return {"status": "online", "models": models}
    except Exception as e:
        return {"status": "offline", "models": [], "error": str(e)}


# ──────────────────────────────────────────────────────────────
#  API ROUTES
# ──────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    """Root endpoint — verify backend is online."""
    return jsonify({
        "status": "online",
        "backend": "BG-AI Flask Backend",
        "endpoints": {
            "POST /api/chat": "Send messages to Qwen3-4B",
            "GET /api/status": "Check LM Studio connection",
            "GET /api/models": "List available models",
            "GET /api/config": "Server configuration",
        }
    })


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Terima pesan dari Next.js → teruskan ke LM Studio → kembalikan jawaban.

    Request JSON:
    {
        "messages": [
            {"role": "user",      "content": "..."},
            {"role": "assistant", "content": "..."},
            {"role": "user",      "content": "pesan terbaru"}
        ],
        "system_prompt": "override opsional"
    }

    Response JSON:
    {
        "reply":  "jawaban model",
        "model":  "qwen3-4b",
        "tokens": {"prompt_tokens": 80, "completion_tokens": 220, "total_tokens": 300},
        "error":  null
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        print(f"\n[DEBUG] Raw request body: {body}")
        
        messages = body.get("messages", [])
        system = body.get("system_prompt")
        
        system_preview = "None"
        if isinstance(system, str):
            system_preview = system[:50]
        elif system is not None:
            system_preview = str(system)[:50]

        print(f"[DEBUG] Messages: {messages}")
        print(f"[DEBUG] System prompt: {system_preview}...")

        if not messages or not isinstance(messages, list):
            error_msg = f"Error: 'messages' Field tidak valid. Dapatkan: {type(messages).__name__}={messages}. Expected: list"
            print(f"[ERROR] {error_msg}")
            return jsonify({
                "reply": error_msg,
                "model": "error",
                "tokens": {},
                "error": "invalid_messages_field"
            }), 400

        for i, m in enumerate(messages):
            print(f"[DEBUG] Message #{i}: {m}")
            
            if not isinstance(m, dict):
                error_msg = f"Error: Message #{i} harus object, bukan {type(m).__name__}"
                print(f"[ERROR] {error_msg}")
                return jsonify({
                    "reply": error_msg,
                    "model": "error",
                    "tokens": {},
                    "error": "invalid_message_type"
                }), 400
            
            if "role" not in m or "content" not in m:
                error_msg = f"Error: Message #{i} harus punya 'role' dan 'content'. Dapatkan keys: {list(m.keys())}"
                print(f"[ERROR] {error_msg}")
                return jsonify({
                    "reply": error_msg,
                    "model": "error",
                    "tokens": {},
                    "error": "missing_message_fields"
                }), 400
            
            if m["role"] not in ("user", "assistant", "system"):
                error_msg = f"Error: Role invalid di message #{i}: '{m['role']}'. Use: user, assistant, system"
                print(f"[ERROR] {error_msg}")
                return jsonify({
                    "reply": error_msg,
                    "model": "error",
                    "tokens": {},
                    "error": "invalid_role"
                }), 400

        print(f"[DEBUG] All messages valid. Sending to LM Studio...")
        result = lm_chat(messages, system)
        print(f"[DEBUG] LM Studio response: {result}")
        return jsonify(result)
    
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"[ERROR] {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "reply": error_msg,
            "model": "error",
            "tokens": {},
            "error": "server_error"
        }), 500


@app.route("/api/status", methods=["GET"])
def api_status():
    """Cek apakah LM Studio online."""
    return jsonify(lm_status())


@app.route("/api/models", methods=["GET"])
def api_models():
    """Daftar model yang tersedia di LM Studio."""
    s = lm_status()
    return jsonify({"status": s["status"], "models": s.get("models", [])})


@app.route("/api/config", methods=["GET"])
def api_config():
    """Konfigurasi server yang sedang berjalan."""
    return jsonify({
        "lm_studio_base": LM_STUDIO_BASE,
        "chat_url":       CHAT_URL,
        "model":          MODEL_NAME,
        "max_tokens":     MAX_TOKENS,
        "temperature":    TEMPERATURE,
    })


# ──────────────────────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"""
=================================================================
  BG-AI -  Flask Backend
=================================================================
  Port       : {FLASK_PORT}
  LM Studio  : {LM_STUDIO_BASE}
  Model      : {MODEL_NAME}
-----------------------------------------------------------------
  API Endpoint (dipanggil oleh Next.js)
    POST /api/chat    ->  Kirim pesan ke {MODEL_NAME}
    GET  /api/status  ->  Cek koneksi LM Studio
    GET  /api/models  ->  Daftar model tersedia
    GET  /api/config  ->  Info konfigurasi
=================================================================
""")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=FLASK_DEBUG)