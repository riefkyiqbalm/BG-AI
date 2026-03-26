// Scroll progress
window.addEventListener('scroll', () => {
  const max = document.body.scrollHeight - window.innerHeight;
  document.getElementById('progress').style.width = (window.scrollY / max * 100) + '%';

  // TOC active state
  const sections = document.querySelectorAll('.section[id]');
  const tocItems = document.querySelectorAll('.toc-item');
  sections.forEach((s, i) => {
    const rect = s.getBoundingClientRect();
    if (rect.top <= 100) {
      tocItems.forEach(t => t.classList.remove('active'));
      tocItems[i]?.classList.add('active');
    }
  });
});

function acceptTerms() {
  const btn = document.getElementById('acceptBtn');
  btn.textContent = '✓ Ketentuan Diterima';
  btn.classList.add('accepted');
  btn.disabled = true;
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}

// Smooth scroll for TOC
document.querySelectorAll('.toc-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});