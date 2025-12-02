const particleConfigs = {
  default: {
    particles: {
      number: { value: 200, density: { enable: true, value_area: 600 } },
      color: { value: localStorage.getItem("particleColor") || "#0e00ff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: localStorage.getItem("particleColor") || "#0e00ff",
        opacity: 0.4,
        width: 1.5
      },
      move: { enable: true, speed: 6, direction: "none", out_mode: "out" }
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "repulse" },
        resize: true
      },
      modes: {
        grab: { distance: 180, line_linked: { opacity: 1 } },
        repulse: { distance: 200, duration: 0.4 }
      }
    },
    retina_detect: true
  },
  alt: {
    particles: {
      number: { value: 400, density: { enable: true, value_area: 800 } },
      color: { value: "#fff" },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" },
        polygon: { nb_sides: 5 }
      },
      opacity: { value: 0.5, random: true },
      size: { value: 10, random: true },
      line_linked: { enable: false },
      move: {
        enable: true,
        speed: 6,
        direction: "bottom",
        out_mode: "out"
      }
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: true, mode: "bubble" },
        onclick: { enable: true, mode: "repulse" },
        resize: true
      },
      modes: {
        bubble: { distance: 400, size: 4, duration: 0.3, opacity: 1, speed: 3 },
        repulse: { distance: 200, duration: 0.4 }
      }
    },
    retina_detect: true
  }
};

// --- Reliable "scroll to top" guard (place AFTER particleConfigs, BEFORE the main IIFE) ---
try {
  // prevent normal history-based scroll restoration so we control it
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} catch (e) { /* ignore */ }

// small helper to force top; call multiple times for reliability
function forceScrollTop() {
  try {
    window.scrollTo(0, 0);
    // double/triple attempt via rAF in case other scripts race and shift scroll
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    });
  } catch (err) { /* ignore */ }
}

// handle normal load
window.addEventListener('load', () => {
  // slight delay helps if heavy assets change layout
  setTimeout(forceScrollTop, 25);
});

// handle bfcache / pageshow restore (persisted true)
window.addEventListener('pageshow', (ev) => {
  // pageshow can be fired with persisted=true when restoring from bfcache
  // run a tiny timeout so the browser finishes restoration then we nudge to top
  setTimeout(forceScrollTop, ev.persisted ? 20 : 0);
});

// Also ensure we nudge on DOM ready as early as we can (inside the DOMContentLoaded listener
// you'll already have a call — but this ensures it's available globally)
document.addEventListener('DOMContentLoaded', () => {
  // blur anything that might steal focus and cause auto-scroll (inputs, iframes)
  try {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    // explicit blur on searchBar if present
    const sb = document.getElementById('searchBar');
    if (sb && typeof sb.blur === 'function') sb.blur();
  } catch (e) { /* ignore */ }

  // immediate nudge
  forceScrollTop();
});
// --- end scroll guard ---


(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    console.log('[script] initializing');

    // ---------- DOM refs ----------
    const container = document.getElementById('container');
    const featuredContainer = document.getElementById('featuredZones');
    const featuredWrapper = document.getElementById('featuredZonesWrapper');
    const allSummary = document.getElementById('allSummary');
    const searchBar = document.getElementById('searchBar');
    const sortOptions = document.getElementById('sortOptions');
    const zoneViewer = document.getElementById('zoneViewer');
    const zoneNameEl = document.getElementById('zoneName');
    const zoneIdEl = document.getElementById('zoneId');
    const zoneAuthorEl = document.getElementById('zoneAuthor');
    const footer = document.querySelector('footer');
    let zoneFrame = document.getElementById('zoneFrame');

    // settings controls (may be null)
    const settingsBtn = document.getElementById('settings');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const toggleParticlesBtn = document.getElementById('toggle-particles');
    const changeColorBtn = document.getElementById('change-particles-color');
    const toggleThemeBtn = document.getElementById('toggle-theme');

    // CDN / paths
    const defaultZones = "https://cdn.jsdelivr.net/gh/Notrexed/assets@latest/allzone.json";
    const fallbackZones = "https://cdn.jsdelivr.net/gh/Notrexed/assets@latest/allzone.json";
    const coverURL = "https://cdn.jsdelivr.net/gh/Notrexed/covers@main";
    const htmlURL = "https://cdn.jsdelivr.net/gh/Notrexed/html@latest";

    // state
    let zones = [];
    let popularityData = {};
    let currentZoneURL = '';

    // ---------- small helpers ----------
    const safe = v => (v === undefined || v === null) ? '' : String(v);
    const esc = s => safe(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // ---------- fetch popularity ----------
    async function fetchPopularity() {
      try {
        const res = await fetch("https://data.jsdelivr.com/v1/stats/packages/gh/gn-math/html@main/files?period=year");
        if (!res.ok) throw new Error('popularity fetch failed');
        const data = await res.json();
        popularityData = {};
        (data||[]).forEach(f => {
          const m = String(f.name).match(/\/(\d+)\.html$/);
          if (m) popularityData[parseInt(m[1],10)] = (f.hits && f.hits.total) || 0;
        });
        console.log('[script] popularity loaded');
      } catch (e) {
        popularityData = {};
      }
    }

    // ---------- load zones ----------
    async function listZones() {
      if (!container) return console.warn('[script] #container missing');
      container.innerHTML = 'Loading...';
      try {
        let res = await fetch(defaultZones + '?t=' + Date.now());
        if (!res.ok) {
          console.warn('[script] defaultZones fetch failed, trying fallback');
          res = await fetch(fallbackZones + '?t=' + Date.now());
        }
        if (!res.ok) throw new Error('zones fetch failed');
        zones = await res.json();
        if (!Array.isArray(zones)) zones = [];
        if (zones.length > 0) zones[0].featured = true;
        await fetchPopularity();
        sortZones();

        // handle ?id= open
        try {
          const u = new URL(window.location);
          const id = u.searchParams.get('id');
          const embed = window.location.hash.includes('embed');
          if (id) {
            const zone = zones.find(z => String(z.id) === String(id));
            if (zone) {
              if (embed) window.open(zone.url.replace('{HTML_URL}', htmlURL), '_blank');
              else openZone(zone);
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error('[script] listZones error', err);
        container.innerHTML = `<div style="padding:1rem;color:#ddd">Failed to load zones: ${esc(err && err.message)}</div>`;
      }
    }

    // ---------- display / lazy ----------
    function setupObservers() {
      try {
        const cards = document.querySelectorAll('.zone-card');
        const obs = new IntersectionObserver((entries, o) => {
          entries.forEach(en => {
            if (en.isIntersecting) {
              en.target.classList.add('visible');
              o.unobserve(en.target);
            }
          });
        }, { threshold: 0.12 });
        cards.forEach(c => obs.observe(c));
      } catch (e) {}

      try {
        const lazyImgs = document.querySelectorAll('img.lazy-zone-img');
        const imgObs = new IntersectionObserver((entries, o) => {
          entries.forEach(en => {
            if (en.isIntersecting) {
              const img = en.target;
              if (img.dataset && img.dataset.src) img.src = img.dataset.src;
              img.classList.remove('lazy-zone-img');
              o.unobserve(img);
            }
          });
        }, { rootMargin: '120px', threshold: 0.05 });
        lazyImgs.forEach(i => imgObs.observe(i));
      } catch (e) {}
    }

    function displayZones(list, titleOverride, searchQuery = '') {
      if (!container) return;
      container.innerHTML = '';
      if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = `<div class="results-container"><div style="text-align:center; font-size:1.05rem; opacity:0.85;">🔎 No Results ${searchQuery ? `for "<b>${esc(searchQuery)}</b>"` : ''}</div></div>`;
        if (allSummary) allSummary.textContent = 'All Zones (0)';
        return;
      }
      list.forEach(file => {
        const zoneItem = document.createElement('div');
        zoneItem.className = 'zone-card';
        zoneItem.tabIndex = 0;
        zoneItem.onclick = () => openZone(file);
        zoneItem.onkeydown = (e) => { if (e.key === 'Enter') openZone(file); };

        const img = document.createElement('img');
        img.dataset.src = safe(file.cover).replace('{COVER_URL}', coverURL).replace('{HTML_URL}', htmlURL);
        img.alt = safe(file.name);
        img.loading = 'lazy';
        img.className = 'lazy-zone-img';
        zoneItem.appendChild(img);

        const title = document.createElement('div');
        title.className = 'zone-card-title';
        title.textContent = safe(file.name || 'Untitled');
        zoneItem.appendChild(title);

        container.appendChild(zoneItem);
      });

      if (allSummary) {
        if (typeof titleOverride !== 'undefined') allSummary.innerHTML = titleOverride;
        else allSummary.textContent = `All Zones (${list.length})`;
      }
      setupObservers();
    }

    function displayFeaturedZones(list) {
      if (!featuredContainer) return;
      featuredContainer.innerHTML = '';
      (list || []).forEach(file => {
        const zoneItem = document.createElement('div');
        zoneItem.className = 'zone-card';
        zoneItem.onclick = () => openZone(file);

        const img = document.createElement('img');
        img.dataset.src = safe(file.cover).replace('{COVER_URL}', coverURL).replace('{HTML_URL}', htmlURL);
        img.alt = safe(file.name);
        img.loading = 'lazy';
        img.className = 'lazy-zone-img';
        zoneItem.appendChild(img);

        const title = document.createElement('div');
        title.className = 'zone-card-title';
        title.textContent = safe(file.name);
        zoneItem.appendChild(title);

        featuredContainer.appendChild(zoneItem);
      });
      setupObservers();
    }

    // ---------- sort ----------
    function sortZones() {
      if (!container) return;
      container.style.opacity = 0;
      setTimeout(() => {
        const sortBy = (sortOptions && sortOptions.value) || 'name';
        if (sortBy === 'name') zones.sort((a,b) => safe(a.name).localeCompare(safe(b.name)));
        else if (sortBy === 'id') zones.sort((a,b) => (a.id||0) - (b.id||0));
        else if (sortBy === 'popular') zones.sort((a,b) => (popularityData[b.id] || 0) - (popularityData[a.id] || 0));
        zones.sort((a,b) => (a.id === -1 ? 1 : b.id === -1 ? -1 : 0));

        if (featuredContainer && featuredContainer.innerHTML.trim() === '') displayFeaturedZones(zones.filter(z => z.featured));
        displayZones(zones);
        container.style.opacity = 1;
      }, 160);
    }

    // ---------- hero / featured ----------
    function hideHero() { const el = document.querySelector('.hero-section'); if (!el) return; el.classList.add('collapsed'); }
    function showHero() { const el = document.querySelector('.hero-section'); if (!el) return; el.classList.remove('collapsed'); }
    function setFeaturedCollapsed(state) { const el = featuredWrapper || document.getElementById('featuredZonesWrapper'); if (!el) return; el.classList.toggle('collapsed', !!state); }

    // ---------- filter ----------
    function filterZones() {
      if (!Array.isArray(zones)) return;
      const qRaw = (searchBar && searchBar.value) ? String(searchBar.value).trim() : '';
      const q = qRaw.toLowerCase();
      if (!qRaw) {
        showHero();
        setFeaturedCollapsed(false);
        if (footer) footer.style.display = '';
        displayZones(zones);
        return;
      }
      hideHero();
      setFeaturedCollapsed(true);
      if (footer) footer.style.display = 'none';
      const filtered = zones.filter(z => safe(z.name).toLowerCase().includes(q));
      displayZones(filtered, `Search Results (${filtered.length})`, qRaw);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---------- open/close zone ----------
    async function openZone(file) {
      if (!file) return;
      currentZoneURL = safe(file.url).replace('{HTML_URL}', htmlURL).replace('{COVER_URL}', coverURL);
      try {
        const res = await fetch(currentZoneURL + '?t=' + Date.now());
        if (!res.ok) throw new Error('zone fetch failed');
        const html = await res.text();

        if (!zoneFrame || !document.getElementById('zoneFrame')) {
          zoneFrame = document.createElement('iframe');
          zoneFrame.id = 'zoneFrame';
          zoneFrame.style.width = '100%';
          zoneFrame.style.height = '70vh';
          zoneFrame.style.border = 'none';
          if (zoneViewer) zoneViewer.appendChild(zoneFrame);
        }

        const doc = zoneFrame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        if (zoneNameEl) zoneNameEl.textContent = safe(file.name);
        if (zoneIdEl) zoneIdEl.textContent = String(file.id || '');
        if (zoneAuthorEl) zoneAuthorEl.textContent = file.author ? `by ${file.author}` : '';

        if (zoneViewer) {
          zoneViewer.style.display = 'flex';
          zoneViewer.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
        try { const u = new URL(window.location); u.searchParams.set('id', file.id); history.pushState(null, '', u.toString()); } catch(e) {}
      } catch (err) {
        console.error('[script] openZone error', err);
        if (zoneViewer) { zoneViewer.style.display = 'flex'; zoneViewer.setAttribute('aria-hidden', 'false'); }
        if (zoneFrame && zoneFrame.contentWindow && zoneFrame.contentWindow.document) {
          zoneFrame.contentWindow.document.body.innerHTML = `<p style="color:white;padding:2rem;text-align:center;">Failed to load game.</p>`;
        }
      }
    }

    function closeZone() {
      if (zoneViewer) zoneViewer.style.display = 'none';
      zoneViewer?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (zoneFrame && zoneFrame.parentNode) { try { zoneFrame.parentNode.removeChild(zoneFrame); } catch(e) {} }
      zoneFrame = null;
      currentZoneURL = '';
      try { const u = new URL(window.location); u.searchParams.delete('id'); history.pushState(null,'',u.toString()); } catch(e) {}
    }

    // ---------- control buttons ----------
    document.getElementById('fullscreenBtn')?.addEventListener('click', fullscreenZone);
    document.getElementById('openTabBtn')?.addEventListener('click', () => { if (currentZoneURL) window.open(currentZoneURL, '_blank'); });
    document.getElementById('closeBtn')?.addEventListener('click', closeZone);

    // ---------- settings overlay ----------
    function openOverlay() { if (!settingsOverlay) return; settingsOverlay.classList.add('active'); settingsOverlay.setAttribute('aria-hidden','false'); }
    function closeOverlay() { if (!settingsOverlay) return; settingsOverlay.classList.remove('active'); settingsOverlay.setAttribute('aria-hidden','true'); }

    settingsBtn?.addEventListener('click', (e) => { e.stopPropagation(); if (settingsOverlay && settingsOverlay.classList.contains('active')) closeOverlay(); else openOverlay(); });
    closeSettingsBtn?.addEventListener('click', closeOverlay);
    settingsOverlay?.addEventListener('click', (e) => { if (e.target === settingsOverlay) closeOverlay(); });
    toggleParticlesBtn?.addEventListener('click', () => {
  const nowOn = localStorage.getItem('particlesEnabled') !== 'false';
  const next = !nowOn;
  localStorage.setItem('particlesEnabled', next ? 'true' : 'false');

  if (next) {
    if (_particlesDiv) _particlesDiv.style.display = '';
    initParticles(localStorage.getItem('particleMode') || 'default');
  } else {
    destroyParticles();
    if (_particlesDiv) _particlesDiv.style.display = 'none';
  }

  closeOverlay();
});

    toggleThemeBtn?.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); closeOverlay(); });

    // ---------- particle color logic (efficient & safe) ----------
    let _refreshTimer = null;

    function hexToRgb(hex) {
      if (!hex) return null;
      const h = hex.replace('#','');
      if (h.length === 3) {
        return {
          r: parseInt(h[0]+h[0],16),
          g: parseInt(h[1]+h[1],16),
          b: parseInt(h[2]+h[2],16)
        };
      }
      if (h.length === 6) {
        return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
      }
      return null;
    }

    function safeApplyToExistingParticles(pJS, color) {
      try {
        if (!pJS || !pJS.particles) return;
        // config
        pJS.particles.color = pJS.particles.color || {};
        try { pJS.particles.color.value = color; } catch(e) { pJS.particles.color = { value: color }; }

        // lines
        if (pJS.particles.line_linked) {
          try { pJS.particles.line_linked.color = color; } catch(e) { pJS.particles.line_linked.color = color; }
        } else if (pJS.particles.lineLinked) {
          pJS.particles.lineLinked.color = color;
        }

        // update in-memory particles array if present
        if (Array.isArray(pJS.particles.array)) {
          const rgb = hexToRgb(color);
          pJS.particles.array.forEach(p => {
            try {
              if (!p) return;
              // set color.value if exists
              if (p.color) {
                try { p.color.value = color; } catch(e){}
                // set rgb if available
                if (rgb) {
                  try { p.color.rgb = { r: rgb.r, g: rgb.g, b: rgb.b }; } catch(e){}
                }
              } else {
                p.color = { value: color };
                if (rgb) p.color.rgb = { r: rgb.r, g: rgb.g, b: rgb.b };
              }
            } catch (err) { /* ignore per-particle errors */ }
          });
        }
      } catch (err) {
        console.warn('[script] safeApplyToExistingParticles failed', err);
      }
    }

    function updateParticleColor(newColor) {
      if (!newColor) return;
      try {
        // save immediately
        try { localStorage.setItem('particleColor', newColor); } catch (e) {}

        if (!(window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS)) {
          // if particles not yet ready, just store color for later
          return;
        }
        const pJS = window.pJSDom[0].pJS;

        // cheap: apply to existing objects and redraw
        safeApplyToExistingParticles(pJS, newColor);
        try {
          if (pJS.fn && typeof pJS.fn.particlesDraw === 'function') {
            pJS.fn.particlesDraw();
          } else if (pJS.fn && pJS.fn.vendors && typeof pJS.fn.vendors.refresh === 'function') {
            // some builds expose a light refresh
            pJS.fn.vendors.refresh();
          }
        } catch (e) {}

        // debounced heavier refresh (in case needed)
        clearTimeout(_refreshTimer);
        _refreshTimer = setTimeout(() => {
          try {
            if (pJS.fn && typeof pJS.fn.particlesRefresh === 'function') pJS.fn.particlesRefresh();
            else if (pJS.fn && pJS.fn.vendors && typeof pJS.fn.vendors.refresh === 'function') pJS.fn.vendors.refresh();
          } catch (e) { /* ignore */ }
        }, 300);
      } catch (err) {
        console.error('[script] updateParticleColor error', err);
      }
    }

    // color picker: native hidden input (live updates) — non-blocking
    // ✅ Particle Color Picker with Throttled Updates
if (changeColorBtn) {
  changeColorBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "color";
    const saved = localStorage.getItem("particleColor") || "#0e00ff";
    input.value = saved;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);

    let lastUpdate = 0;
    input.addEventListener("input", (e) => {
      const now = Date.now();
      if (now - lastUpdate > 50) { // ✅ Only update every 50ms
        throttledLiveUpdate(e.target.value);
        lastUpdate = now;
      }
    });

    input.addEventListener("change", (e) => {
      finalizeParticleColor(e.target.value);
      cleanup();
    });

    input.addEventListener("blur", cleanup);

    function cleanup() {
      setTimeout(() => {
        if (document.body.contains(input)) input.remove();
      }, 50);
    }

    input.click();
  });
}

function throttledLiveUpdate(newColor) {
  if (!(window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS)) return;
  const pJS = window.pJSDom[0].pJS;

  // Apply color to config
  pJS.particles.color.value = newColor;
  if (pJS.particles.line_linked) pJS.particles.line_linked.color = newColor;

  // Apply color to already-drawn particles
  if (Array.isArray(pJS.particles.array)) {
    const rgb = hexToRgb(newColor);
    pJS.particles.array.forEach((p) => {
      p.color.value = newColor;
      if (rgb) p.color.rgb = rgb;
    });
  }

  if (pJS.fn?.particlesDraw) pJS.fn.particlesDraw();
}

function finalizeParticleColor(newColor) {
  try {
    localStorage.setItem("particleColor", newColor);
  } catch {}
  if (!(window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS)) return;
  const pJS = window.pJSDom[0].pJS;

  // Ensure color is fully applied
  throttledLiveUpdate(newColor);
  // Do one heavy refresh AFTER selection is done
  if (pJS.fn?.particlesRefresh) pJS.fn.particlesRefresh();
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}


    // ---------- apply saved color reliably (retry loop) ----------
    function applySavedParticleColor() {
      const saved = (() => { try { return localStorage.getItem('particleColor'); } catch(e) { return null; } })();
      if (!saved) return;
      let tries = 0;
      const maxTries = 20;
      const attempt = () => {
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
          try { updateParticleColor(saved); console.log('[script] applied saved particle color', saved); } catch(e) { console.warn('[script] applySaved failed', e); }
        } else if (tries < maxTries) {
          tries++; setTimeout(attempt, 150);
        } else {
          console.warn('[script] particles.js never initialized to apply saved color');
        }
      };
      attempt();
    }

    // ---------- keyboard/esc ----------
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        try { closeOverlay(); } catch(_){} 
        try { closeZone(); } catch(_) {}
      }
    });

    // === Particles: robust init / destroy / state handling ===
const _particlesDiv = document.getElementById("particles-js");
const _toggleBtn = document.getElementById("toggle-particles");

function waitForParticlesLib(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (typeof particlesJS !== "undefined") return resolve();
    const start = Date.now();
    const t = setInterval(() => {
      if (typeof particlesJS !== "undefined") { clearInterval(t); return resolve(); }
      if (Date.now() - start > timeout) { clearInterval(t); return reject(new Error('particles.js not loaded')); }
    }, 100);
  });
}

function destroyParticles() {
  if (window.pJSDom && window.pJSDom.length) {
    try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); } catch(e){}
    window.pJSDom = [];
  }
  if (_particlesDiv) {
    _particlesDiv.style.display = 'none';
    // leave canvas in place → black background from ::before stays
  }
}



function initParticles(mode = 'default') {
  const cfg = particleConfigs[mode] || particleConfigs.default;
  destroyParticles(); // clean any existing

  if (_particlesDiv) {
    _particlesDiv.style.display = 'block';
  }

  // Force-create a canvas so we control its background
  let canvas = _particlesDiv.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'particles-js-canvas-el';
    canvas.style.background = 'transparent';
    _particlesDiv.appendChild(canvas);
  }

  particlesJS('particles-js', cfg);
}



function setParticlesIcon(isOn) {
  const icon = _toggleBtn?.querySelector('i');
  if (!icon) return;
  icon.classList.toggle('fa-toggle-on', !!isOn);
  icon.classList.toggle('fa-toggle-off', !isOn);
  icon.style.color = isOn ? '#63E6BE' : '#aaa';
}

function applyParticlesState() {
  const enabled = localStorage.getItem('particlesEnabled');
  const mode = localStorage.getItem('particleMode') || 'default';

  if (enabled === 'false') {
    destroyParticles();
    if (_particlesDiv) _particlesDiv.style.display = 'none';
    setParticlesIcon(false);
  } else {
    if (_particlesDiv) _particlesDiv.style.display = '';
    initParticles(mode);
    setParticlesIcon(true);
  }
}

// expose helpers so you can call them from the Console for debugging
window.initParticles = initParticles;
window.destroyParticles = destroyParticles;
window.applyParticlesState = applyParticlesState;

// run once at startup
if (localStorage.getItem('particlesEnabled') === null) {
  // default to ON if user never set it
  localStorage.setItem('particlesEnabled', 'true');
}
applyParticlesState();



    // ---------- attach search/sort listeners ----------
    sortOptions?.addEventListener('change', sortZones);
    searchBar?.addEventListener('input', filterZones);

    // ---------- start ----------
    listZones();
    applySavedParticleColor();

    // expose for quick debug
    window._site = { listZones, sortZones, filterZones, openZone, closeZone, updateParticleColor };

        // --- Header scroll shrink effect (robust + performant) ---
    (function initHeaderScroll(){
      const findHeader = () => document.getElementById('mainHeader') || document.querySelector('.site-header');

      // if header exists now, attach. Otherwise observe DOM until it's added.
      const header = findHeader();
      if (header) return setupHeader(header);

      console.warn('[script] #mainHeader not found yet — observing DOM for it.');
      const mo = new MutationObserver((mutations, obs) => {
        const h = findHeader();
        if (h) { obs.disconnect(); setupHeader(h); }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });

      function setupHeader(headerEl) {
        // safety: ensure headerEl exists
        if (!headerEl) return;

        // Fast scroll handler using rAF to avoid jank
        let ticking = false;
        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              if (window.scrollY > 20) headerEl.classList.add('scrolled');
              else headerEl.classList.remove('scrolled');
              ticking = false;
            });
            ticking = true;
          }
        }

        // Init state (in case page restored scrolled)
        if (window.scrollY > 20) headerEl.classList.add('scrolled');
        else headerEl.classList.remove('scrolled');

        window.addEventListener('scroll', onScroll, { passive: true });

        // helpful debug line (comment out if noisy)
        // console.log('[script] header scroll initialized', headerEl);
      }
    })();


    console.log('[script] ready');
  }); // DOMContentLoaded
})(); // IIFE

// --- Tab Cloak (from your original working files) ---
const tabCloakBtn = document.getElementById("tab-cloak");

// Restore saved tab cloak settings on load
(function restoreTabCloak() {
  const savedTitle = localStorage.getItem("tabCloakTitle");
  const savedFavicon = localStorage.getItem("tabCloakFavicon");
  if (savedTitle) document.title = savedTitle;
  if (savedFavicon) {
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = savedFavicon;
  }
})();

tabCloakBtn.addEventListener("click", () => {
  const newTitle = prompt("Enter new tab title:", document.title);
  if (newTitle !== null) {
    document.title = newTitle;
    localStorage.setItem("tabCloakTitle", newTitle);
  }

  const newFavicon = prompt("Enter new tab image URL (leave empty to keep current):", "");
  if (newFavicon !== null && newFavicon.trim() !== "") {
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = newFavicon;
    localStorage.setItem("tabCloakFavicon", newFavicon);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("sortDropdown");
  if (!dropdown) return;

  const toggle = dropdown.querySelector(".dropdown-toggle");
  const menu = dropdown.querySelector(".dropdown-menu");
  const current = document.getElementById("currentSort");

  toggle.addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });

  menu.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      const value = item.dataset.value;
      current.textContent = item.textContent;
      dropdown.classList.remove("open");

      // trigger your existing sortZones()
      const sortOptions = document.getElementById("sortOptions"); 
      if (sortOptions) {
        sortOptions.value = value;
        sortOptions.dispatchEvent(new Event("change"));
      }
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
});

const switchBgBtn = document.getElementById("switch-background");

if (switchBgBtn) {
  switchBgBtn.addEventListener('click', () => {
    const current = localStorage.getItem('particleMode') || 'default';
    const next = current === 'default' ? 'alt' : 'default';
    localStorage.setItem('particleMode', next);

    // Only re-init if particles are enabled
    if (localStorage.getItem('particlesEnabled') !== 'false') {
      initParticles(next);
    } else {
      // saved mode changed but user has particles turned off; do nothing.
      console.log('[script] particleMode saved to', next, 'but particles are disabled');
    }

    closeOverlay();
  });
}


function closeZone() {
    zoneViewer.style.display = "none";
    zoneViewer.removeChild(zoneFrame);
    document.body.style.overflow = ''; // <-- restore scrolling
    const url = new URL(window.location);
    url.searchParams.delete('id');
    history.pushState(null, '', url.toString());
}

function fullscreenZone() {
    if (zoneFrame.requestFullscreen) {
        zoneFrame.requestFullscreen();
    } else if (zoneFrame.mozRequestFullScreen) {
        zoneFrame.mozRequestFullScreen();
    } else if (zoneFrame.webkitRequestFullscreen) {
        zoneFrame.webkitRequestFullscreen();
    } else if (zoneFrame.msRequestFullscreen) {
        zoneFrame.msRequestFullscreen();
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const movieBtn = document.getElementById("movieBtn");
const tvshowBtn = document.getElementById("tvshowBtn");
const slider = document.querySelector(".slider-indicator");
const goButton = document.getElementById("goButton");
const showIdInput = document.getElementById("showId");
const seasonInput = document.getElementById("season");
const episodeInput = document.getElementById("episode");

let currentType = "movie"; // default

function updateSlider(type) {
  if (type === "movie") {
    slider.style.left = "0";
    movieBtn.classList.add("active");
    tvshowBtn.classList.remove("active");
    seasonInput.style.display = "none";
    episodeInput.style.display = "none";
    showIdInput.placeholder = "Enter Movie ID";
    currentType = "movie";
  } else {
    slider.style.left = "50%";
    tvshowBtn.classList.add("active");
    movieBtn.classList.remove("active");
    seasonInput.style.display = "block";
    episodeInput.style.display = "block";
    showIdInput.placeholder = "Enter TV Show ID";
    currentType = "tv";
  }
}

movieBtn.addEventListener("click", () => updateSlider("movie"));
tvshowBtn.addEventListener("click", () => updateSlider("tv"));

// Initialize default state
updateSlider("movie");
});