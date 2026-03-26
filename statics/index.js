let msgCount = 3;
let currentMode = 'nutri';

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function setInputMode(mode, btn) {
  document.querySelectorAll('.input-mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const dz = document.getElementById('dropZone');
  dz.classList.toggle('visible', mode !== 'text');
}

function switchMode(mode, btn) {
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMode = mode;
}

function fillPrompt(text) {
  const inp = document.getElementById('msgInput');
  inp.value = text;
  autoResize(inp);
  inp.focus();
  document.getElementById('welcomeState').style.display = 'none';
}

function startNewChat() {
  document.getElementById('chatArea').innerHTML = '';
  const w = document.createElement('div');
  w.className = 'welcome';
  w.id = 'welcomeState';
  w.innerHTML = document.querySelector('.welcome').innerHTML;
  document.getElementById('chatArea').appendChild(w);
  msgCount = 0;
}

function sendMessage() {
  const inp = document.getElementById('msgInput');
  const text = inp.value.trim();
  if (!text) return;

  // Hide welcome
  const ws = document.getElementById('welcomeState');
  if (ws) ws.style.display = 'none';

  const area = document.getElementById('chatArea');
  const now = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

  // User message
  area.innerHTML += `
    <div class="msg user">
      <div class="msg-avatar">👤</div>
      <div class="msg-body">
        <div class="msg-bubble">${text}</div>
        <div class="msg-time">${now}</div>
      </div>
    </div>`;

  inp.value = ''; inp.style.height = 'auto'; msgCount++;
  document.getElementById('msgCount').textContent = msgCount;

  // Typing indicator
  area.innerHTML += `
    <div class="msg bot" id="typing">
      <div class="msg-avatar">🌿</div>
      <div class="msg-body">
        <div class="msg-bubble" style="padding:14px 16px">
          <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>`;
  area.scrollTop = area.scrollHeight;

  // Simulated AI response
  setTimeout(() => {
    document.getElementById('typing')?.remove();
    let resp = '';
    if (text.toLowerCase().includes('gizi') || text.toLowerCase().includes('nasi') || text.toLowerCase().includes('menu') || text.toLowerCase().includes('foto') || text.toLowerCase().includes('makan')) {
      resp = `<div>Analisis gizi selesai untuk menu yang Anda berikan. Berikut estimasi kandungan nutrisi per porsi:</div>
      <div class="nutri-card">
        <div class="nutri-title">🔬 Hasil Analisis NutriGuard — Qwen-VL</div>
        <div class="nutri-row"><span class="nutri-name">Kalori</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--gold)">487 kkal</span><div class="nutri-bar-wrap"><div class="nutri-bar warn" style="width:78%"></div></div></div></div>
        <div class="nutri-row"><span class="nutri-name">Protein</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--green)">22.4 g</span><div class="nutri-bar-wrap"><div class="nutri-bar" style="width:65%"></div></div></div></div>
        <div class="nutri-row"><span class="nutri-name">Karbohidrat</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--teal)">68.1 g</span><div class="nutri-bar-wrap"><div class="nutri-bar" style="width:82%"></div></div></div></div>
        <div class="nutri-row"><span class="nutri-name">Lemak</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--teal)">14.2 g</span><div class="nutri-bar-wrap"><div class="nutri-bar" style="width:45%"></div></div></div></div>
        <div class="nutri-row"><span class="nutri-name">Serat</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--red)">1.8 g ⚠</span><div class="nutri-bar-wrap"><div class="nutri-bar low" style="width:22%"></div></div></div></div>
        <div class="nutri-row"><span class="nutri-name">Zat Besi</span><div style="display:flex;align-items:center;gap:10px"><span class="nutri-val" style="color:var(--red)">2.1 mg ⚠</span><div class="nutri-bar-wrap"><div class="nutri-bar low" style="width:30%"></div></div></div></div>
      </div>
      <div style="margin-top:12px;font-size:13px;color:var(--muted)">⚠ <strong style="color:var(--gold)">Defisiensi terdeteksi:</strong> Serat dan Zat Besi di bawah standar AKG Kemenkes untuk anak usia 7–9 tahun. Disarankan menambahkan sayuran hijau (bayam/brokoli) dan buah-buahan lokal.</div>`;
    } else if (text.toLowerCase().includes('vendor') || text.toLowerCase().includes('dokumen') || text.toLowerCase().includes('fraud')) {
      resp = `Dokumen vendor telah dianalisis menggunakan modul SATU-AI.<br><br>
      <div class="nutri-card">
        <div class="nutri-title">🔍 Hasil Fraud Detection Engine</div>
        <div class="nutri-row"><span class="nutri-name">Skor Risiko</span><span class="nutri-val" style="color:var(--gold)">42/100 — Sedang</span></div>
        <div class="nutri-row"><span class="nutri-name">Kelengkapan Dok.</span><span class="nutri-val" style="color:var(--green)">87%</span></div>
        <div class="nutri-row"><span class="nutri-name">Anomali Anggaran</span><span class="nutri-val" style="color:var(--gold)">1 item flagged</span></div>
        <div class="nutri-row"><span class="nutri-name">Status Izin</span><span class="nutri-val" style="color:var(--teal)">Perlu Verifikasi Lanjut</span></div>
      </div>
      <div style="margin-top:10px;font-size:13px;color:var(--muted)">Smart Ticket #VND-2847 telah diterbitkan untuk tindak lanjut petugas lapangan.</div>`;
    } else {
      resp = `Halo! Saya SATU-AI NutriGuard, asisten AI multimodal untuk analisis gizi dan pengawasan vendor MBG. Anda bisa mengirimkan:<br><br>
      • 📸 <strong>Foto makanan</strong> — analisis gizi otomatis<br>
      • 📝 <strong>Deskripsi menu</strong> — estimasi kalori & nutrisi<br>
      • 🎬 <strong>Video sajian</strong> — identifikasi bahan makanan<br>
      • 📄 <strong>Dokumen vendor</strong> — verifikasi & deteksi fraud<br><br>
      Ada yang bisa saya bantu?`;
    }

    area.innerHTML += `
      <div class="msg bot">
        <div class="msg-avatar">🌿</div>
        <div class="msg-body">
          <div class="msg-bubble">${resp}</div>
          <div class="msg-time">${new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})} · Qwen-VL + Sahabat AI</div>
        </div>
      </div>`;
    msgCount++;
    document.getElementById('msgCount').textContent = msgCount;
    area.scrollTop = area.scrollHeight;
  }, 1800);

  area.scrollTop = area.scrollHeight;
}

function handleFile(input) {
  if (input.files[0]) {
    const name = input.files[0].name;
    document.getElementById('msgInput').value = `[File: ${name}] Tolong analisis file ini.`;
    autoResize(document.getElementById('msgInput'));
  }
}

document.getElementById('dropZone').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});