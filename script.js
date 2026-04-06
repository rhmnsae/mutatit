/* ══════════════════════════════════════════════════════
   ANIMATED FLOATING BOXES BACKGROUND
══════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const CELL = 40;
  const LINE_ALPHA = 0.05;
  const B_COLOR = '#272727';

  let boxes = [];
  const BOX_COUNT = 15;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBoxes();
  }

  function initBoxes() {
    boxes = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const speedMult = isMobile ? 0.6 : 1;

    for (let i = 0; i < count; i++) {
      boxes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isMobile ? (15 + Math.random() * 40) : (20 + Math.random() * 60),
        vx: (Math.random() - 0.5) * 0.5 * speedMult,
        vy: (Math.random() - 0.5) * 0.5 * speedMult,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.01 * speedMult
      });
    }
  }

  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* static grid lines (optional, kept subtle) */
    ctx.strokeStyle = B_COLOR;
    ctx.globalAlpha = LINE_ALPHA;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += CELL) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += CELL) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.width, y + 0.5);
    }
    ctx.stroke();

    /* floating boxes */
    ctx.globalAlpha = 0.15; // Subtle for background
    ctx.lineWidth = 3;
    ctx.strokeStyle = B_COLOR;

    boxes.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vRot;

      /* wrap around */
      if (b.x < -b.size) b.x = canvas.width;
      if (b.x > canvas.width) b.x = -b.size;
      if (b.y < -b.size) b.y = canvas.height;
      if (b.y > canvas.height) b.y = -b.size;

      ctx.save();
      ctx.translate(b.x + b.size / 2, b.y + b.size / 2);
      ctx.rotate(b.rot);
      ctx.strokeRect(-b.size / 2, -b.size / 2, b.size, b.size);
      ctx.restore();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════════ */
const cur = document.getElementById('cur'), curf = document.getElementById('curf');
let mx = 0, my = 0, fx = 0, fy = 0;

/* Disable custom cursor logic on non-precise pointer devices (touchscreens) */
const isTouch = !window.matchMedia('(pointer: fine)').matches;
if (isTouch) {
  if (cur) cur.style.display = 'none';
  if (curf) curf.style.display = 'none';
}

document.addEventListener('mousemove', e => {
  if (isTouch) return;
  mx = e.clientX; my = e.clientY;
  cur.style.transform = `translate(${mx}px,${my}px)`;

  /* hero grid pulse */
  const gp = document.getElementById('heroGridPulse');
  if (gp) {
    const hero = document.getElementById('hero');
    const r = hero.getBoundingClientRect();
    const px = ((mx - r.left) / r.width * 100).toFixed(1);
    const py = ((my - r.top) / r.height * 100).toFixed(1);
    gp.style.setProperty('--mx', px + '%');
    gp.style.setProperty('--my', py + '%');
  }

  /* trail dots */
  spawnTrail(mx, my);
});

(function af() {
  fx += (mx - fx) * .12; fy += (my - fy) * .12;
  curf.style.transform = `translate(${fx - 5}px,${fy - 5}px)`;
  requestAnimationFrame(af);
})();

document.querySelectorAll('a,button,.tool-card,.sub-card,.stat-col').forEach(el => {
  el.addEventListener('mouseenter', () => curf.classList.add('hov'));
  el.addEventListener('mouseleave', () => curf.classList.remove('hov'));
});

/* click effect */
document.addEventListener('click', e => {
  if (isTouch) return;
  curf.classList.add('click');
  setTimeout(() => curf.classList.remove('click'), 200);
  spawnExplosion(e.clientX, e.clientY);
});

/* ── Cursor trail ─────────────────────────────────── */
let trailTimer = 0;
function spawnTrail(x, y) {
  const now = Date.now();
  if (now - trailTimer < 45) return;
  trailTimer = now;
  const d = document.createElement('div');
  d.className = 'cursor-trail';
  d.style.transform = `translate(${x - 2}px,${y - 2}px)`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 600);
}

/* ── Cursor explosion ─────────────────────────────── */
function spawnExplosion(x, y) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'exp-particle';
    const angle = (i / 10) * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    p.style.cssText = `
      transform:translate(${x - 2}px,${y - 2}px);
      --tx:${Math.cos(angle) * dist}px;
      --ty:${Math.sin(angle) * dist}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }
}

/* ══════════════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════════════ */
let pct = 0;
const ldNum = document.getElementById('ldNum'), ldFill = document.getElementById('ldFill');
// Calibrated for ~1.5 seconds total
const ldInt = setInterval(() => {
  let inc = (pct < 80) ? (Math.random() * 2.5 + 1.0) : (Math.random() * 1.5 + 0.5);
  pct += inc;
  
  if (pct >= 100) { 
    pct = 100; 
    clearInterval(ldInt); 
    setTimeout(doneLoading, 200); 
  }
  
  ldNum.textContent = String(Math.floor(pct)).padStart(3, '0');
  ldFill.style.width = pct + '%';
}, 22);

function doneLoading() {
  document.getElementById('loader').classList.add('out');
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('nav').classList.add('show');
    initHero();
  }, 700);
}

/* ══════════════════════════════════════════════════════
   HERO INIT
══════════════════════════════════════════════════════ */
function initHero() {
  ['hl1', 'hl2'].forEach((id, i) =>
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('in');
    }, i * 200));

  setTimeout(() => revealWords(), 660);
  setTimeout(() => document.getElementById('hBtns').classList.add('in'), 820);
  document.querySelectorAll('.stat-col').forEach((el, i) =>
    setTimeout(() => el.classList.add('in'), 980 + i * 90));
  setTimeout(runCounters, 1100);

  /* r-rows stagger */
  document.querySelectorAll('.r-row').forEach((el, i) => {
    el.style.transitionDelay = (i * .12 + 1) + 's';
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none' }, 100 + i * 120 + 1000);
  });

  /* typewriter on r-big */
  setTimeout(() => typewrite(document.getElementById('rBigType'), 'SUBSCRIBE'), 600);

  /* spawn particles */
  spawnHeroParticles();
}

/* ── Word-by-word hero desc ───────────────────────── */
function revealWords() {
  const el = document.getElementById('hDesc');
  if (!el) return;
  // Use the data-i18n key to get the correct text if available
  const lang = window.currentLang || 'id';
  const key = el.getAttribute('data-i18n');
  const text = (translations && translations[lang] && translations[lang][key]) 
               ? translations[lang][key] 
               : el.innerText.trim();
               
  el.innerHTML = text.split(' ').map(w =>
    `<span style="display:inline-flex;opacity:0;transition:opacity .3s;white-space:pre-wrap">${w} </span>`
  ).join('');
  el.style.opacity = '1';
  el.querySelectorAll('span').forEach((s, i) =>
    setTimeout(() => s.style.opacity = '1', i * 38));
}

/* ── Hero floating particles ──────────────────────── */
function spawnHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random() * 100}%;
      top:${20 + Math.random() * 70}%;
      --dur:${6 + Math.random() * 10}s;
      --delay:${Math.random() * 8}s;
      --dx:${-20 + Math.random() * 40}px;
      --dx2:${-10 + Math.random() * 20}px;
    `;
    container.appendChild(p);
  }
}

/* ── Typewriter ───────────────────────────────────── */
function typewrite(el, text, speed = 80) {
  if (!el) return;
  el.innerHTML = '';
  let i = 0;
  const iv = setInterval(() => {
    if (i >= text.length) { clearInterval(iv); return }
    el.textContent += text[i++];
  }, speed);
}

/* ══════════════════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════════════════ */
function runCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const t = parseInt(el.dataset.target);
        let c = 0;
        const duration = 1500; // 1.5s
        const step = duration / 60; // 60fps
        const increment = t / (duration / 16);

        const iv = setInterval(() => {
          c += increment;
          if (c >= t) {
            c = t;
            clearInterval(iv);
          }
          el.textContent = Math.floor(c);
        }, 16);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.js-count').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════
   HOW-STEP number count up on enter
══════════════════════════════════════════════════════ */
document.querySelectorAll('.hs-n').forEach(el => {
  const n = parseInt(el.dataset.n);
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let c = 0;
      const iv = setInterval(() => {
        c++; el.textContent = String(c).padStart(2, '0');
        if (c >= n) clearInterval(iv);
      }, 60);
      obs.unobserve(el);
    }
  }, { threshold: .5 });
  obs.observe(el);
});

/* ══════════════════════════════════════════════════════
   SCROLL
══════════════════════════════════════════════════════ */
let lastY = 0;
const nav = document.getElementById('nav'),
  scrollProg = document.getElementById('scrollProg');

window.addEventListener('scroll', () => {
  const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProg.style.width = (y / max * 100) + '%';
  nav.classList.add('show');
  lastY = y;
});



/* ══════════════════════════════════════════════════════
   INTERSECTION OBSERVER (main reveal)
══════════════════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  });
}, { threshold: .1 });

document.querySelectorAll(
  '.rv,.rv-l,.rv-r,.tool-card,.sub-card,.req-item,.how-step,.stat-col,.rv-clip'
).forEach(el => io.observe(el));

/* stagger delays */
document.querySelectorAll('.tool-card').forEach((el, i) => el.style.transitionDelay = i * 70 + 'ms');
document.querySelectorAll('.sub-card').forEach((el, i) => el.style.transitionDelay = i * 130 + 'ms');
document.querySelectorAll('.how-step').forEach((el, i) => el.style.transitionDelay = i * 90 + 'ms');
document.querySelectorAll('.req-item').forEach((el, i) => el.style.transitionDelay = i * 100 + 'ms');

/* ══════════════════════════════════════════════════════
   TEXT SCRAMBLE
══════════════════════════════════════════════════════ */
const CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el, text) {
  if (el.dataset.rafId) cancelAnimationFrame(parseInt(el.dataset.rafId));

  const oldText = el.dataset.origText || el.innerText;
  el.dataset.origText = text;

  const q = Array.from({ length: Math.max(oldText.length, text.length) }, (_, i) => ({
    from: oldText[i] || '', to: text[i] || '',
    start: Math.floor(Math.random() * 10), end: Math.floor(Math.random() * 10) + 14, char: ''
  }));
  let frame = 0;
  const tick = () => {
    let out = '', done = 0;
    for (const q2 of q) {
      if (frame >= q2.end) { out += q2.to; done++ }
      else if (frame >= q2.start) {
        if (Math.random() < .3) q2.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        out += `<span style="opacity:.45">${q2.char}</span>`;
      } else out += q2.from;
    }
    el.innerHTML = out;
    if (done < q.length) { 
      el.dataset.rafId = requestAnimationFrame(tick).toString();
    } else {
      delete el.dataset.rafId;
    }
    frame++;
  };
  el.dataset.rafId = requestAnimationFrame(tick).toString();
}

/* Removed nav logo scramble to preserve SVG branding */

/* scramble CTA big on enter */
const ctaBig = document.getElementById('ctaBig');
if (ctaBig) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) scramble(ctaBig, 'MUTATIT');
  }, { threshold: .5 }).observe(ctaBig);
}

/* ══════════════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════════════ */
document.querySelectorAll('.btn,.nav-cta,.sub-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2,
      y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * .14}px,${y * .14}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ══════════════════════════════════════════════════════
   HERO H1 3D PARALLAX
══════════════════════════════════════════════════════ */
const heroL = document.querySelector('.hero-l'), heroH1 = document.getElementById('heroH1');
if (heroL && heroH1) {
  heroL.addEventListener('mousemove', e => {
    const r = heroL.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    heroH1.style.transform = `translate(${x * 10}px,${y * 7}px)`;
  });
  heroL.addEventListener('mouseleave', () => heroH1.style.transform = '');
}

/* ══════════════════════════════════════════════════════
   3D TILT on tool cards
══════════════════════════════════════════════════════ */
document.querySelectorAll('.tool-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s var(--ease), opacity .6s var(--ease)';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .12s linear';
    /* shake animation */
    card.animate([
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(2px)' },
      { transform: 'none' }
    ], { duration: 200, easing: 'ease-in-out' });
  });
});

/* ══════════════════════════════════════════════════════
   TICKER pause on hover
══════════════════════════════════════════════════════ */
document.querySelectorAll('.ticker').forEach(tk => {
  const tr = tk.querySelector('.tk-track,.bm-track');
  if (!tr) return;
  tk.addEventListener('mouseenter', () => tr.style.animationPlayState = 'paused');
  tk.addEventListener('mouseleave', () => tr.style.animationPlayState = 'running');
});

/* ══════════════════════════════════════════════════════
   TITLE SYNTAX HOVER
══════════════════════════════════════════════════════ */
function initSyntaxHover() {
  document.querySelectorAll('.hl-i, .s-title, .how-title, .cta-h').forEach(title => {
    // Always sync with current text/i18n
    const lang = window.currentLang || 'id';
    const key = title.getAttribute('data-i18n');
    const baseText = (key && translations && translations[lang] && translations[lang][key])
                     ? translations[lang][key]
                     : title.innerText.trim();
    
    title.dataset.origTextBase = baseText;

    // Remove old listeners to avoid duplicates if re-init
    title.onmouseenter = null;
    title.onmouseleave = null;

    title.addEventListener('mouseenter', () => {
      const base = title.dataset.origTextBase;
      scramble(title, base);
    });

    title.addEventListener('mouseleave', () => {
      const base = title.dataset.origTextBase;
      scramble(title, base);
    });
  });
}
initSyntaxHover();

/* ══════════════════════════════════════════════════════
   SUB BTN RIPPLE (fixed: @keyframes rip is now in CSS)
══════════════════════════════════════════════════════ */
document.querySelectorAll('.sub-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;width:8px;height:8px;
      background:rgba(240,249,247,.5);border-radius:50%;
      top:${e.clientY - r.top - 4}px;
      left:${e.clientX - r.left - 4}px;
      transform:scale(0);
      animation:rip .5s ease forwards;
      pointer-events:none;
    `;
    btn.style.position = 'relative'; btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
  });
});

/* ══════════════════════════════════════════════════════
   SPLIT TEXT REVEAL for section titles on scroll
══════════════════════════════════════════════════════ */
function splitAndReveal(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';
  const text = el.textContent.trim();
  el.innerHTML = '';
  /* Use a more robust split to catch spaces, newlines, etc. */
  const words = text.split(/\s+/);
  let charIdx = 0;
  words.forEach((word, wi) => {
    const wordWrap = document.createElement('span');
    wordWrap.style.cssText = 'display:inline-flex;white-space:nowrap;margin-right:0.3em;';
    word.split('').forEach(ch => {
      const wrap = document.createElement('span');
      wrap.className = 'split-letter';
      const inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = ch;
      inner.style.transitionDelay = (charIdx * 0.022) + 's';
      charIdx++;
      wrap.appendChild(inner);
      wordWrap.appendChild(wrap);
    });
    el.appendChild(wordWrap);
  });
}

const splitIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      splitAndReveal(e.target);
      setTimeout(() => {
        e.target.querySelectorAll('.char').forEach(c => c.classList.add('in'));
      }, 50);
      splitIO.unobserve(e.target);
    }
  });
}, { threshold: .3 });

document.querySelectorAll('.s-title, .how-title, .cta-h, .req-big').forEach(el => {
  el.style.overflow = 'visible';
  splitIO.observe(el);
});

/* ══════════════════════════════════════════════════════
   STAT COLUMN scramble on hover
══════════════════════════════════════════════════════ */
document.querySelectorAll('.stat-col').forEach(col => {
  const n = col.querySelector('.stat-n');
  if (!n) return;
  // Initialize target text securely ONCE so hover doesn't read interrupted HTML tags
  if (!n.dataset.scrambleTarget) {
    n.dataset.scrambleTarget = n.classList.contains('js-count') ? n.dataset.target : n.innerText.trim();
  }
  
  col.addEventListener('mouseenter', () => {
    const targetText = n.dataset.scrambleTarget;
    if (targetText) scramble(n, targetText);
  });
});

/* ══════════════════════════════════════════════════════
   REQ ITEM: animated connector
══════════════════════════════════════════════════════ */
document.querySelectorAll('.req-item').forEach(item => {
  const c = document.createElement('div');
  c.className = 'req-connector';
  item.appendChild(c);
});

/* ══════════════════════════════════════════════════════
   CTA ROW: staggered reveal
══════════════════════════════════════════════════════ */
const ctaRowIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.cta-row').forEach((row, i) => {
        row.style.opacity = '0'; row.style.transform = 'translateX(20px)';
        row.style.transition = `opacity .5s ${i * .1}s, transform .5s ${i * .1}s`;
        setTimeout(() => { row.style.opacity = '1'; row.style.transform = 'none' }, 50 + i * 100);
      });
      ctaRowIO.unobserve(e.target);
    }
  });
}, { threshold: .3 });
const ctaR = document.querySelector('.cta-r');
if (ctaR) ctaRowIO.observe(ctaR);

/* ══════════════════════════════════════════════════════
   SUB CARD hover: number count-up
══════════════════════════════════════════════════════ */
document.querySelectorAll('.sub-card').forEach(card => {
  const price = card.querySelector('.sub-price');
  if (!price) return;
  const orig = price.textContent;
  card.addEventListener('mouseenter', () => {
    price.style.animation = 'badgepop .3s var(--bounce)';
    setTimeout(() => price.style.animation = '', 300);
  });
});

/* ══════════════════════════════════════════════════════
   FOOTER LINKS: slide in on scroll
══════════════════════════════════════════════════════ */
const ftIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('li').forEach((li, i) => {
        li.style.opacity = '0'; li.style.transform = 'translateY(12px)';
        li.style.transition = `opacity .4s ${i * .07}s, transform .4s ${i * .07}s`;
        setTimeout(() => { li.style.opacity = '1'; li.style.transform = 'none' }, 50 + i * 70);
      });
      ftIO.unobserve(e.target);
    }
  });
}, { threshold: .2 });
document.querySelectorAll('.ft-links').forEach(ul => ftIO.observe(ul));

/* ══════════════════════════════════════════════════════
   LANGUAGE SWITCHER SYNC
   Add a listener for language changes to re-trigger reveals
══════════════════════════════════════════════════════ */
document.addEventListener('langChanged', () => {
  revealWords();
  initSyntaxHover();
  
  // Update stat scramble targets
  document.querySelectorAll('.stat-col').forEach(col => {
    const n = col.querySelector('.stat-n');
    if (!n) return;
    const lang = window.currentLang || 'id';
    const key = n.getAttribute('data-i18n');
    if (key && translations[lang][key]) {
       n.dataset.scrambleTarget = translations[lang][key];
    }
  });
});

/* ══════════════════════════════════════════════════════
   MOBILE MENU TOGGLE
══════════════════════════════════════════════════════ */
(function() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  
  if (!toggle || !menu) return;
  
  function toggleMenu() {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  }
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking outside of it
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) {
      toggleMenu();
    }
  });
  
  // Close menu when clicking links
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
  
  // Close menu on language change
  document.addEventListener('langChanged', () => {
    if (menu.classList.contains('open')) {
      toggleMenu();
    }
  });
})();

/* ══════════════════════════════════════════════════════
   CLEAN URL NAVIGATION (Remove '#' from address bar)
══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '') return;
    
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const nav = document.getElementById('nav');
      const navHeight = nav ? nav.offsetHeight : 64;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update history without hash
      window.history.pushState(null, null, window.location.pathname);
    }
  });
});

