/**
 * PROJECT: THE EYE WITHIN WORDS — Python Generative Typography Port
 * =================================================================
 * Faithful 1:1 port of the original Python generative typography artwork.
 * Camera is permanently locked at the wide cinematic view (NO auto-zooming).
 * 
 * Controls:
 *   SPACE : Trigger an immediate blink
 *   B     : Enable or disable automatic blinking
 *   C     : Change the color palette
 *   R     : Regenerate a new arrangement of meaningful quotes
 *   H     : Show or hide keyboard instructions
 *   ESC   : Close overlay
 *   Mouse : Subtly influences gaze and camera focus
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. GENERATING MEANINGFUL QUOTES & POETIC VOCABULARY
  // ============================================================================

  const SIGNATURE_QUOTES = [
    "we are made of stars",
    "look beyond what you see",
    "every thought leaves a trace",
    "the universe lives within us",
    "beauty exists in the details",
    "we become what we believe",
    "silence has its own language",
    "nothing is ever truly invisible",
    "your perception creates your world",
    "the truth hides between the lines",
    "every ending begins somewhere",
    "consciousness observing itself",
    "there is more than meets the eye",
    "even darkness carries meaning",
    "wonder is a form of intelligence",
    "the world is written in patterns",
    "what you seek is seeking you",
    "everything is connected",
    "look closer",
    "stay curious"
  ];

  const ADDITIONAL_POETIC_QUOTES = [
    "light remembers where it has been",
    "every question opens an unseen door",
    "we are the universe becoming aware",
    "in stillness the hidden becomes clear",
    "meaning blooms where attention rests",
    "time is a river of quiet revelations",
    "beneath every surface lies another sky",
    "words are the architecture of thought",
    "to truly see is to be transformed",
    "infinite worlds inside a single glance",
    "memory is starlight traveling through mind",
    "the observer and the observed are one",
    "clarity arrives when the mind grows quiet",
    "every heartbeat echoes across eternity",
    "dreams are letters from the unseen self",
    "curiosity is the compass of the soul",
    "shadows only prove the presence of light",
    "vision begins where certainty ends",
    "all things are woven from the same light",
    "listen to the quiet between your thoughts",
    "awareness is the canvas of existence",
    "every moment contains the whole of time",
    "the eye reads what the heart remembers",
    "patterns of light become living thought",
    "seek the poetry hidden in plain sight",
    "nothing seen is ever separate from you",
    "thought is the brushstroke of reality",
    "within the finite dwells the infinite",
    "each breath is a quiet beginning",
    "truth shines brightest in the dark"
  ];

  const MEANINGFUL_SHORT_WORDS = [
    "existence", "perception", "eternity", "wonder", "look closer",
    "stay curious", "consciousness", "clarity", "horizon", "infinity",
    "presence", "silence", "radiance", "reflection", "insight",
    "empathy", "mystery", "serenity", "awakening", "harmony",
    "cosmos", "memory", "origin", "vision", "truth", "light",
    "dream", "spirit", "essence", "timeless", "intimate", "witness",
    "observer", "vivid", "lucid", "transcend", "illuminate", "connect",
    "breathe", "imagine", "perceive", "discover", "believe", "focus"
  ];

  const PUPIL_DARK_WORDS = [
    "within", "silence", "origin", "eternity", "mystery", "depth",
    "unseen", "essence", "center", "stillness", "cosmos", "infinite",
    "shadow", "secret", "truth", "existence", "source", "soul",
    "awareness", "void", "core", "unknown", "singularity", "intimate"
  ];

  const HIGHLIGHT_WORDS = [
    "light", "clarity", "wonder", "truth", "shine", "vision",
    "lucid", "spark", "pure", "awake", "vivid", "radiance",
    "star", "clear", "see", "glow", "illuminate"
  ];

  function createRng(seed) {
    let s = (seed % 2147483647);
    if (s <= 0) s += 2147483646;
    return {
      random() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      },
      uniform(min, max) {
        return min + this.random() * (max - min);
      },
      choice(arr) {
        return arr[Math.floor(this.random() * arr.length)];
      },
      randint(min, max) {
        return Math.floor(min + this.random() * (max - min + 1));
      }
    };
  }

  function generateMeaningfulQuotes(rng, mode = "quote") {
    if (mode === "highlight") return rng.choice(HIGHLIGHT_WORDS);
    if (mode === "pupil") return rng.choice(PUPIL_DARK_WORDS);
    if (mode === "short") return rng.choice(MEANINGFUL_SHORT_WORDS);
    if (mode === "quote") {
      if (rng.random() < 0.48) return rng.choice(SIGNATURE_QUOTES);
      return rng.choice(ADDITIONAL_POETIC_QUOTES);
    }
    const r = rng.random();
    if (r < 0.40) return rng.choice(SIGNATURE_QUOTES);
    if (r < 0.76) return rng.choice(ADDITIONAL_POETIC_QUOTES);
    return rng.choice(MEANINGFUL_SHORT_WORDS);
  }

  // ============================================================================
  // 2. COLOR PALETTES
  // ============================================================================

  const PALETTES = [
    {
      name: "Midnight Poetry — Cyan, Electric Blue & Violet",
      canvasBg: [3, 6, 13],
      bgFieldDark: [
        [36, 58, 96], [42, 66, 108], [46, 50, 92], [32, 52, 86], [50, 74, 118]
      ],
      bgFieldOrbital: [
        [62, 94, 148], [74, 82, 144], [56, 86, 138], [80, 110, 164]
      ],
      scleraColors: [
        [244, 248, 255], [242, 236, 224], [208, 224, 244], [184, 212, 242], [228, 236, 248]
      ],
      irisOuter: [
        [32, 78, 175], [68, 52, 168], [24, 108, 168], [82, 58, 182]
      ],
      irisMid: [
        [0, 222, 252], [22, 238, 218], [45, 155, 255], [118, 82, 248], [0, 198, 210], [68, 195, 255]
      ],
      irisInner: [
        [135, 250, 255], [85, 235, 255], [185, 245, 255], [162, 138, 255]
      ],
      irisAlt: [
        [142, 78, 252], [0, 242, 218], [48, 178, 255], [178, 105, 255]
      ],
      pupilWords: [
        [28, 44, 78], [34, 52, 90], [42, 38, 82], [24, 38, 68]
      ],
      highlightWords: [
        [255, 255, 255], [222, 248, 255], [190, 240, 255]
      ],
      eyelidRim: [
        [232, 244, 255], [196, 222, 250], [172, 206, 245], [218, 232, 252]
      ],
      eyelidSheet: [
        [98, 136, 192], [108, 98, 172], [84, 118, 172], [124, 156, 208]
      ],
      accentTint: [0, 195, 245]
    },
    {
      name: "Bioluminescent Verse — Turquoise, Emerald & Deep Navy",
      canvasBg: [3, 9, 12],
      bgFieldDark: [
        [30, 66, 76], [36, 74, 86], [28, 58, 72], [42, 82, 92]
      ],
      bgFieldOrbital: [
        [54, 108, 118], [62, 118, 128], [48, 96, 112]
      ],
      scleraColors: [
        [242, 250, 248], [238, 235, 224], [202, 228, 226], [178, 216, 220]
      ],
      irisOuter: [
        [16, 96, 102], [24, 76, 128], [14, 112, 92], [38, 64, 134]
      ],
      irisMid: [
        [0, 230, 184], [20, 240, 212], [38, 188, 238], [16, 210, 152]
      ],
      irisInner: [
        [142, 255, 228], [98, 248, 242], [182, 255, 238], [82, 238, 198]
      ],
      irisAlt: [
        [0, 198, 245], [52, 248, 168], [26, 224, 218], [112, 252, 204]
      ],
      pupilWords: [
        [22, 46, 54], [28, 54, 66], [26, 42, 62]
      ],
      highlightWords: [
        [255, 255, 255], [222, 255, 248], [188, 248, 240]
      ],
      eyelidRim: [
        [226, 248, 244], [188, 228, 222], [164, 212, 208]
      ],
      eyelidSheet: [
        [84, 150, 156], [74, 126, 144], [102, 166, 170]
      ],
      accentTint: [0, 215, 175]
    },
    {
      name: "Astral Manuscript — Amethyst, Starlight & Indigo",
      canvasBg: [6, 5, 14],
      bgFieldDark: [
        [48, 44, 88], [56, 50, 98], [42, 52, 92], [62, 54, 108]
      ],
      bgFieldOrbital: [
        [82, 74, 138], [74, 86, 142], [94, 82, 152]
      ],
      scleraColors: [
        [248, 245, 254], [242, 236, 228], [216, 212, 238], [192, 206, 242]
      ],
      irisOuter: [
        [78, 42, 152], [106, 36, 142], [48, 56, 158], [92, 34, 128]
      ],
      irisMid: [
        [176, 88, 252], [124, 112, 255], [218, 84, 228], [72, 174, 255]
      ],
      irisInner: [
        [236, 188, 255], [196, 222, 255], [248, 204, 255], [162, 236, 255]
      ],
      irisAlt: [
        [92, 182, 255], [232, 108, 250], [154, 124, 255], [244, 144, 236]
      ],
      pupilWords: [
        [36, 28, 68], [44, 34, 80], [30, 38, 74]
      ],
      highlightWords: [
        [255, 255, 255], [245, 238, 255], [218, 242, 255]
      ],
      eyelidRim: [
        [240, 230, 255], [208, 196, 242], [186, 204, 248]
      ],
      eyelidSheet: [
        [128, 110, 186], [104, 120, 178], [144, 124, 198]
      ],
      accentTint: [168, 92, 248]
    }
  ];

  // ============================================================================
  // 3. FONT MANAGEMENT & MEASUREMENT
  // ============================================================================

  const FONT_FAMILY = "'Outfit', 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const measureCache = new Map();

  function getFontString(size, bold = false) {
    const weight = bold ? '600' : '400';
    return `${weight} ${Math.round(size)}px ${FONT_FAMILY}`;
  }

  function measureText(ctx, text, size, bold = false) {
    const key = `${text}|${size}|${bold}`;
    if (measureCache.has(key)) return measureCache.get(key);
    ctx.font = getFontString(size, bold);
    const metrics = ctx.measureText(text);
    const w = Math.max(4, metrics.width);
    measureCache.set(key, w);
    return w;
  }

  function drawWord(ctx, text, cx, cy, size, angleDeg, colorRgba, bold = false) {
    ctx.save();
    ctx.translate(cx, cy);
    if (Math.abs(angleDeg) > 0.05) {
      ctx.rotate((angleDeg * Math.PI) / 180.0);
    }
    ctx.font = getFontString(size, bold);
    ctx.fillStyle = `rgba(${colorRgba[0]}, ${colorRgba[1]}, ${colorRgba[2]}, ${colorRgba[3] / 255.0})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // ============================================================================
  // 4. SPATIAL GEOMETRY & CURVES (Identical to Python)
  // ============================================================================

  function calculateGeometry(screenW, screenH) {
    const canvasMult = 1.55;
    let canvasW = Math.round(screenW * canvasMult);
    let canvasH = Math.round(screenH * canvasMult);
    if (canvasW % 2 === 1) canvasW++;
    if (canvasH % 2 === 1) canvasH++;

    const centerX = Math.floor(canvasW / 2);
    const centerY = Math.floor(canvasH / 2);

    const scale = Math.min(screenW / 1512.0, screenH / 982.0) * 1.18;

    const wideViewW = canvasW * 0.82;
    const wideViewH = canvasH * 0.82;
    const eyeHalfW = wideViewW * 0.455;
    const eyeHalfH = wideViewH * 0.285;

    const irisRadius = eyeHalfH * 1.02;
    const pupilRadius = irisRadius * 0.34;

    return {
      screenW,
      screenH,
      canvasW,
      canvasH,
      centerX,
      centerY,
      wideViewW,
      wideViewH,
      eyeHalfW,
      eyeHalfH,
      irisRadius,
      pupilRadius,
      scale
    };
  }

  function evalEyelidCurves(u, openness, geom) {
    const uClamped = Math.max(-1.0, Math.min(1.0, u));
    const env = Math.pow(Math.max(0.0, 1.0 - uClamped * uClamped), 0.76);

    const upperArch = 1.0 - 0.11 * uClamped - 0.06 * (uClamped * uClamped);
    const lowerArch = 1.0 + 0.13 * uClamped - 0.05 * (uClamped * uClamped);

    let yUpperOpen = -geom.eyeHalfH * 1.04 * env * upperArch;
    let yLowerOpen = geom.eyeHalfH * 0.88 * env * lowerArch;

    const medialDip = 0.09 * geom.eyeHalfH * Math.exp(-Math.pow((uClamped + 0.89) / 0.20, 2));
    const lateralSweep = -0.06 * geom.eyeHalfH * Math.exp(-Math.pow((uClamped - 0.86) / 0.25, 2));
    const cornerLine = medialDip + lateralSweep;

    yUpperOpen += cornerLine;
    yLowerOpen += cornerLine;

    const yClosed = geom.eyeHalfH * 0.16 * env + cornerLine;

    const t = Math.max(0.0, Math.min(1.0, openness));
    const yUpper = yClosed * (1.0 - t) + yUpperOpen * t;
    const yLower = yClosed * (1.0 - t) + yLowerOpen * t;
    return { yUpper, yLower, yUpperOpen, yLowerOpen, yClosed };
  }

  function evalFieldStreamlineY(x, baseYOffset, geom) {
    const u = (x - geom.centerX) / geom.eyeHalfW;
    const gaussianBell = Math.exp(-0.5 * Math.pow(u / 0.76, 2));
    const normY = Math.abs(baseYOffset) / Math.max(1.0, geom.eyeHalfH);
    const distAtten = Math.exp(-normY / 1.85);
    const archPush = baseYOffset * 0.42 * gaussianBell * distAtten;
    return geom.centerY + baseYOffset + archPush;
  }

  // ============================================================================
  // 5. PRECOMPUTING VIRTUAL CANVASES (Matching Python 1:1)
  // ============================================================================

  function buildLayers(geom, palette, rng) {
    // ------------------------------------------------------------------------
    // A. FULL-CANVAS WALL OF POETRY (100% Edge-to-Edge)
    // ------------------------------------------------------------------------
    const fieldCanvas = document.createElement('canvas');
    fieldCanvas.width = geom.canvasW;
    fieldCanvas.height = geom.canvasH;
    const fCtx = fieldCanvas.getContext('2d');

    fCtx.fillStyle = `rgb(${palette.canvasBg.join(',')})`;
    fCtx.fillRect(0, 0, geom.canvasW, geom.canvasH);

    const rowSpacing = Math.max(16.0, 18.0 * geom.scale);
    const maxYExtent = geom.canvasH * 0.54;

    for (let baseYOff = -maxYExtent, rIdx = 0; baseYOff <= maxYExtent; baseYOff += rowSpacing, rIdx++) {
      let fsize;
      if (rIdx % 4 === 0) fsize = Math.max(10, Math.round(12.8 * geom.scale));
      else if (rIdx % 2 === 0) fsize = Math.max(9, Math.round(11.4 * geom.scale));
      else fsize = Math.max(8, Math.round(10.2 * geom.scale));

      let xCursor = 6.0 + rng.uniform(0.0, 18.0);
      while (xCursor < geom.canvasW - 8.0) {
        const text = generateMeaningfulQuotes(rng, "mixed");
        const isBold = (rIdx % 5 === 0);
        const wPx = measureText(fCtx, text, fsize, isBold);
        const gapPx = Math.max(10.0, 12.0 * geom.scale);
        const wx = xCursor + wPx * 0.5;

        if (wx - wPx * 0.5 > geom.canvasW) break;

        const ySample0 = evalFieldStreamlineY(wx - 12.0, baseYOff, geom);
        const ySample1 = evalFieldStreamlineY(wx, baseYOff, geom);
        const ySample2 = evalFieldStreamlineY(wx + 12.0, baseYOff, geom);
        const wy = ySample1;

        if (wy >= -20.0 && wy <= geom.canvasH + 20.0) {
          const slope = (ySample2 - ySample0) / 24.0;
          const angle = -(Math.atan(slope) * 180.0) / Math.PI;

          const uRel = (wx - geom.centerX) / geom.eyeHalfW;
          const vRel = (wy - geom.centerY) / geom.eyeHalfH;
          const ellipticalDist = Math.hypot(uRel * 0.88, vRel * 0.78);

          const openCurves = evalEyelidCurves(uRel, 1.0, geom);
          const closedCurves = evalEyelidCurves(uRel, 0.0, geom);
          const yuOpen = openCurves.yUpper;
          const ylOpen = openCurves.yLower;
          const yClosed = closedCurves.yUpper;
          const dyFromCenter = wy - geom.centerY;

          let col, shade, alpha;
          let boldText = isBold;

          if (Math.abs(uRel) <= 1.03 && (yuOpen - 46.0 * geom.scale) <= dyFromCenter && dyFromCenter <= (ylOpen + 42.0 * geom.scale)) {
            const distToClosedSeam = Math.abs(dyFromCenter - yClosed);
            const distToUpperOpen = Math.abs(dyFromCenter - yuOpen);
            const distToLowerOpen = Math.abs(dyFromCenter - ylOpen);

            if (distToClosedSeam < 15.0 * geom.scale) {
              col = rng.choice(palette.eyelidRim);
              shade = 1.0;
              alpha = 252;
              boldText = true;
            } else if (distToUpperOpen < 24.0 * geom.scale || distToLowerOpen < 22.0 * geom.scale) {
              col = rng.choice(palette.eyelidRim);
              shade = 0.92;
              alpha = rng.randint(225, 250);
              boldText = true;
            } else {
              col = rng.choice(palette.eyelidSheet);
              shade = Math.max(0.68, 1.0 - 0.25 * Math.abs(uRel));
              alpha = rng.randint(205, 240);
            }
          } else if (ellipticalDist < 1.58) {
            col = rng.choice(palette.bgFieldOrbital);
            const tHalo = Math.max(0.0, (ellipticalDist - 1.0) / 0.58);
            shade = 1.0 - 0.24 * tHalo;
            alpha = rng.randint(205, 240);
          } else {
            col = rng.choice(palette.bgFieldDark);
            const wave = 0.88 + 0.12 * Math.sin(uRel * 2.0 + vRel * 1.6);
            shade = wave;
            alpha = rng.randint(200, 238);
          }

          const r = Math.min(255, Math.round(col[0] * shade));
          const g = Math.min(255, Math.round(col[1] * shade));
          const b = Math.min(255, Math.round(col[2] * shade));
          drawWord(fCtx, text, wx, wy, fsize, angle, [r, g, b, alpha], boldText);
        }

        xCursor += wPx + gapPx;
      }
    }

    // ------------------------------------------------------------------------
    // B. SCLERA TYPOGRAPHY (Dense 28 Rows of Ivory & Starlight Quotes)
    // ------------------------------------------------------------------------
    const scleraCanvas = document.createElement('canvas');
    scleraCanvas.width = geom.canvasW;
    scleraCanvas.height = geom.canvasH;
    const sCtx = scleraCanvas.getContext('2d');

    sCtx.save();
    sCtx.beginPath();
    const polySteps = 96;
    for (let i = 0; i <= polySteps; i++) {
      const u = -1.0 + (2.0 * i) / polySteps;
      const x = geom.centerX + u * geom.eyeHalfW;
      const cur = evalEyelidCurves(u, 1.0, geom);
      if (i === 0) sCtx.moveTo(x, geom.centerY + cur.yUpper);
      else sCtx.lineTo(x, geom.centerY + cur.yUpper);
    }
    for (let i = polySteps; i >= 0; i--) {
      const u = -1.0 + (2.0 * i) / polySteps;
      const x = geom.centerX + u * geom.eyeHalfW;
      const cur = evalEyelidCurves(u, 1.0, geom);
      sCtx.lineTo(x, geom.centerY + cur.yLower);
    }
    sCtx.closePath();
    sCtx.fillStyle = 'rgba(6, 11, 22, 0.98)';
    sCtx.fill();
    sCtx.restore();

    const nScleraRows = 28;
    for (let rowIdx = 0; rowIdx < nScleraRows; rowIdx++) {
      const vFrac = (rowIdx + 0.5) / nScleraRows;
      const fsize = Math.max(9, Math.round((10.2 + 3.6 * Math.sin(vFrac * Math.PI)) * geom.scale));
      let uCursor = -0.97 + rng.uniform(0.0, 0.025);

      while (uCursor < 0.97) {
        const mode = Math.abs(uCursor) > 0.74 ? "short" : "mixed";
        const quote = generateMeaningfulQuotes(rng, mode);
        const isBold = (rowIdx % 4 === 0);
        const wPx = measureText(sCtx, quote, fsize, isBold);
        const du = (wPx + 8.0 * geom.scale) / geom.eyeHalfW;
        const uMid = uCursor + du * 0.5;
        if (uMid > 0.97) break;

        const cMid = evalEyelidCurves(uMid, 1.0, geom);
        const yu = cMid.yUpper;
        const yl = cMid.yLower;

        if (yl - yu < fsize * 0.75) {
          uCursor += du * 0.65;
          continue;
        }

        const wyRel = yu + vFrac * (yl - yu);
        const wxRel = uMid * geom.eyeHalfW;

        const c0 = evalEyelidCurves(uMid - 0.025, 1.0, geom);
        const c2 = evalEyelidCurves(uMid + 0.025, 1.0, geom);
        const y0 = c0.yUpper + vFrac * (c0.yLower - c0.yUpper);
        const y2 = c2.yUpper + vFrac * (c2.yLower - c2.yUpper);
        const slope = (y2 - y0) / (0.05 * geom.eyeHalfW);
        const angle = -(Math.atan(slope) * 180.0) / Math.PI;

        const distX = Math.abs(uMid);
        const distY = Math.abs(vFrac - 0.52) * 1.7;
        const sphereShade = Math.max(
          0.38,
          Math.min(1.0, 1.16 - 0.62 * Math.pow(distX, 1.55) - 0.22 * Math.pow(distY, 1.5))
        );
        const lidShadow = Math.min(1.0, 0.56 + 0.70 * vFrac);
        const brightness = sphereShade * lidShadow;

        const baseCol = rng.choice(palette.scleraColors);
        const r = Math.min(255, Math.round(baseCol[0] * brightness));
        const g = Math.min(255, Math.round(baseCol[1] * brightness));
        const b = Math.min(255, Math.round(baseCol[2] * brightness));
        const alpha = Math.min(255, Math.round(205 + 50 * brightness));

        drawWord(sCtx, quote, geom.centerX + wxRel, geom.centerY + wyRel, fsize, angle, [r, g, b, alpha], isBold);
        uCursor += du;
      }
    }

    // ------------------------------------------------------------------------
    // C. IRIS TYPOGRAPHY (15 Concentric Rings + 84 Radial Spokes)
    // ------------------------------------------------------------------------
    let irisDim = Math.round(geom.irisRadius * 2.38);
    if (irisDim % 2 === 1) irisDim++;
    const icx = Math.floor(irisDim / 2);
    const icy = Math.floor(irisDim / 2);

    const ringsCanvasA = document.createElement('canvas');
    ringsCanvasA.width = irisDim;
    ringsCanvasA.height = irisDim;
    const rCtxA = ringsCanvasA.getContext('2d');

    const ringsCanvasB = document.createElement('canvas');
    ringsCanvasB.width = irisDim;
    ringsCanvasB.height = irisDim;
    const rCtxB = ringsCanvasB.getContext('2d');

    [rCtxA, rCtxB].forEach(ctx => {
      ctx.beginPath();
      ctx.arc(icx, icy, geom.irisRadius * 0.98, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 10, 22, 0.96)';
      ctx.fill();
    });

    // 15 Concentric Rings
    const nRings = 15;
    for (let rIdx = 0; rIdx < nRings; rIdx++) {
      const rFrac = 0.96 - (rIdx / (nRings - 1)) * (0.96 - 0.37);
      const rad = geom.irisRadius * rFrac;
      const fsize = Math.max(8, Math.round((8.8 + (1.0 - rFrac) * 4.2) * geom.scale));
      const isBold = (rIdx % 3 === 0);
      let thetaCur = rng.uniform(0, Math.PI * 2);
      const thetaEnd = thetaCur + Math.PI * 2 - 0.03;

      while (thetaCur < thetaEnd) {
        let word = generateMeaningfulQuotes(rng, rFrac < 0.58 ? "short" : "mixed");
        if (word.length > 22) word = generateMeaningfulQuotes(rng, "short");
        const wPx = measureText(rCtxA, word, fsize, isBold);
        const dTheta = (wPx + 6.0 * geom.scale) / Math.max(24.0, rad);
        const thetaMid = thetaCur + dTheta * 0.5;
        if (thetaMid > thetaEnd) break;

        const wx = icx + rad * Math.cos(thetaMid);
        const wy = icy + rad * Math.sin(thetaMid);

        let degTangent = -((thetaMid * 180.0) / Math.PI) - 90.0;
        let modDeg = ((degTangent % 360) + 360) % 360;
        if (modDeg > 90 && modDeg < 270) degTangent += 180.0;

        let colA, colB, alpha;
        if (rFrac > 0.84) {
          colA = rng.choice(palette.irisOuter);
          colB = rng.choice(palette.irisMid);
          alpha = 248;
        } else if (rFrac > 0.48) {
          colA = rng.choice(palette.irisMid);
          colB = rng.choice(palette.irisAlt);
          alpha = 252;
        } else {
          colA = rng.choice(palette.irisInner);
          colB = rng.choice(palette.irisAlt);
          alpha = 255;
        }

        drawWord(rCtxA, word, wx, wy, fsize, degTangent, [...colA, alpha], isBold);
        drawWord(rCtxB, word, wx, wy, fsize, degTangent, [...colB, alpha], isBold);
        thetaCur += dTheta;
      }
    }

    // 84 Radial Spokes
    const radialCanvasA = document.createElement('canvas');
    radialCanvasA.width = irisDim;
    radialCanvasA.height = irisDim;
    const radCtxA = radialCanvasA.getContext('2d');

    const radialCanvasB = document.createElement('canvas');
    radialCanvasB.width = irisDim;
    radialCanvasB.height = irisDim;
    const radCtxB = radialCanvasB.getContext('2d');

    const nSpokes = 84;
    for (let sIdx = 0; sIdx < nSpokes; sIdx++) {
      const theta = (sIdx / nSpokes) * Math.PI * 2 + rng.uniform(-0.015, 0.015);
      const rBand = rng.uniform(0.46, 0.84);
      const rad = geom.irisRadius * rBand;
      const wx = icx + rad * Math.cos(theta);
      const wy = icy + rad * Math.sin(theta);

      let degRadial = -((theta * 180.0) / Math.PI);
      let modDeg = ((degRadial % 360) + 360) % 360;
      if (modDeg > 90 && modDeg < 270) degRadial += 180.0;

      const word = generateMeaningfulQuotes(rng, "short");
      const fsize = Math.max(8, Math.round(rng.uniform(8.2, 11.0) * geom.scale));
      const colA = rng.choice(rBand < 0.60 ? palette.irisInner : palette.irisMid);
      const colB = rng.choice(palette.irisAlt);
      const alpha = rng.randint(165, 225);

      drawWord(radCtxA, word, wx, wy, fsize, degRadial, [...colA, alpha], false);
      drawWord(radCtxB, word, wx, wy, fsize, degRadial, [...colB, alpha], false);
    }

    // Clear pupil center hole from iris layers
    [rCtxA, rCtxB, radCtxA, radCtxB].forEach(ctx => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(icx, icy, geom.pupilRadius * 0.98, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
      ctx.restore();
    });

    // Iris Glow Layer
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = irisDim;
    glowCanvas.height = irisDim;
    const gCtx = glowCanvas.getContext('2d');
    const glowGrad = gCtx.createRadialGradient(icx, icy, geom.pupilRadius, icx, icy, geom.irisRadius * 1.05);
    glowGrad.addColorStop(0, `rgba(${palette.accentTint[0]}, ${palette.accentTint[1]}, ${palette.accentTint[2]}, 0.45)`);
    glowGrad.addColorStop(0.65, `rgba(${palette.accentTint[0]}, ${palette.accentTint[1]}, ${palette.accentTint[2]}, 0.16)`);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    gCtx.fillStyle = glowGrad;
    gCtx.fillRect(0, 0, irisDim, irisDim);

    // ------------------------------------------------------------------------
    // D. PUPIL TYPOGRAPHY (Concentric Rings in Pupil + Center Mystery Word)
    // ------------------------------------------------------------------------
    let pupilDim = Math.round(geom.pupilRadius * 2.45);
    if (pupilDim % 2 === 1) pupilDim++;
    const pcx = Math.floor(pupilDim / 2);
    const pcy = Math.floor(pupilDim / 2);

    const pupilCanvas = document.createElement('canvas');
    pupilCanvas.width = pupilDim;
    pupilCanvas.height = pupilDim;
    const pCtx = pupilCanvas.getContext('2d');

    pCtx.beginPath();
    pCtx.arc(pcx, pcy, geom.pupilRadius * 0.97, 0, Math.PI * 2);
    pCtx.fillStyle = 'rgba(3, 5, 11, 0.98)';
    pCtx.fill();

    const pupilFracs = [0.88, 0.72, 0.56, 0.40, 0.24];
    for (const pFrac of pupilFracs) {
      const radP = geom.pupilRadius * pFrac;
      const fsize = Math.max(7, Math.round((8.2 + (1.0 - pFrac) * 1.8) * geom.scale));
      let thCur = rng.uniform(0, Math.PI * 2);
      const thEnd = thCur + Math.PI * 2 - 0.06;

      while (thCur < thEnd) {
        const word = generateMeaningfulQuotes(rng, "pupil");
        const wPx = measureText(pCtx, word, fsize, false);
        const dTh = Math.max(0.32, (wPx + 4.5 * geom.scale) / Math.max(12.0, radP));
        const thMid = thCur + dTh * 0.5;
        if (thMid > thEnd) break;

        const wx = pcx + radP * Math.cos(thMid);
        const wy = pcy + radP * Math.sin(thMid);

        let deg = -((thMid * 180.0) / Math.PI) - 90.0;
        let modDeg = ((deg % 360) + 360) % 360;
        if (modDeg > 90 && modDeg < 270) deg += 180.0;

        const col = rng.choice(palette.pupilWords);
        const visCol = [
          Math.min(255, col[0] + 26),
          Math.min(255, col[1] + 40),
          Math.min(255, col[2] + 68),
          255
        ];
        drawWord(pCtx, word, wx, wy, fsize, deg, visCol, false);
        thCur += dTh;
      }
    }

    const centerWord = rng.choice(["consciousness", "look within", "existence", "eternity", "origin"]);
    drawWord(pCtx, centerWord, pcx, pcy, Math.max(8, Math.round(9.2 * geom.scale)), 0.0, [62, 92, 148, 255], true);

    // ------------------------------------------------------------------------
    // E. CORNEAL SPECULAR HIGHLIGHTS
    // ------------------------------------------------------------------------
    const hlCanvas = document.createElement('canvas');
    hlCanvas.width = irisDim;
    hlCanvas.height = irisDim;
    const hlCtx = hlCanvas.getContext('2d');

    const hl1Cx = icx - geom.irisRadius * 0.34;
    const hl1Cy = icy - geom.irisRadius * 0.32;
    for (let rowH = -2; rowH <= 2; rowH++) {
      for (let colH = -1; colH <= 1; colH++) {
        const word = generateMeaningfulQuotes(rng, "highlight");
        const fsize = Math.max(8, Math.round((10.5 - Math.abs(rowH) * 0.5) * geom.scale));
        const col = rng.choice(palette.highlightWords);
        const dxH = colH * 34.0 * geom.scale;
        const dyH = rowH * 14.0 * geom.scale;
        const angRad = (-24.0 * Math.PI) / 180.0;
        const rx = dxH * Math.cos(angRad) - dyH * Math.sin(angRad);
        const ry = dxH * Math.sin(angRad) + dyH * Math.cos(angRad);
        const alpha = Math.max(195, 255 - (Math.abs(rowH) * 18 + Math.abs(colH) * 16));
        drawWord(hlCtx, word, hl1Cx + rx, hl1Cy + ry, fsize, -24.0, [...col, alpha], true);
      }
    }

    const hl2Cx = icx + geom.irisRadius * 0.36;
    const hl2Cy = icy + geom.irisRadius * 0.35;
    for (let kH = -2; kH <= 2; kH++) {
      const word = generateMeaningfulQuotes(rng, "highlight");
      const fsize = Math.max(7, Math.round(9.0 * geom.scale));
      const col = rng.choice(palette.highlightWords);
      const dxH = kH * 28.0 * geom.scale;
      const dyH = -Math.abs(kH) * 3.5 * geom.scale;
      const angRad = (-28.0 * Math.PI) / 180.0;
      const rx = dxH * Math.cos(angRad) - dyH * Math.sin(angRad);
      const ry = dxH * Math.sin(angRad) + dyH * Math.cos(angRad);
      drawWord(hlCtx, word, hl2Cx + rx, hl2Cy + ry, fsize, -28.0, [...col, 225], true);
    }

    // ------------------------------------------------------------------------
    // F. EYELID RIM WORDS
    // ------------------------------------------------------------------------
    const rimWords = [];
    const measureDummyCtx = document.createElement('canvas').getContext('2d');

    function buildCleanRimStream(isUpper, vOff, fsize) {
      let uCur = -0.98 + rng.uniform(0.0, 0.02);
      while (uCur < 0.98) {
        let phrase = generateMeaningfulQuotes(rng, Math.abs(uCur) > 0.65 ? "short" : "mixed");
        if (phrase.length > 22) phrase = generateMeaningfulQuotes(rng, "short");
        const wPx = measureText(measureDummyCtx, phrase, fsize, true);

        const c0 = evalEyelidCurves(uCur - 0.02, 1.0, geom);
        const c1 = evalEyelidCurves(uCur + 0.02, 1.0, geom);
        const localSlope = isUpper ? (c1.yUpper - c0.yUpper) / (0.04 * geom.eyeHalfW) : (c1.yLower - c0.yLower) / (0.04 * geom.eyeHalfW);
        const cosTheta = 1.0 / Math.sqrt(1.0 + localSlope * localSlope);
        const du = ((wPx + 12.0 * geom.scale) * Math.max(0.65, cosTheta)) / geom.eyeHalfW;
        const uMid = uCur + du * 0.5;
        if (uMid > 0.98) break;

        const col = rng.choice(palette.eyelidRim);
        const edgeAtten = Math.max(0.45, 1.0 - 0.50 * Math.pow(Math.abs(uMid), 2.4));
        const alpha = Math.round(250 * edgeAtten);

        rimWords.push({
          u: uMid,
          vOffset: vOff,
          isUpper,
          text: phrase,
          fsize,
          color: [...col, alpha]
        });

        uCur += du;
      }
    }

    buildCleanRimStream(true, -9.0 * geom.scale, Math.max(10, Math.round(12.2 * geom.scale)));
    buildCleanRimStream(false, 9.0 * geom.scale, Math.max(10, Math.round(11.6 * geom.scale)));

    return {
      fieldCanvas,
      scleraCanvas,
      ringsCanvasA,
      ringsCanvasB,
      radialCanvasA,
      radialCanvasB,
      glowCanvas,
      pupilCanvas,
      hlCanvas,
      irisDim,
      pupilDim,
      rimWords
    };
  }

  // ============================================================================
  // 6. BIOLOGICAL BLINK CONTROLLER
  // ============================================================================

  class BlinkController {
    constructor() {
      this.autoBlink = true;
      this.isBlinking = false;
      this.blinkStart = 0.0;
      this.closeDur = 0.125;
      this.holdDur = 0.045;
      this.openDur = 0.225;
      this.queuedDouble = false;
      this.nextBlinkTime = performance.now() * 0.001 + 3.0;
    }

    triggerBlink(nowSec, allowDouble = true) {
      this.isBlinking = true;
      this.blinkStart = nowSec;
      this.closeDur = 0.115 + Math.random() * 0.025;
      this.holdDur = 0.038 + Math.random() * 0.020;
      this.openDur = 0.200 + Math.random() * 0.060;
      this.queuedDouble = allowDouble && (Math.random() < 0.24);
      this.nextBlinkTime = nowSec + 3.0 + Math.random() * 3.0;
    }

    update(nowSec) {
      if (this.autoBlink && !this.isBlinking && nowSec >= this.nextBlinkTime) {
        this.triggerBlink(nowSec, true);
      }

      if (!this.isBlinking) return 1.0;

      const elapsed = nowSec - this.blinkStart;
      const total = this.closeDur + this.holdDur + this.openDur;

      if (elapsed < 0.0) return 1.0;
      if (elapsed < this.closeDur) {
        const u = elapsed / this.closeDur;
        const ease = 3.0 * (u * u) - 2.0 * (u * u * u);
        return Math.max(0.0, 1.0 - ease);
      } else if (elapsed < this.closeDur + this.holdDur) {
        return 0.0;
      } else if (elapsed < total) {
        const u = (elapsed - this.closeDur - this.holdDur) / this.openDur;
        const ease = 1.0 - Math.pow(1.0 - u, 2.6);
        return Math.min(1.0, ease);
      } else {
        if (this.queuedDouble) {
          this.queuedDouble = false;
          this.triggerBlink(nowSec + 0.045, false);
        } else {
          this.isBlinking = false;
        }
        return 1.0;
      }
    }
  }

  // ============================================================================
  // 7. ROCK-SOLID FIXED CAMERA & GAZE TRACKER (SCREEN DOES NOT MOVE!)
  // ============================================================================

  class FixedWideGazeTracker {
    constructor() {
      this.gazeX = 0;
      this.gazeY = 0;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.lastMouseTime = 0;
    }

    onMouseMove(clientX, clientY, nowSec) {
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
      this.lastMouseTime = nowSec;
    }

    update(geom, nowSec, dt) {
      const maxGx = geom.screenW * 0.020;
      const maxGy = geom.screenH * 0.016;

      let targetGx = 0;
      let targetGy = 0;
      // Only track gaze when the mouse was recently moved; otherwise rest dead-center
      if (nowSec - this.lastMouseTime < 3.0) {
        const nx = (this.lastMouseX - geom.screenW * 0.5) / Math.max(1.0, geom.screenW * 0.5);
        const ny = (this.lastMouseY - geom.screenH * 0.5) / Math.max(1.0, geom.screenH * 0.5);
        targetGx = Math.max(-1.0, Math.min(1.0, nx)) * maxGx;
        targetGy = Math.max(-1.0, Math.min(1.0, ny)) * maxGy;
      }

      const smooth = Math.min(1.0, dt * 5.0);
      this.gazeX += (targetGx - this.gazeX) * smooth;
      this.gazeY += (targetGy - this.gazeY) * smooth;

      const viewW = Math.round(geom.wideViewW);
      const viewH = Math.round(geom.wideViewH);

      // 100% FIXED camera crop — the screen and background NEVER move!
      const left = Math.floor((geom.canvasW - viewW) / 2);
      const top = Math.floor((geom.canvasH - viewH) / 2);

      return {
        gazeX: this.gazeX,
        gazeY: this.gazeY,
        left,
        top,
        viewW,
        viewH
      };
    }
  }

  // ============================================================================
  // 8. MAIN ENGINE & COMPOSITION LOOP
  // ============================================================================

  class EyeWithinWordsWallpaper {
    constructor() {
      this.canvas = document.getElementById('eye-canvas');
      this.ctx = this.canvas.getContext('2d');

      this.paletteIdx = 0;
      this.seed = Math.floor(10000 + Math.random() * 900000);
      this.blinkCtrl = new BlinkController();
      this.camera = new FixedWideGazeTracker();

      this.showHelp = false;
      this.fps = 60;
      this.fpsFrames = 0;
      this.fpsLastTime = performance.now();

      this.geom = calculateGeometry(window.innerWidth, window.innerHeight);
      this.layers = null;

      // Virtual Frame Surface (matching virtual_frame_surf in Python)
      this.virtualCanvas = document.createElement('canvas');
      this.virtualCtx = this.virtualCanvas.getContext('2d');

      // Eye Box Canvas & Mask (matching eye_box_canvas in Python)
      this.eyeBoxCanvas = document.createElement('canvas');
      this.eyeBoxCtx = this.eyeBoxCanvas.getContext('2d');

      this.initDomElements();
      this.bindEvents();
      this.rebuildLayers();
      this.animate();
    }

    initDomElements() {
      this.hudEl = document.getElementById('help-hud');
      this.hudPaletteName = document.getElementById('hud-palette-name');
      this.hudBlinkState = document.getElementById('hud-blink-state');
      this.hudFps = document.getElementById('hud-fps');
      this.blinkStatus = document.getElementById('blink-status');
    }

    rebuildLayers() {
      const sw = window.innerWidth;
      const sh = window.innerHeight;
      this.geom = calculateGeometry(sw, sh);

      this.virtualCanvas.width = this.geom.canvasW;
      this.virtualCanvas.height = this.geom.canvasH;

      const boxW = Math.round(this.geom.eyeHalfW * 2.25);
      const boxH = Math.round(this.geom.eyeHalfH * 2.65);
      this.eyeBoxCanvas.width = boxW;
      this.eyeBoxCanvas.height = boxH;
      this.eyeBoxRect = {
        w: boxW,
        h: boxH,
        left: this.geom.centerX - Math.floor(boxW / 2),
        top: this.geom.centerY - Math.floor(boxH / 2)
      };

      const palette = PALETTES[this.paletteIdx];
      const rng = createRng(this.seed);
      this.layers = buildLayers(this.geom, palette, rng);
      this.updateUiState();
    }

    updateUiState() {
      const palette = PALETTES[this.paletteIdx];
      if (this.hudPaletteName) this.hudPaletteName.textContent = palette.name;
      if (this.hudBlinkState) this.hudBlinkState.textContent = this.blinkCtrl.autoBlink ? 'AUTO' : 'MANUAL';
      if (this.blinkStatus) this.blinkStatus.textContent = this.blinkCtrl.autoBlink ? 'Blink Auto' : 'Blink Manual';
    }

    toggleHelp() {
      this.showHelp = !this.showHelp;
      if (this.hudEl) {
        if (this.showHelp) this.hudEl.classList.remove('hidden');
        else this.hudEl.classList.add('hidden');
      }
    }

    nextPalette() {
      this.paletteIdx = (this.paletteIdx + 1) % PALETTES.length;
      this.rebuildLayers();
    }

    regenerate() {
      this.seed = Math.floor(10000 + Math.random() * 900000);
      this.rebuildLayers();
    }

    handleAction(action) {
      const nowSec = performance.now() * 0.001;
      switch (action) {
        case 'blink':
          this.blinkCtrl.triggerBlink(nowSec, false);
          break;
        case 'palette':
          this.nextPalette();
          break;
        case 'toggle-autoblink':
          this.blinkCtrl.autoBlink = !this.blinkCtrl.autoBlink;
          this.updateUiState();
          break;
        case 'regen':
          this.regenerate();
          break;
        case 'help':
          this.toggleHelp();
          break;
        case 'escape':
          if (this.showHelp) this.toggleHelp();
          break;
      }
    }

    bindEvents() {
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const key = e.key.toLowerCase();
        if (key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.handleAction('blink');
        } else if (key === 'b') {
          this.handleAction('toggle-autoblink');
        } else if (key === 'c') {
          this.handleAction('palette');
        } else if (key === 'r') {
          this.handleAction('regen');
        } else if (key === 'h') {
          this.handleAction('help');
        } else if (e.key === 'Escape') {
          this.handleAction('escape');
        }
      });

      window.addEventListener('mousemove', (e) => {
        this.camera.onMouseMove(e.clientX, e.clientY, performance.now() * 0.001);
      }, { passive: true });

      let resizeTimeout = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.rebuildLayers();
        }, 150);
      }, { passive: true });

      // PostMessage bridge from parent iframe
      window.addEventListener('message', (event) => {
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.type === 'eye-mouse') {
          this.camera.onMouseMove(event.data.x, event.data.y, performance.now() * 0.001);
        } else if (event.data.type === 'eye-key') {
          const key = (event.data.key || '').toLowerCase();
          if (key === ' ' || key === 'space') this.handleAction('blink');
          else if (key === 'b') this.handleAction('toggle-autoblink');
          else if (key === 'c') this.handleAction('palette');
          else if (key === 'r') this.handleAction('regen');
          else if (key === 'h') this.handleAction('help');
          else if (key === 'escape') this.handleAction('escape');
        }
      });

      document.getElementById('btn-blink')?.addEventListener('click', () => this.handleAction('blink'));
      document.getElementById('btn-palette')?.addEventListener('click', () => this.handleAction('palette'));
      document.getElementById('btn-autoblink')?.addEventListener('click', () => this.handleAction('toggle-autoblink'));
      document.getElementById('btn-regen')?.addEventListener('click', () => this.handleAction('regen'));
      document.getElementById('btn-help')?.addEventListener('click', () => this.handleAction('help'));
    }

    animate() {
      let prevTime = performance.now();

      const loop = (currentNow) => {
        const dt = Math.min(0.05, Math.max(0.001, (currentNow - prevTime) * 0.001));
        prevTime = currentNow;
        const nowSec = currentNow * 0.001;

        // FPS tracking
        this.fpsFrames++;
        if (currentNow - this.fpsLastTime >= 1000) {
          this.fps = Math.round((this.fpsFrames * 1000) / (currentNow - this.fpsLastTime));
          this.fpsFrames = 0;
          this.fpsLastTime = currentNow;
          if (this.hudFps) this.hudFps.textContent = `${this.fps} FPS`;
        }

        const openness = this.blinkCtrl.update(nowSec);
        const cam = this.camera.update(this.geom, nowSec, dt);

        this.renderComposition(openness, cam, nowSec);

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }

    renderComposition(openness, cam, nowSec) {
      if (!this.layers) return;

      const sw = window.innerWidth;
      const sh = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      if (this.canvas.width !== Math.round(sw * dpr) || this.canvas.height !== Math.round(sh * dpr)) {
        this.canvas.width = Math.round(sw * dpr);
        this.canvas.height = Math.round(sh * dpr);
      }

      const geom = this.geom;
      const L = this.layers;
      const vCtx = this.virtualCtx;
      const eCtx = this.eyeBoxCtx;
      const box = this.eyeBoxRect;

      const localCx = geom.centerX - box.left;
      const localCy = geom.centerY - box.top;

      // 1. Draw 100% Edge-to-Edge full field onto virtual canvas
      vCtx.clearRect(0, 0, geom.canvasW, geom.canvasH);
      vCtx.drawImage(L.fieldCanvas, 0, 0);

      // 2. Composite Eye Interior inside eyeBoxCanvas
      if (openness > 0.012) {
        eCtx.clearRect(0, 0, box.w, box.h);

        // Sclera with subtle 3D gaze parallax
        const scleraDx = Math.round(cam.gazeX * 0.25);
        const scleraDy = Math.round(cam.gazeY * 0.22);
        eCtx.drawImage(
          L.scleraCanvas,
          box.left - scleraDx, box.top - scleraDy, box.w, box.h,
          0, 0, box.w, box.h
        );

        const irisCx = localCx + Math.round(cam.gazeX);
        const irisCy = localCy + Math.round(cam.gazeY) - Math.round(geom.eyeHalfH * 0.04);
        const halfIris = L.irisDim / 2;

        // Cutout hole in sclera where iris sits
        eCtx.save();
        eCtx.globalCompositeOperation = 'destination-out';
        eCtx.beginPath();
        eCtx.arc(irisCx, irisCy, geom.irisRadius * 0.97, 0, Math.PI * 2);
        eCtx.fillStyle = 'rgba(0,0,0,1)';
        eCtx.fill();
        eCtx.restore();

        // Atmospheric Iris Glow
        eCtx.save();
        eCtx.globalCompositeOperation = 'lighter';
        eCtx.globalAlpha = 0.38 + 0.12 * Math.sin(nowSec * 1.2);
        eCtx.drawImage(L.glowCanvas, irisCx - halfIris, irisCy - halfIris);
        eCtx.restore();

        // Concentric iris rings (Phase A and Phase B breathing)
        const irisMix = 0.5 + 0.5 * Math.sin(nowSec * 0.60);
        eCtx.drawImage(L.ringsCanvasA, irisCx - halfIris, irisCy - halfIris);
        eCtx.save();
        eCtx.globalAlpha = irisMix;
        eCtx.drawImage(L.ringsCanvasB, irisCx - halfIris, irisCy - halfIris);
        eCtx.restore();

        // Radial iris spokes with subtle breathing
        const rScale = 1.0 + 0.025 * Math.sin(nowSec * 1.3);
        eCtx.save();
        eCtx.translate(irisCx, irisCy);
        eCtx.scale(rScale, rScale);
        eCtx.globalAlpha = 0.90;
        eCtx.drawImage(L.radialCanvasA, -halfIris, -halfIris);
        eCtx.globalAlpha = 0.90 * irisMix;
        eCtx.drawImage(L.radialCanvasB, -halfIris, -halfIris);
        eCtx.restore();

        // Deep circular Pupil with subtle dilation
        const pScale = 1.0 + 0.055 * Math.sin(nowSec * 0.92) + 0.035 * (1.0 - openness);
        const halfPupil = L.pupilDim / 2;
        eCtx.save();
        eCtx.translate(irisCx, irisCy);
        eCtx.scale(pScale, pScale);
        eCtx.drawImage(L.pupilCanvas, -halfPupil, -halfPupil);
        eCtx.restore();

        // Corneal Specular Highlights
        const hlX = localCx + Math.round(cam.gazeX * 1.16) - halfIris;
        const hlY = localCy + Math.round(cam.gazeY * 1.16) - Math.round(geom.eyeHalfH * 0.04) - halfIris;
        eCtx.drawImage(L.hlCanvas, hlX, hlY);

        // Instantaneous Eyelid Clipping Mask
        eCtx.save();
        eCtx.globalCompositeOperation = 'destination-in';
        eCtx.beginPath();
        const polySteps = 96;
        const lidGazeY = 0;

        for (let i = 0; i <= polySteps; i++) {
          const u = -1.01 + (2.02 * i) / polySteps;
          const x = localCx + u * geom.eyeHalfW;
          const cur = evalEyelidCurves(u, openness, geom);
          const y = localCy + cur.yUpper + lidGazeY;
          if (i === 0) eCtx.moveTo(x, y);
          else eCtx.lineTo(x, y);
        }
        for (let i = polySteps; i >= 0; i--) {
          const u = -1.01 + (2.02 * i) / polySteps;
          const x = localCx + u * geom.eyeHalfW;
          const cur = evalEyelidCurves(u, openness, geom);
          const y = localCy + cur.yLower + lidGazeY;
          eCtx.lineTo(x, y);
        }
        eCtx.closePath();
        eCtx.fillStyle = 'rgba(255,255,255,1)';
        eCtx.fill();
        eCtx.restore();

        // Blit eyeBox onto virtual canvas
        vCtx.drawImage(this.eyeBoxCanvas, box.left, box.top);
      }

      // 3. Eyelid Rim Words along the eyelid margin
      const lidGazeY = 0;
      for (const w of L.rimWords) {
        const cur = evalEyelidCurves(w.u, openness, geom);
        const baseY = w.isUpper ? cur.yUpper : cur.yLower;
        const wx = geom.centerX + w.u * geom.eyeHalfW;
        const wy = geom.centerY + baseY + lidGazeY + w.vOffset;

        const c0 = evalEyelidCurves(w.u - 0.02, openness, geom);
        const c1 = evalEyelidCurves(w.u + 0.02, openness, geom);
        const slope = w.isUpper ? (c1.yUpper - c0.yUpper) / (0.04 * geom.eyeHalfW) : (c1.yLower - c0.yLower) / (0.04 * geom.eyeHalfW);
        const angle = -(Math.atan(slope) * 180.0) / Math.PI;

        drawWord(vCtx, w.text, wx, wy, w.fsize, angle, w.color, true);
      }

      // 4. Fixed Wide Camera View (NO ZOOM IN/OUT CYCLE!)
      // Crop wide view rectangle and scale smoothly onto physical screen canvas
      const ctx = this.ctx;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        this.virtualCanvas,
        cam.left, cam.top, cam.viewW, cam.viewH,
        0, 0, sw, sh
      );
      ctx.restore();
    }
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new EyeWithinWordsWallpaper());
  } else {
    new EyeWithinWordsWallpaper();
  }
})();
