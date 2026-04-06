/**
 * Happy Birthday – Main Script
 * Vanilla JS, no jQuery dependency
 * ──────────────────────────────────────────────────────────────
 * Features:
 *  - URL ?name= personalization + live name-input fallback
 *  - Smooth loader exit (fade + scale)
 *  - typed.js wishes with replay & click-to-skip
 *  - Canvas confetti (ribbons + papers) – vibrant pastel palette
 *  - Custom lightweight canvas snow (25 particles)
 *  - Balloon border rise animation
 *  - Background music with mute toggle + localStorage pref
 *  - Copy-link button with toast notification
 *  - Staggered fade-in for content items
 * ──────────────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   0.  UTILITY HELPERS
══════════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const rand  = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

/** Show a brief toast notification */
function showToast(msg, type = 'default', duration = 3000) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = `toast show${type !== 'default' ? ' ' + type : ''}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.className = 'toast';
  }, duration);
}

/* ══════════════════════════════════════════════════════════════
   1.  NAME PERSONALIZATION
══════════════════════════════════════════════════════════════ */
const urlParams  = new URLSearchParams(window.location.search);
let   personName = urlParams.get('name') || '';

const nameTextEl    = $('#nameText');      // big display name
const nameInEl      = null;               // input removed
const naeEl         = $('#nae');           // italic name inside typed strings

function applyName(name) {
  const trimmed = name ? name.trim() : '';
  const display = trimmed || 'Santos';   // default: Santos
  personName    = display;

  // Update DOM
  if (nameTextEl) nameTextEl.textContent = display;
  if (naeEl)      naeEl.textContent      = display;

  // Pre-fill typed-strings element that says "Happy Birthday <name>"
  const hbStr = $('#typed-strings p:first-child');
  if (hbStr) hbStr.innerHTML = `Happy Birthday <i id="nae">${display}</i>! 🎂`;

  // Update URL via pushState
  if (trimmed && history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set('name', trimmed);
    history.replaceState(null, '', url.toString());
  }
}

// Apply name from URL or fall back to Santos
applyName(personName);

/* ══════════════════════════════════════════════════════════════
   2.  LOADER → START FLOW
══════════════════════════════════════════════════════════════ */
const loader      = $('#loader');
const mainContent = $('#mainContent');
const playBtn     = $('#play');
const musicBtn    = $('#musicBtn');
const audio       = $('#birthdaySong');

playBtn.addEventListener('click', () => {
  if (nameInEl && nameInEl.value && nameInEl.value.trim()) {
    applyName(nameInEl.value.trim());
  }

  // 1. Loader fade-out
  loader.classList.add('fade-out');
  setTimeout(() => {
    loader.setAttribute('hidden', '');
  }, 800);

  // 2. Show main + stagger-fade items
  mainContent.removeAttribute('hidden');
  requestAnimationFrame(() => {
    document.querySelectorAll('.fade-in-item').forEach(el => {
      el.classList.add('visible');
    });
  });

  // 3. Balloon animation
  const balloonBorder = $('#balloonBorder');
  if (balloonBorder) {
    setTimeout(() => balloonBorder.classList.add('rise'), 200);
  }

  // 4. Play music (handle autoplay policy)
  startMusic();

  // 5. Start snow
  initSnow();
});

/* ══════════════════════════════════════════════════════════════
   3.  MUSIC CONTROL
══════════════════════════════════════════════════════════════ */
const musicIcon = $('#musicIcon');
let   isMuted   = localStorage.getItem('bdayMuted') === 'true';

function startMusic() {
  if (!audio) return;
  audio.volume = isMuted ? 0 : 0.75;
  audio.muted  = false;

  audio.play().then(() => {
    musicBtn.removeAttribute('hidden');
    syncMusicBtn();
  }).catch(() => {
    // Autoplay blocked – show button anyway; user can click to play
    musicBtn.removeAttribute('hidden');
    syncMusicBtn();
  });
}

function syncMusicBtn() {
  if (isMuted) {
    musicIcon.className    = 'fas fa-volume-xmark';
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('muted');
    musicBtn.setAttribute('aria-label', 'Unmute music');
    musicBtn.querySelector('.music-tooltip').textContent = 'Unmute music';
  } else {
    musicIcon.className    = 'fas fa-volume-high';
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('muted');
    musicBtn.setAttribute('aria-label', 'Mute music');
    musicBtn.querySelector('.music-tooltip').textContent = 'Mute music';
  }
}

musicBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  localStorage.setItem('bdayMuted', isMuted);
  audio.volume = isMuted ? 0 : 0.75;
  syncMusicBtn();
  showToast(isMuted ? '🔇 Music muted' : '🔊 Music on!');
});

/* ══════════════════════════════════════════════════════════════
   4.  TYPED.JS WISHES
══════════════════════════════════════════════════════════════ */
let typedInstance = null;

function initTyped() {
  if (typedInstance) typedInstance.destroy();

  typedInstance = new Typed('#typed', {
    stringsElement: '#typed-strings',
    typeSpeed: 35,
    backSpeed: 18,
    backDelay: 1800,
    startDelay: 300,
    loop: true,
    smartBackspace: true,
    onComplete: () => {
      // Show share button once the first cycle completes
      const shareWrap = $('#shareWrap');
      if (shareWrap) shareWrap.removeAttribute('hidden');
    }
  });
}

// Initialise after DOM is ready
document.addEventListener('DOMContentLoaded', initTyped);

// Click typing area to fast-forward / pause effect aesthetically
$('#typed')?.addEventListener('click', () => {
  if (typedInstance) {
    typedInstance.toggle();
  }
});

// Replay button
$('#replayBtn')?.addEventListener('click', () => {
  initTyped();
  showToast('🎉 Replaying wishes!');
});

/* ══════════════════════════════════════════════════════════════
   5.  COPY LINK BUTTON
══════════════════════════════════════════════════════════════ */
$('#copyLinkBtn')?.addEventListener('click', async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast('🔗 Link copied! Share the joy 🎉', 'success');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('🔗 Link copied!', 'success');
  }
});

/* ══════════════════════════════════════════════════════════════
   6.  CANVAS CONFETTI
   Physics-based ribbons + papers – vibrant pastel palette
══════════════════════════════════════════════════════════════ */
(function initConfetti() {
  const canvas  = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const DPR     = window.devicePixelRatio || 1;
  const PI      = Math.PI;
  const TWO_PI  = PI * 2;

  // Pastel + vibrant palette pairs [front, back]
  const COLORS = [
    ['#ff6b9d', '#b5004e'],
    ['#ffd700', '#b47e00'],
    ['#c9a0ff', '#7b2ff7'],
    ['#4ecdc4', '#007d78'],
    ['#ff8c6b', '#c03a00'],
    ['#a8edea', '#0099a8'],
    ['#fed9b7', '#c86a00'],
    ['#f8c8e4', '#c73a8c'],
  ];

  let W, H;
  const PAPER_COUNT  = 60;
  const RIBBON_COUNT = 12;

  function resize() {
    W = canvas.width  = window.innerWidth  * DPR;
    H = canvas.height = window.innerHeight * DPR;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Confetti Paper (rectangular flake) ── */
  function Paper() {
    this.reset = () => {
      const ci       = randInt(0, COLORS.length - 1);
      this.front     = COLORS[ci][0];
      this.back      = COLORS[ci][1];
      this.x         = rand(0, window.innerWidth);
      this.y         = rand(-window.innerHeight, 0);
      this.w         = rand(6, 14);
      this.h         = rand(4, 10);
      this.spin      = rand(1, 8) * (Math.random() < 0.5 ? 1 : -1);
      this.angle     = rand(0, TWO_PI);
      this.cosA      = 1;
      this.xV        = rand(-2, 2);
      this.yV        = rand(1.5, 4.5);
      this.drag      = rand(0.98, 0.999);
      this.oscSpeed  = rand(0.5, 2);
      this.oscDist   = rand(20, 60);
      this.time      = rand(0, TWO_PI);
    };
    this.reset();

    this.update = dt => {
      this.time  += this.oscSpeed * dt;
      this.angle += this.spin * dt;
      this.cosA   = Math.cos(this.angle);
      this.x     += Math.cos(this.time) * this.oscDist * dt + this.xV;
      this.xV    *= this.drag;
      this.y     += this.yV;
      if (this.y > window.innerHeight + 20) this.reset();
    };

    this.draw = () => {
      const sx = this.x * DPR;
      const sy = this.y * DPR;
      const hw = this.w * DPR * 0.5;
      const hh = this.h * DPR * 0.5 * Math.abs(this.cosA);
      ctx.fillStyle = this.cosA > 0 ? this.front : this.back;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(this.angle);
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    };
  }

  /* ── Confetti Ribbon ── */
  function Ribbon() {
    this.reset = () => {
      const ci       = randInt(0, COLORS.length - 1);
      this.front     = COLORS[ci][0];
      this.back      = COLORS[ci][1];
      this.x         = rand(0, window.innerWidth);
      this.y         = -rand(10, window.innerHeight);
      this.len       = randInt(8, 16);
      this.seg       = [];
      for (let i = 0; i < this.len; i++) this.seg[i] = { x: this.x, y: this.y - i * 8 };
      this.xV        = rand(-1, 1);
      this.yV        = rand(1.5, 3.5);
      this.oscSpeed  = rand(1.5, 3);
      this.oscDist   = rand(30, 70);
      this.time      = rand(0, TWO_PI);
      this.thick     = rand(3, 8);
    };
    this.reset();

    this.update = dt => {
      this.time += this.oscSpeed * dt;
      this.y    += this.yV;
      this.x    += Math.cos(this.time) * this.oscDist * dt + this.xV;
      this.seg[0] = { x: this.x, y: this.y };
      for (let i = 1; i < this.len; i++) {
        const prev = this.seg[i - 1];
        const curr = this.seg[i];
        const dx   = prev.x - curr.x;
        const dy   = prev.y - curr.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const norm = { x: dx / dist, y: dy / dist };
        this.seg[i] = { x: prev.x - norm.x * 8, y: prev.y - norm.y * 8 };
      }
      if (this.y > window.innerHeight + this.len * 8) this.reset();
    };

    this.draw = () => {
      ctx.strokeStyle = this.front;
      ctx.lineWidth   = this.thick * DPR;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(this.seg[0].x * DPR, this.seg[0].y * DPR);
      for (let i = 1; i < this.len; i++) {
        ctx.lineTo(this.seg[i].x * DPR, this.seg[i].y * DPR);
      }
      ctx.stroke();
    };
  }

  const papers  = Array.from({ length: PAPER_COUNT },  () => new Paper());
  const ribbons = Array.from({ length: RIBBON_COUNT }, () => new Ribbon());

  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = now;

    ctx.clearRect(0, 0, W, H);
    const t = dt;
    papers.forEach(p  => { p.update(t); p.draw(); });
    ribbons.forEach(r => { r.update(t); r.draw(); });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════════════
   7.  LIGHTWEIGHT CANVAS SNOW (25 particles)
   Replaces magic-snowflakes CDN – no third-party dependency
══════════════════════════════════════════════════════════════ */
function initSnow() {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const DPR    = window.devicePixelRatio || 1;
  const COUNT  = 25;

  function resize() {
    canvas.width  = window.innerWidth  * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const flakes = Array.from({ length: COUNT }, () => ({
    x:     rand(0, window.innerWidth),
    y:     rand(-50, 0),
    r:     rand(2, 7),
    yV:    rand(0.3, 1.2),
    xV:    rand(-0.3, 0.3),
    alpha: rand(0.4, 0.9),
    color: Math.random() < 0.5 ? '#ffd700' : '#fff',
  }));

  function drawSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x * DPR, f.y * DPR, f.r * DPR, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.globalAlpha = f.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      f.y += f.yV;
      f.x += f.xV;
      if (f.y > window.innerHeight + 10) {
        f.y = -10;
        f.x = rand(0, window.innerWidth);
      }
    });
    requestAnimationFrame(drawSnow);
  }

  drawSnow();
}