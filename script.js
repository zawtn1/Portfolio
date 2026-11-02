(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Footer year ----------
  $('#year').textContent = new Date().getFullYear();

  // ---------- Theme toggle ----------
  const root = document.documentElement;
  const isLight = () => {
    const t = root.getAttribute('data-theme');
    if (t) return t === 'light';
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  };
  $('#themeToggle').addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---------- Nav: scroll state, hide on scroll down, mobile menu ----------
  const nav = $('#nav');
  const links = $('#navLinks');
  const burger = $('#burger');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    nav.classList.toggle('hidden', y > lastY && y > 400 && !links.classList.contains('open'));
    lastY = y;
  }, { passive: true });

  const closeMenu = () => {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Active section highlighting ----------
  const sections = $$('main section[id]');
  const navMap = new Map($$('a', links).map(a => [a.getAttribute('href').slice(1), a]));
  const secObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = navMap.get(entry.target.id);
      if (link && entry.isIntersecting) {
        navMap.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secObserver.observe(s));

  // ---------- Reveal on scroll ----------
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    revealObserver.observe(el);
  });

  // ---------- Stat counters ----------
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const render = v => { el.textContent = prefix + v.toFixed(decimals) + suffix; };
      if (reduceMotion) { render(target); obs.unobserve(el); return; }
      const start = performance.now();
      const dur = 1400;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        render(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countObserver.observe(el));

  // ---------- Typing effect ----------
  const phrases = [
    'multimodal vision systems.',
    'RAG & LLM pipelines.',
    'RGB–IR object detectors.',
    'scalable ML infrastructure.',
  ];
  const typed = $('#typed');
  if (!reduceMotion) {
    let pi = 0, ci = phrases[0].length, deleting = true;
    typed.textContent = phrases[0];
    const step = () => {
      if (deleting) {
        ci--;
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      } else {
        ci++;
      }
      typed.textContent = phrases[pi].slice(0, ci);
      let delay = deleting ? 35 : 70;
      if (!deleting && ci === phrases[pi].length) { deleting = true; delay = 2200; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2200);
  } else {
    typed.textContent = phrases[0];
  }

  // ---------- Copy email ----------
  const toast = $('#toast');
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 2000);
  };
  $('#copyEmail').addEventListener('click', async e => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  // ---------- Hero neural-network canvas ----------
  const canvas = $('#netCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], rafId;
  const mouse = { x: -9999, y: -9999 };

  const accent = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#818cf8';
  const hexToRgb = hex => {
    const m = hex.replace('#', '').match(/.{2}/g);
    return m ? m.map(x => parseInt(x, 16)).join(',') : '129,140,248';
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  };

  const draw = () => {
    const rgb = hexToRgb(accent());
    ctx.clearRect(0, 0, w, h);
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
      const dmx = a.x - mouse.x, dmy = a.y - mouse.y;
      const dm = Math.hypot(dmx, dmy);
      if (dm < 120) { a.x += dmx / dm; a.y += dmy / dm; }
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxDist) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / maxDist) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${rgb},0.9)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, Math.PI * 2); ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  if (reduceMotion) {
    // Draw a single static frame
    draw(); cancelAnimationFrame(rafId);
  } else {
    // Pause animation when hero is off-screen
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!rafId) draw(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    }).observe(canvas);
  }
})();
