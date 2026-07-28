/* =========================================================
   ERLANGGA SAKTI GANDEWA — PORTFOLIO
   Vanilla JS — no framework
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME (follows system, with manual override) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('esg-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(mode){
    if (mode){ root.setAttribute('data-theme', mode); }
    else { root.removeAttribute('data-theme'); }
  }
  applyTheme(saved);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('esg-theme', next);
  });

  function isDark(){
    const forced = root.getAttribute('data-theme');
    return forced ? forced === 'dark' : systemDark.matches;
  }

  /* ---------- DOT FIELD BACKGROUND ---------- */
  const canvas = document.getElementById('dot-field');
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  const spacing = 34;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouse = { x: -9999, y: -9999 };
  let smoothMouse = { x: -9999, y: -9999 };
  let resizeTimer = null;
  let startTime = performance.now();

  function buildDots(){
    dots = [];
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    for (let i = 0; i < cols; i++){
      for (let j = 0; j < rows; j++){
        dots.push({
          x: i * spacing,
          y: j * spacing,
          r: 1.1,
          phase: Math.random() * Math.PI * 2 /* per-dot offset so the idle shimmer isn't uniform */
        });
      }
    }
  }

  function resize(){
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(document.documentElement.scrollHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = document.documentElement.scrollHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function drawDots(now){
    const cssW = window.innerWidth, cssH = document.documentElement.scrollHeight;
    ctx.clearRect(0, 0, cssW, cssH);
    const rgb = getComputedStyle(root).getPropertyValue('--dot-color').trim() || (isDark() ? '244,245,251' : '41,84,255');

    /* lerp the cursor position so the field trails smoothly instead of snapping */
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.12;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.12;

    const t = (now - startTime) / 1000;

    for (const d of dots){
      const dx = d.x - smoothMouse.x, dy = d.y - smoothMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / 160);
      const influence = proximity * proximity; /* ease-out falloff, feels less linear/mechanical */
      const breathe = prefersReducedMotion ? 0 : Math.sin(t * 1.2 + d.phase) * 0.06 + 0.06;

      const radius = d.r + influence * 2.2;
      const alpha = 0.14 + breathe + influence * 0.6;

      ctx.beginPath();
      ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${Math.min(alpha, 0.95)})`;
      ctx.fill();
    }
    requestAnimationFrame(drawDots);
  }
  requestAnimationFrame(drawDots);

  /* ---------- NAVBAR: scroll shrink + mobile menu ---------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navBurger = document.getElementById('navBurger');

  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
      navTicking = false;
    });
  });

  navBurger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

/* ---------- SHUFFLE TEXT (hero name) ---------- */

const shuffleEl = document.getElementById("shuffleName");
const finalText = shuffleEl?.dataset.text || "";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


function shuffleText(el, text, duration = 4000){

    if(!el || !text) return;


    let start = performance.now();

    // waktu tiap huruf berhenti
    const revealTime = [];

    for(let i = 0; i < text.length; i++){
        revealTime.push(
            (duration / text.length) * i
        );
    }


    function animate(now){

        const elapsed = now - start;

        let result = "";


        for(let i = 0; i < text.length; i++){

            // spasi
            if(text[i] === " "){
                result += " ";
                continue;
            }


            // kalau waktunya sudah lewat, tampilkan huruf asli
            if(elapsed > revealTime[i] + 500){

                result += text[i];

            } else {

                // masih random
                result += chars[
                    Math.floor(
                        Math.random() * chars.length
                    )
                ];

            }

        }


        el.textContent = result;


        if(elapsed < duration + 600){

            requestAnimationFrame(animate);

        } else {

            el.textContent = text;

        }

    }


    requestAnimationFrame(animate);

}


// jalankan
shuffleText(
    shuffleEl,
    finalText,
    4000
);


// JALANKAN ANIMASI
shuffleText(shuffleEl, finalText, 1200);

  /* ---------- FALLING TEXT (about paragraph) ---------- */
  const fallingEl = document.getElementById('fallingText');
  const originalText = fallingEl.textContent.trim();
  fallingEl.innerHTML = originalText.split('').map((ch, i) =>
    `<span class="fchar" style="animation-delay:${i * 0.012}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');

  /* ---------- INTERSECTION OBSERVER: reveal + experience numbers ---------- */
  const revealTargets = document.querySelectorAll('.about-card, .hobby-card, .skill-category, .website-card, .gallery-item, .poster-card, .brand-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        /* small stagger per row based on horizontal position, so grids don't reveal as one flat block */
        const delay = Math.min((entry.target.getBoundingClientRect().left % 300) / 1000, 0.25);
        entry.target.style.animationDelay = `${delay}s`;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(t => revealObserver.observe(t));

  const expItems = document.querySelectorAll('.exp-item');
  const expNums = document.querySelectorAll('.exp-num');
  const expObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = entry.target.dataset.index;
      if (entry.isIntersecting){
        expItems.forEach(it => it.classList.remove('active'));
        expNums.forEach(n => n.classList.remove('active'));
        entry.target.classList.add('active');
        document.querySelector(`.exp-num[data-index="${idx}"]`)?.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  expItems.forEach(it => expObserver.observe(it));

  /* ---------- PROJECT TABS ---------- */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = document.getElementById(tab.dataset.target);
      if (tab.classList.contains('active')) return;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        if (p === target) return;
        p.classList.remove('active');
      });

      /* replay the panel's fade-up instead of relying on a stale animation state */
      target.classList.remove('active');
      void target.offsetWidth;
      target.classList.add('active');
    });
  });

  /* ---------- CERTIFICATE STACK ---------- */
  const certCards = Array.from(document.querySelectorAll('.cert-card'));
  const certStack = document.querySelector('.cert-stack');
  let certIndex = 0;

  function renderCert(){
    certCards.forEach((card, i) => {
      card.classList.remove('active', 'prev-1', 'next-1');
      if (i === certIndex) card.classList.add('active');
      else if (i === (certIndex - 1 + certCards.length) % certCards.length) card.classList.add('prev-1');
      else if (i === (certIndex + 1) % certCards.length) card.classList.add('next-1');
    });
  }
  function certPrev(){ certIndex = (certIndex - 1 + certCards.length) % certCards.length; renderCert(); }
  function certNext(){ certIndex = (certIndex + 1) % certCards.length; renderCert(); }

  document.getElementById('certPrev').addEventListener('click', certPrev);
  document.getElementById('certNext').addEventListener('click', certNext);

  /* keyboard support when the stack area is focused/hovered */
  if (certStack){
    certStack.setAttribute('tabindex', '0');
    certStack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') certPrev();
      if (e.key === 'ArrowRight') certNext();
    });

    /* touch swipe support */
    let touchStartX = null;
    certStack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    certStack.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40){ dx > 0 ? certPrev() : certNext(); }
      touchStartX = null;
    });
  }
  renderCert();

  /* ---------- LANYARD CARD TILT ---------- */
  const lanyardCard = document.getElementById('lanyardCard');
  const lanyardInner = lanyardCard.querySelector('.lanyard-card-inner');
  let targetTilt = { x: 0, y: 0 };
  let currentTilt = { x: 0, y: 0 };
  let tiltActive = false;

  function tiltLoop(){
    if (!tiltActive) return;
    /* spring toward the target instead of jumping straight to the cursor position */
    currentTilt.x += (targetTilt.x - currentTilt.x) * 0.15;
    currentTilt.y += (targetTilt.y - currentTilt.y) * 0.15;
    lanyardInner.style.transform = `rotateY(${currentTilt.x}deg) rotateX(${currentTilt.y}deg)`;
    if (Math.abs(targetTilt.x - currentTilt.x) > 0.05 || Math.abs(targetTilt.y - currentTilt.y) > 0.05){
      requestAnimationFrame(tiltLoop);
    } else {
      tiltActive = false;
    }
  }
  function startTiltLoop(){
    if (!tiltActive){ tiltActive = true; requestAnimationFrame(tiltLoop); }
  }

  if (!prefersReducedMotion){
    lanyardCard.addEventListener('mousemove', (e) => {
      const rect = lanyardCard.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetTilt = { x: px * 14, y: -py * 14 };
      startTiltLoop();
    });
    lanyardCard.addEventListener('mouseleave', () => {
      targetTilt = { x: 0, y: 0 };
      startTiltLoop();
    });
  }

  /* ---------- CONTACT FORM (static demo) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Terima kasih! Pesan kamu berhasil dikirim (demo — hubungkan ke backend/email service untuk pengiriman sungguhan).';
    form.reset();
  });

  /* ---------- SOCIAL BUBBLE (touch fallback handled by CSS hover) ---------- */

  /* ---------- FOOTER: year + back to top ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

});

/* =========================================================
   PAGE LOADER
========================================================= */

const loader = document.getElementById("pageLoader");

if (loader) {
    const bar = document.getElementById("loaderBar");
    const percentEl = document.getElementById("loaderPercent");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.body.style.overflow = "hidden";

    let progress = 0;
    let target = 0;
    let rafId;

    function tick() {
        const ceiling = target >= 100 ? 100 : 92;

        progress += (ceiling - progress) * 0.06 + 0.1;
        progress = Math.min(progress, ceiling);

        bar.style.width = progress + "%";
        percentEl.textContent = Math.floor(progress) + "%";

        if (progress < 100) {
            rafId = requestAnimationFrame(tick);
        }
    }

    if (!reduced) {
        requestAnimationFrame(tick);
    } else {
        bar.style.width = "100%";
        percentEl.textContent = "100%";
    }

    function finishLoading() {
        target = 100;

        if (reduced) {
            complete();
            return;
        }

        function wait() {
            if (progress >= 99.5) {
                cancelAnimationFrame(rafId);
                complete();
            } else {
                requestAnimationFrame(wait);
            }
        }

        wait();
    }

    function complete() {
        bar.style.width = "100%";
        percentEl.textContent = "100%";

        loader.classList.add("done");

        document.body.style.overflow = "";

        setTimeout(() => loader.remove(), 700);
    }

    window.addEventListener("load", finishLoading);
}