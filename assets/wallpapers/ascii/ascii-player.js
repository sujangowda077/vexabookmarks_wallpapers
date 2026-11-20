/* ═══════════════════════════════════════════════════════════
   ASCII-PLAYER.JS — Native Offline Engine for VexaBookmarks
   Plays all 240 bas3line/ascii pieces locally with 0 network calls
   Complies with Chrome MV3 Content Security Policy (script-src 'self')
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const canvas = document.getElementById('ascii-canvas');
  if (!canvas) {
    console.error('[ASCII-Player] Missing #ascii-canvas element');
    return;
  }

  let activePieceName = 'tokyo-rain';
  let isMono = false;
  let currentStopFn = null;
  let animFallbackId = null;
  let currentLoadId = 0;

  // High-contrast, vibrant glow colors for pieces without baked palettes
  const THEME_INKS = {
    scenes: '#f1f5f9',
    space: '#a5b4fc',
    shapes: '#c084fc',
    effects: '#38bdf8',
    generative: '#34d399',
    nature: '#67e8f9',
    physics: '#818cf8',
    creatures: '#f472b6',
    objects: '#fde047',
    distros: '#38bdf8',
    logos: '#a78bfa',
    companies: '#f1f5f9',
    ui: '#2dd4bf',
    data: '#38bdf8',
    type: '#f8fafc'
  };

  /* ── Read initial piece from storage / hash ── */
  try {
    const stored = localStorage.getItem('vexa_active_ascii_piece');
    if (stored && typeof stored === 'string') {
      activePieceName = stored.trim().replace(/^ascii-/, '');
    }
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) activePieceName = hash.replace(/^ascii-/, '');
    }
  } catch (_) {}

  /* ── Responsive Viewport Fitting ── */
  function adjustCanvasLayout(meta) {
    if (!canvas || !meta) return;

    const cols = meta.cols || 80;
    const rows = meta.rows || 24;
    const cell = meta.cell || 2;
    const aspect = cols / (rows * cell);

    const winW = window.innerWidth || 1920;
    const winH = window.innerHeight || 1080;
    const winAspect = winW / winH;

    // Fullscreen scenes (scenes category or high resolution grids) fill screen
    const isFullScene = meta.category === 'scenes' || cols >= 120;

    if (isFullScene) {
      if (winAspect > aspect) {
        canvas.style.width = '100vw';
        canvas.style.height = (winW / aspect) + 'px';
      } else {
        canvas.style.height = '100vh';
        canvas.style.width = (winH * aspect) + 'px';
      }
      canvas.style.maxWidth = 'none';
      canvas.style.maxHeight = 'none';
    } else {
      // Centered iconic / 3D piece
      let targetH = Math.min(winH * 0.92, 900);
      let targetW = targetH * aspect;
      if (targetW > winW * 0.95) {
        targetW = winW * 0.95;
        targetH = targetW / aspect;
      }
      canvas.style.width = Math.round(targetW) + 'px';
      canvas.style.height = Math.round(targetH) + 'px';
      canvas.style.maxWidth = '100vw';
      canvas.style.maxHeight = '100vh';
    }
  }

  /* ── Dynamically load piece file ── */
  function loadPieceModule(name) {
    return new Promise((resolve, reject) => {
      // 1. Check if already in cache
      if (window.ASCII_PIECES && window.ASCII_PIECES[name]) {
        return resolve(window.ASCII_PIECES[name]);
      }

      // 2. Inject local piece script
      const script = document.createElement('script');
      script.src = `pieces/${encodeURIComponent(name)}.js`;
      script.async = true;

      script.onload = () => {
        try { script.remove(); } catch (_) {}
        if (window.ASCII_PIECES && window.ASCII_PIECES[name]) {
          resolve(window.ASCII_PIECES[name]);
        } else {
          reject(new Error(`Piece "${name}" did not register on window.ASCII_PIECES`));
        }
      };

      script.onerror = () => {
        try { script.remove(); } catch (_) {}
        reject(new Error(`Failed to load pieces/${name}.js`));
      };

      document.head.appendChild(script);
    });
  }

  /* ── Stop current animation ── */
  function stopCurrentPiece() {
    if (typeof currentStopFn === 'function') {
      try {
        currentStopFn();
      } catch (_) {}
      currentStopFn = null;
    }
    if (animFallbackId) {
      cancelAnimationFrame(animFallbackId);
      animFallbackId = null;
    }
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (_) {}
  }

  /* ── Play Piece ── */
  async function playPiece(pieceName, mono = isMono) {
    if (!pieceName) return;
    const cleanName = pieceName.replace(/^ascii-/, '');
    activePieceName = cleanName;
    isMono = mono;
    const loadId = ++currentLoadId;

    try {
      if (!window.parent || window.parent === window) {
        localStorage.setItem('vexa_active_ascii_piece', cleanName);
      }
    } catch (_) {}

    // Stop previous runner
    stopCurrentPiece();

    try {
      const piece = await loadPieceModule(cleanName);
      if (loadId !== currentLoadId) return; // Superseded by a newer piece selection
      if (!piece || typeof piece.default !== 'function') {
        throw new Error(`Invalid piece export for ${cleanName}`);
      }

      const meta = piece.meta || {};
      adjustCanvasLayout(meta);

      if (typeof window.asciiMount === 'function') {
        // Build piece definition
        const effectivePiece = {
          meta: isMono ? { ...meta, palette: null } : meta,
          default: piece.default
        };

        if (isMono) {
          canvas.style.color = '#c4b5fd';
        } else if (!meta.palette) {
          canvas.style.color = THEME_INKS[meta.category] || '#e2e8f0';
        } else {
          canvas.style.color = '#e2e8f0';
        }

        currentStopFn = window.asciiMount(canvas, effectivePiece, { motion: true });
      } else {
        console.warn('[ASCII-Player] window.asciiMount not found; using fallback');
        startFallbackEngine(cleanName);
      }
    } catch (err) {
      console.warn(`[ASCII-Player] Error playing "${cleanName}":`, err.message);
      startFallbackEngine(cleanName);
    }
  }

  /* ── High-FPS Procedural Fallback Engine ── */
  function startFallbackEngine(type) {
    stopCurrentPiece();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const cols = Math.floor(window.innerWidth / 14);
    const rows = Math.floor(window.innerHeight / 20);
    const chars = ' .:;+=xX$&@';

    function loop() {
      frame++;
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = isMono ? '#cbd5e1' : '#8b5cf6';

      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const val = (Math.sin(c * 0.15 + frame * 0.05) + Math.cos(r * 0.15 + frame * 0.03) + 2) / 4;
          const char = chars[Math.floor(val * (chars.length - 1))];
          ctx.fillText(char, c * 14, r * 20);
        }
      }
      animFallbackId = requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── Hash Change Listener (for parent iframe URL updates) ── */
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      const piece = hash.replace(/^ascii-/, '');
      if (piece) {
        playPiece(piece);
      }
    }
  });

  /* ── Message Listener (from Dashboard / Parent) ── */
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'set-piece' && e.data.piece) {
      const piece = String(e.data.piece).replace(/^ascii-/, '').trim();
      if (piece) {
        try {
          if (window.location.hash !== '#' + piece) {
            window.location.hash = piece;
          }
        } catch (_) {}
        playPiece(piece);
      }
    } else if (e.data.type === 'set-mono') {
      playPiece(activePieceName, !!e.data.mono);
    } else if (e.data.type === 'activate' || e.data.type === 'resize') {
      if (window.ASCII_PIECES && window.ASCII_PIECES[activePieceName]) {
        adjustCanvasLayout(window.ASCII_PIECES[activePieceName].meta);
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.ASCII_PIECES && window.ASCII_PIECES[activePieceName]) {
      adjustCanvasLayout(window.ASCII_PIECES[activePieceName].meta);
    }
  });

  /* ── Public Global API (for direct parent frame invocation) ── */
  window.playAsciiPiece = (piece, mono = isMono) => playPiece(piece, mono);
  window.stopAsciiPiece = stopCurrentPiece;
  window.getActiveAsciiPiece = () => activePieceName;

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => playPiece(activePieceName));
  } else {
    playPiece(activePieceName);
  }
})();
