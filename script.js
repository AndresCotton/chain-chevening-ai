// ===================================================================
// CHAIN -- interaction layer
// ===================================================================

/* ---------- Mobile nav ---------- */
(function(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mobileNav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- Face mosaic ---------- */
(function(){
  const mosaic = document.getElementById('mosaic');
  if(!mosaic) return;
  const count = 27;
  for(let i = 1; i <= count; i++){
    const idx = String(i).padStart(2, '0');
    const div = document.createElement('div');
    div.className = 'mosaic-face';
    const img = document.createElement('img');
    img.src = `assets/faces/face_${idx}.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    div.appendChild(img);
    mosaic.appendChild(div);
  }
})();

/* ---------- Constellation hero canvas ---------- */
(function(){
  const canvas = document.getElementById('constellation');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, nodes;
  const NODE_COUNT_DENSITY = 9000; // px^2 per node

  function resize(){
    const hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    const count = Math.max(24, Math.min(70, Math.floor((w * h) / NODE_COUNT_DENSITY)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.4 + 0.6
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    const maxDist = Math.min(160, w / 6);

    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i];
      if(!reduceMotion){
        a.x += a.vx; a.y += a.vy;
        if(a.x < 0 || a.x > w) a.vx *= -1;
        if(a.y < 0 || a.y > h) a.vy *= -1;
      }
      for(let j = i + 1; j < nodes.length; j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < maxDist){
          ctx.strokeStyle = `rgba(199, 154, 86, ${0.16 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for(const n of nodes){
      ctx.fillStyle = 'rgba(243, 238, 226, 0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); if(reduceMotion) draw(); });
})();

/* ---------- Contact form: copy-to-clipboard workflow ---------- */
(function(){
  const form = document.getElementById('contactForm');
  const hint = document.getElementById('formHint');
  const copyBtn = document.getElementById('copyEmail');
  const copyLabel = document.getElementById('copyEmailLabel');
  const EMAIL = 'andrescotton@gmail.com';

  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch(err){
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  }

  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const composed = `From: ${name} (${email})\n\n${message}\n\n-- sent via the CHAIN website, please reply to ${email}`;
      await copyText(composed);
      hint.innerHTML = `Copied. Paste this into a new email to <strong>${EMAIL}</strong> to send it.`;
    });
  }

  if(copyBtn){
    copyBtn.addEventListener('click', async () => {
      await copyText(EMAIL);
      copyBtn.classList.add('copied');
      const original = copyLabel.textContent;
      copyLabel.textContent = 'Copied to clipboard';
      setTimeout(() => {
        copyLabel.textContent = original;
        copyBtn.classList.remove('copied');
      }, 2200);
    });
  }
})();
