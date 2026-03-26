"""
SATU-AI | NutriGuard — Flask Backend
=====================================
Install  : pip install flask requests
Jalankan : python app.py
Akses    : http://localhost:5000

Syarat:
  - LM Studio sudah dibuka
  - Server LM Studio diaktifkan (klik tombol Start Server)
  - Model Qwen3-4B sudah dimuat di LM Studio
  - LM Studio berjalan di port 1234 (default)

Struktur folder:
  satu-ai-flask/
  ├── app.py
  ├── requirements.txt
  └── templates/
      ├── index.html    ← halaman chat utama
      ├── login.html    ← login & register
      ├── auth.html     ← pengaturan akun
      ├── terms.html    ← ketentuan layanan
      └── 404.html      ← halaman error
"""

from flask import Flask, render_template, request, jsonify
import requests
import os

# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
#  Bisa di-override lewat environment variable
# ──────────────────────────────────────────────────────────────

LM_STUDIO_BASE = os.getenv("LM_STUDIO_BASE", "http://localhost:1234/v1")
MODEL_NAME     = os.getenv("MODEL_NAME",      "qwen3-4b")
MAX_TOKENS     = int(os.getenv("MAX_TOKENS",  "1024"))
TEMPERATURE    = float(os.getenv("TEMPERATURE", "0.7"))
FLASK_PORT     = int(os.getenv("FLASK_PORT",  "5000"))
FLASK_DEBUG    = os.getenv("FLASK_DEBUG",     "true").lower() == "true"

CHAT_URL   = LM_STUDIO_BASE + "/chat/completions"
MODELS_URL = LM_STUDIO_BASE + "/models"

SYSTEM_PROMPT = """Anda adalah SATU-AI NutriGuard, asisten AI multimodal Indonesia yang ahli dalam:
1. Analisis kandungan gizi makanan (kalori, protein, karbohidrat, lemak, serat, vitamin, mineral)
2. Perbandingan menu dengan standar AKG (Angka Kecukupan Gizi) Kemenkes RI
3. Deteksi defisiensi gizi dan rekomendasi perbaikan menu dalam Bahasa Indonesia
4. Pengawasan vendor Makan Bergizi Gratis (MBG) dan deteksi fraud dokumen

Aturan respons:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan informatif
- Untuk analisis gizi: tampilkan estimasi kandungan nutrisi secara terstruktur
- Sertakan rekomendasi praktis berdasarkan standar Kemenkes RI
- Jika ditanya di luar topik gizi/MBG, tetap bantu dengan ramah dan sopan
- Jangan berikan diagnosis medis definitif; sarankan konsultasi profesional untuk keputusan klinis
"""

# ──────────────────────────────────────────────────────────────
#  FLASK APP
# ──────────────────────────────────────────────────────────────

app = Flask(__name__, template_folder="templates", static_folder="statics")


# ──────────────────────────────────────────────────────────────
#  HELPER — komunikasi ke LM Studio
# ──────────────────────────────────────────────────────────────

def lm_chat(messages, system=None):
    """
    Kirim pesan ke LM Studio dan kembalikan respons.

    Parameter
    ---------
    messages : list[dict]
        Format: [{"role": "user"|"assistant", "content": "..."}]
    system : str, optional
        Override system prompt.

    Return
    ------
    dict
        {
          "reply":  str,
          "model":  str,
          "tokens": dict,
          "error":  str|None
        }
    """
    payload = {
        "model":       MODEL_NAME,
        "messages":    [{"role": "system", "content": system or SYSTEM_PROMPT}] + messages,
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
        "stream":      False,
    }

    try:
        r = requests.post(CHAT_URL, json=payload, timeout=3600)
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
            "reply":  "LM Studio timeout lebih dari 120 detik. Model mungkin masih loading, coba lagi.",
            "model":  "error", "tokens": {}, "error": "timeout",
        }

    except requests.HTTPError as e:
        return {
            "reply":  f"LM Studio error HTTP {e.response.status_code}: {e.response.text[:300]}",
            "model":  "error", "tokens": {}, "error": f"http_{e.response.status_code}",
        }

    except (KeyError, ValueError) as e:
        return {
            "reply":  f"Format respons LM Studio tidak dikenali: {e}",
            "model":  "error", "tokens": {}, "error": str(e),
        }

    except Exception as e:
        return {
            "reply":  f"Error tidak terduga: {e}",
            "model":  "error", "tokens": {}, "error": str(e),
        }


def lm_status():
    """Cek apakah LM Studio aktif dan model apa yang tersedia."""
    try:
        r = requests.get(MODELS_URL, timeout=5)
        r.raise_for_status()
        models = [m["id"] for m in r.json().get("data", [])]
        return {"status": "online", "models": models}
    except Exception as e:
        return {"status": "offline", "models": [], "error": str(e)}


# ──────────────────────────────────────────────────────────────
#  ROUTING HALAMAN
# ──────────────────────────────────────────────────────────────

@app.route("/")
@app.route("/chat")
def page_chat():
    return render_template("index.html")


@app.route("/login")
def page_login():
    return render_template("login.html")


@app.route("/auth")
@app.route("/settings")
def page_auth():
    return render_template("auth.html")


@app.route("/terms")
@app.route("/tos")
def page_terms():
    return render_template("terms.html")


@app.errorhandler(404)
def page_404(e):
    return render_template("404.html"), 404


# ──────────────────────────────────────────────────────────────
#  API ENDPOINT
# ──────────────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Terima pesan dari frontend, teruskan ke LM Studio, kembalikan jawaban.

    Request JSON
    ------------
    {
        "messages": [
            {"role": "user",      "content": "Hitung gizi nasi goreng"},
            {"role": "assistant", "content": "..."},
            {"role": "user",      "content": "pesan terbaru"}
        ],
        "system_prompt": "override opsional"
    }

    Response JSON
    -------------
    {
        "reply":  "jawaban model",
        "model":  "qwen3-4b",
        "tokens": {"prompt_tokens": 80, "completion_tokens": 220, "total_tokens": 300},
        "error":  null
    }
    """
    body     = request.get_json(silent=True) or {}
    messages = body.get("messages", [])
    system   = body.get("system_prompt")

    if not messages:
        return jsonify({"error": "Field 'messages' tidak boleh kosong"}), 400

    for m in messages:
        if "role" not in m or "content" not in m:
            return jsonify({"error": "Setiap message harus punya 'role' dan 'content'"}), 400
        if m["role"] not in ("user", "assistant", "system"):
            return jsonify({"error": f"Role tidak valid: '{m['role']}'"}), 400

    result = lm_chat(messages, system)
    return jsonify(result)


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
  SATU-AI | NutriGuard  -  Flask Backend
=================================================================
  Akses      : http://localhost:{FLASK_PORT}
  LM Studio  : {LM_STUDIO_BASE}
  Model      : {MODEL_NAME}
-----------------------------------------------------------------
  Rute Halaman
    /        ->  Chat utama   (index.html)
    /login   ->  Login        (login.html)
    /auth    ->  Akun         (auth.html)
    /terms   ->  Ketentuan    (terms.html)
-----------------------------------------------------------------
  API Endpoint
    POST /api/chat    ->  Kirim pesan ke Qwen3-4B
    GET  /api/status  ->  Cek koneksi LM Studio
    GET  /api/models  ->  Daftar model tersedia
    GET  /api/config  ->  Info konfigurasi server
=================================================================
  Tekan Ctrl+C untuk berhenti
=================================================================
""")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=FLASK_DEBUG)