/* ═══════════════════════════════════════════════════════════
   HUB-APP.JS — Vexa Wallpaper Hub Application Engine
   Dynamic Remote Catalog & Offline Cache Architecture
   Complies 100% with Chrome MV3 CSP (no inline scripts)
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── 1. DYNAMIC CATALOG LOADER (OFFLINE CACHE + BACKGROUND CDN SYNC) ──
  const CATALOG_STORAGE_KEY = 'vexa_cached_wallpaper_catalog';
  const CATALOG_SYNC_TIME_KEY = 'vexa_catalog_last_sync';
  const CATALOG_REMOTE_URL_KEY = 'vexa_catalog_remote_url';
  const GITHUB_LIVE_CATALOG_URL = 'https://raw.githubusercontent.com/sujangowda077/vexabookmarks_wallpapers/main/wallpapers.json';
  const GITHUB_WALLPAPERS_BASE_URL = 'https://raw.githubusercontent.com/sujangowda077/vexabookmarks_wallpapers/main/';
  const LOCAL_CATALOG_FALLBACK_URL = 'wallpapers.json';

  // Fast-start: Load cached catalog from localStorage, or fall back to bundled window.VEXA_WALLPAPERS_CATALOG
  function getInitialCatalog() {
    try {
      const cached = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (parsed && Array.isArray(parsed.wallpapers) && parsed.wallpapers.length > 0) return parsed.wallpapers;
      }
    } catch (e) {
      console.warn('[VexaHub] Error reading cached catalog:', e);
    }
    return (window.VEXA_WALLPAPERS_CATALOG || []).slice();
  }

  let catalog = getInitialCatalog();
  let activeWallpaper = catalog[0] || null;
  let activeCategory = 'all';
  let searchQuery = '';
  let showMockUI = true;

  // Cross-Tab BroadcastChannel for Real-time Synchronization
  const SYNC_CHANNEL = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('vexa_wallpaper_sync') : null;

  // DOM Elements
  const stageTitle = document.getElementById('stage-title');
  const stageBadge = document.getElementById('stage-badge');
  const stageIframe = document.getElementById('stage-iframe');
  const stageCard = document.getElementById('stage-card');
  const mockOverlay = document.getElementById('mock-overlay');
  const galleryGrid = document.getElementById('gallery-grid');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  const chipMockUI = document.getElementById('chip-mock-ui');
  const chipFullscreen = document.getElementById('chip-fullscreen');
  const btnApplyActive = document.getElementById('btn-apply-active');
  const btnStageApply = document.getElementById('btn-stage-apply');
  const btnStageInstall = document.getElementById('btn-stage-install');
  const btnStageBookmark = document.getElementById('btn-stage-bookmark');
  const btnStageDetails = document.getElementById('btn-stage-details');
  const btnSyncCatalog = document.getElementById('btn-sync-catalog');
  const syncSpinner = document.getElementById('sync-spinner');
  const syncStatusText = document.getElementById('sync-status-text');

  // Details Modal Elements
  const detailsModal = document.getElementById('wallpaper-details-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalThumb = document.getElementById('modal-thumb');
  const modalThumbIcon = document.getElementById('modal-thumb-icon');
  const modalDesc = document.getElementById('modal-desc');
  const modalRes = document.getElementById('modal-res');
  const modalCat = document.getElementById('modal-cat');
  const modalType = document.getElementById('modal-type');
  const modalAuthor = document.getElementById('modal-author');
  const modalTags = document.getElementById('modal-tags');
  const modalBtnApply = document.getElementById('modal-btn-apply');
  const modalBtnInstall = document.getElementById('modal-btn-install');
  const modalBtnBookmark = document.getElementById('modal-btn-bookmark');

  let modalActiveWallpaper = null;

  // Live clock ticker
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('mock-clock');
    if (el) el.textContent = `${h}:${m}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  function isAsciiWallpaper(wp) {
    if (!wp) return false;
    return wp.type === 'ascii' || (wp.url && wp.url.includes('assets/wallpapers/ascii/index.html'));
  }

  function isArtWallpaper(wp) {
    if (!wp) return false;
    return wp.type === 'image' || (wp.url && wp.url.includes('assets/wallpapers/art/viewer.html'));
  }

  function getWallpaperPieceId(wp) {
    if (!wp) return '';
    if (wp.pieceId) return wp.pieceId;
    if (wp.url && wp.url.includes('#')) return wp.url.split('#')[1];
    return '';
  }

  function getSettingMode(wp) {
    if (!wp) return 'none';
    if (isAsciiWallpaper(wp)) {
      return 'ascii-' + getWallpaperPieceId(wp);
    }
    if (wp.type === 'image') {
      return 'art-' + getWallpaperPieceId(wp);
    }
    return wp.pieceId;
  }

  function getResolvedImageUrl(wp) {
    if (!wp || !wp.imagePath) return '';
    if (wp.imagePath.startsWith('http://') || wp.imagePath.startsWith('https://') || wp.imagePath.startsWith('data:')) {
      return wp.imagePath;
    }
    return `${GITHUB_WALLPAPERS_BASE_URL}${wp.imagePath}`;
  }

  // Stage renderer
  function renderStage() {
    if (!activeWallpaper) return;
    if (stageTitle) stageTitle.textContent = activeWallpaper.name;
    if (stageBadge) stageBadge.textContent = activeWallpaper.badge || activeWallpaper.category.toUpperCase();

    const isTargetAscii = isAsciiWallpaper(activeWallpaper);
    const isTargetArt = isArtWallpaper(activeWallpaper);
    const pieceId = getWallpaperPieceId(activeWallpaper);
    const targetUrl = activeWallpaper.url;

    if (stageIframe) {
      const currentSrc = stageIframe.src || '';
      const isCurrentAscii = currentSrc.includes('assets/wallpapers/ascii/index.html');
      const isCurrentArt = currentSrc.includes('assets/wallpapers/art/viewer.html');

      if (isTargetAscii && isCurrentAscii) {
        // FAST-PATH: ASCII player is already live on stage
        try {
          if (stageIframe.contentWindow) {
            if (typeof stageIframe.contentWindow.playAsciiPiece === 'function') {
              stageIframe.contentWindow.playAsciiPiece(pieceId);
            }
            stageIframe.contentWindow.postMessage({ type: 'set-piece', piece: pieceId }, '*');
            try { stageIframe.contentWindow.location.hash = pieceId; } catch (_) {}
          }
        } catch (e) {
          console.warn('[VexaHub] Frame message dispatch error:', e);
        }
        try { stageIframe.src = targetUrl; } catch (_) {}
      } else if (isTargetArt && isCurrentArt) {
        // FAST-PATH: Art Viewer is already live on stage
        const resolvedImg = getResolvedImageUrl(activeWallpaper);
        try {
          if (stageIframe.contentWindow) {
            stageIframe.contentWindow.postMessage({ type: 'set-image', image: resolvedImg || pieceId }, '*');
            try { stageIframe.contentWindow.location.hash = encodeURIComponent(resolvedImg || pieceId); } catch (_) {}
          }
        } catch (e) {
          console.warn('[VexaHub] Art viewer message dispatch error:', e);
        }
      } else {
        // Full switch between distinct HTML wallpaper pages
        const resolvedImg = isTargetArt ? getResolvedImageUrl(activeWallpaper) : '';
        const stageUrl = (isTargetArt && resolvedImg)
          ? `../assets/wallpapers/art/viewer.html#${encodeURIComponent(resolvedImg)}`
          : targetUrl;
        stageIframe.src = stageUrl;

        if (isTargetAscii && pieceId) {
          const onIframeLoaded = () => {
            stageIframe.removeEventListener('load', onIframeLoaded);
            try {
              if (stageIframe.contentWindow) {
                if (typeof stageIframe.contentWindow.playAsciiPiece === 'function') {
                  stageIframe.contentWindow.playAsciiPiece(pieceId);
                }
                stageIframe.contentWindow.postMessage({ type: 'set-piece', piece: pieceId }, '*');
              }
            } catch (_) {}
          };
          stageIframe.addEventListener('load', onIframeLoaded, { once: true });
        }

        if (isTargetArt && pieceId) {
          const onIframeLoaded = () => {
            stageIframe.removeEventListener('load', onIframeLoaded);
            try {
              if (stageIframe.contentWindow) {
                stageIframe.contentWindow.postMessage({ type: 'set-image', image: pieceId }, '*');
              }
            } catch (_) {}
          };
          stageIframe.addEventListener('load', onIframeLoaded, { once: true });
        }
      }
    }

    document.querySelectorAll('.gallery-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.id === activeWallpaper.id);
    });
  }

  // Update Category Counters Dynamically
  function updateCategoryCounts() {
    const counts = { all: catalog.length };
    catalog.forEach(w => {
      const k = w.catKey || 'other';
      counts[k] = (counts[k] || 0) + 1;
    });

    for (const [key, cnt] of Object.entries(counts)) {
      const el = document.getElementById(`cat-count-${key}`);
      if (el) el.textContent = cnt;
    }
    const allEl = document.getElementById('cat-count-all');
    if (allEl) allEl.textContent = catalog.length;
  }

  // Grid Builder
  function buildGrid() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const filtered = catalog.filter(w => {
      const matchCat = activeCategory === 'all' || w.catKey === activeCategory;
      const q = searchQuery;
      if (!q) return matchCat;

      const inName = (w.name || '').toLowerCase().includes(q);
      const inDesc = (w.desc || '').toLowerCase().includes(q);
      const inCat = (w.category || '').toLowerCase().includes(q);
      const inPiece = (w.pieceId || '').toLowerCase().includes(q);
      const inRes = (w.resolution || '').toLowerCase().includes(q);
      const inTags = Array.isArray(w.tags) && w.tags.some(t => String(t).toLowerCase().includes(q));

      return matchCat && (inName || inDesc || inCat || inPiece || inRes || inTags);
    });

    const countBadge = document.getElementById('gallery-count-badge');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${catalog.length} Wallpapers`;
    }
    const headerCount = document.getElementById('header-count');
    if (headerCount) {
      headerCount.textContent = `${catalog.length} Wallpapers`;
    }

    if (filtered.length === 0) {
      galleryGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--text-muted);">
          <h3 style="color:#fff; margin-bottom: 8px;">No wallpapers found matching "${searchQuery}"</h3>
          <p>Try searching for "goku", "eye", "ferrari", "space", "4K", or "cyberpunk"</p>
        </div>
      `;
      return;
    }

    filtered.forEach(wp => {
      const card = document.createElement('div');
      card.className = 'gallery-card' + (activeWallpaper && wp.id === activeWallpaper.id ? ' selected' : '');
      card.dataset.id = wp.id;

      const imgUrl = getResolvedImageUrl(wp);
      const thumbStyle = wp.type === 'image' && imgUrl
        ? `style="background: linear-gradient(180deg, rgba(2,4,8,0.08) 0%, rgba(2,4,8,0.75) 100%), url('${imgUrl}') center/cover no-repeat;"`
        : '';
      const thumbIcon = wp.type === 'image' ? '' : `<span>${wp.icon}</span>`;
      const resBadge = wp.resolution ? `<span class="card-res-badge">${wp.resolution.split(' ')[0]}</span>` : '';

      card.innerHTML = `
        <div class="card-thumb" ${thumbStyle}>
          <span class="card-badge">${wp.badge || 'HD'}</span>
          ${resBadge}
          ${thumbIcon}
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <span class="card-title">${wp.name}</span>
            <span class="card-icon">${wp.icon}</span>
          </div>
          <p class="card-desc">${wp.desc}</p>
          <div class="card-footer">
            <span class="card-cat">${wp.category}</span>
            <div class="card-actions-row">
              <button class="btn-card-act btn-card-apply" type="button" title="Apply to Vexa New Tab right now">
                <span>Apply</span>
                <svg fill="currentColor" viewBox="0 0 24 24" class="icon" aria-hidden="true">
                  <path clip-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" fill-rule="evenodd"></path>
                </svg>
              </button>
              <button class="btn-card-act btn-card-add" type="button" title="Add to Installed Shelf"><span>+ Shelf</span></button>
              <button class="btn-card-act btn-card-info" type="button" title="View details, tags and specs"><span>ℹ️</span></button>
              <button class="btn-card-act btn-card-bm" type="button" title="Bookmark into your VexaBookmarks dashboard"><span>🔖</span></button>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-apply')) {
          applyWallpaper(wp);
          return;
        }
        if (e.target.closest('.btn-card-add')) {
          installWallpaper(wp);
          return;
        }
        if (e.target.closest('.btn-card-info')) {
          openDetailsModal(wp);
          return;
        }
        if (e.target.closest('.btn-card-bm')) {
          bookmarkWallpaper(wp);
          return;
        }

        // Preview on stage
        activeWallpaper = wp;
        renderStage();
        if (stageCard) {
          const rect = stageCard.getBoundingClientRect();
          if (rect.bottom < 150) {
            window.scrollTo({ top: stageCard.offsetTop - 40, behavior: 'smooth' });
          }
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  const MAX_INSTALLED_WALLPAPERS = 6;

  // ── Installed Shelf Helpers & 6-Wallpaper Limit ─────────────
  function getInstalledList() {
    try {
      return JSON.parse(localStorage.getItem('vexa_installed_wallpapers') || '[]');
    } catch (_) {
      return [];
    }
  }

  function updateInstalledPill() {
    const list = getInstalledList();
    const count = list.length;
    const countEl = document.getElementById('installed-count-text');
    const pillEl = document.getElementById('installed-limit-pill');
    if (countEl) countEl.textContent = `${count}/${MAX_INSTALLED_WALLPAPERS}`;
    if (pillEl) {
      if (count >= MAX_INSTALLED_WALLPAPERS) {
        pillEl.style.background = 'rgba(239, 68, 68, 0.2)';
        pillEl.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        pillEl.style.color = '#fca5a5';
        pillEl.title = `Wallpaper collection is full (${count}/${MAX_INSTALLED_WALLPAPERS}). Remove a wallpaper in Settings to add new ones.`;
      } else {
        pillEl.style.background = 'rgba(212, 175, 55, 0.15)';
        pillEl.style.borderColor = 'rgba(212, 175, 55, 0.35)';
        pillEl.style.color = '#E5C158';
        pillEl.title = `${count} of ${MAX_INSTALLED_WALLPAPERS} wallpaper slots used`;
      }
    }
  }

  // ── Apply Wallpaper Immediately ──────────────────────────────
  function applyWallpaper(wp) {
    if (!wp) return;
    const settingMode = getSettingMode(wp);
    const pieceId = getWallpaperPieceId(wp);

    // 1. Ensure it's in the installed shelf (enforcing 6-wallpaper limit)
    const saveRes = saveToInstalledList(wp);
    if (!saveRes || !saveRes.success) {
      return; // Blocked by limit; warning toast already displayed
    }

    // 2. Set active in localStorage
    try {
      if (isAsciiWallpaper(wp)) {
        localStorage.setItem('vexa_active_ascii_piece', pieceId);
      }
      localStorage.setItem('vexa_active_installed_wp', JSON.stringify({
        id: settingMode,
        pieceId: pieceId,
        name: wp.name,
        icon: wp.icon,
        type: wp.type,
        imagePath: wp.imagePath || '',
        timestamp: Date.now()
      }));
    } catch (_) {}

    // 3. Broadcast to all open new tab windows
    if (SYNC_CHANNEL) {
      try {
        SYNC_CHANNEL.postMessage({
          type: 'APPLY_WALLPAPER',
          mode: settingMode,
          wallpaper: wp
        });
      } catch (_) {}
    }

    // 4. Chrome Extension storage / runtime message
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get(['vexa_settings'], (res) => {
          const s = res.vexa_settings || {};
          if (wp.type === 'image') {
            s.background = settingMode;
            s.customBgUrl = getResolvedImageUrl(wp);
            s.customBgManual = false;
          } else {
            s.background = settingMode;
          }
          chrome.storage.local.set({ vexa_settings: s });
        });
      } catch (_) {}
    }

    showToast(`✨ "${wp.name}" applied as your active Vexa new tab wallpaper!`);
  }

  // ── Save to Installed Shelf (Max 6) ──────────────────────────
  function saveToInstalledList(wp) {
    const settingMode = getSettingMode(wp);
    const pieceId = getWallpaperPieceId(wp);
    try {
      const list = getInstalledList();
      const existing = list.find(i => i.id === settingMode);
      if (existing) {
        if (wp.imagePath && !existing.imagePath) {
          existing.imagePath = wp.imagePath;
          localStorage.setItem('vexa_installed_wallpapers', JSON.stringify(list));
        }
        updateInstalledPill();
        return { success: true, count: list.length, isNew: false };
      }

      // Check 6-wallpaper limit
      if (list.length >= MAX_INSTALLED_WALLPAPERS) {
        showToast(`⚠️ Limit reached (${list.length}/${MAX_INSTALLED_WALLPAPERS} wallpapers). Please remove an existing wallpaper from your collection in Settings to add more.`, 5000);
        return { success: false, limitReached: true, count: list.length };
      }

      list.unshift({
        id: settingMode,
        pieceId: pieceId,
        type: wp.type,
        name: wp.name,
        icon: wp.icon,
        category: wp.category,
        imagePath: wp.imagePath || ''
      });
      localStorage.setItem('vexa_installed_wallpapers', JSON.stringify(list));
      updateInstalledPill();
      return { success: true, count: list.length, isNew: true };
    } catch (_) {
      return { success: false };
    }
  }

  function installWallpaper(wp) {
    if (!wp) return;
    const res = saveToInstalledList(wp);
    if (!res || !res.success) {
      return; // Blocked by limit; warning toast already displayed
    }

    if (SYNC_CHANNEL) {
      try {
        SYNC_CHANNEL.postMessage({
          type: 'INSTALL_WALLPAPER',
          wallpaper: wp
        });
      } catch (_) {}
    }

    if (res.isNew) {
      showToast(`📦 "${wp.name}" added to your collection (${res.count}/${MAX_INSTALLED_WALLPAPERS})!`);
    } else {
      showToast(`ℹ️ "${wp.name}" is already in your collection (${res.count}/${MAX_INSTALLED_WALLPAPERS}).`);
    }
  }

  // ── Bookmark into VexaBookmarks Dashboard ────────────────────
  function bookmarkWallpaper(wp) {
    if (!wp) return;
    saveToInstalledList(wp);

    const settingMode = getSettingMode(wp);
    const bmUrl = 'vexa-wallpaper:' + settingMode;
    const bmTitle = `${wp.icon || '🖼️'} ${wp.name}`;

    if (SYNC_CHANNEL) {
      try {
        SYNC_CHANNEL.postMessage({
          type: 'ADD_BOOKMARK',
          bookmark: {
            title: bmTitle,
            url: bmUrl,
            folder: 'Wallpapers',
            tags: ['wallpaper', wp.category.toLowerCase()]
          }
        });
      } catch (_) {}
    }

    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.create) {
      try {
        chrome.bookmarks.create({
          title: bmTitle,
          url: bmUrl
        });
      } catch (_) {}
    }

    showToast(`🔖 "${wp.name}" bookmarked directly into your VexaBookmarks!`);
  }

  // ── Wallpaper Details Modal ─────────────────────────────────
  function openDetailsModal(wp) {
    if (!wp || !detailsModal) return;
    modalActiveWallpaper = wp;

    if (modalTitle) modalTitle.innerHTML = `<span>${wp.icon || '🖼️'}</span> ${wp.name}`;
    if (modalDesc) modalDesc.textContent = wp.desc || 'No detailed description available.';
    if (modalRes) modalRes.textContent = wp.resolution || (wp.type === 'image' ? '3840 × 2160 (4K UHD)' : 'Dynamic Vector Canvas');
    if (modalCat) modalCat.textContent = wp.category || 'General';
    if (modalType) {
      const typeLabels = {
        'image': 'Ultra-HD High-Fidelity Still',
        'live-iframe': 'Real-time Interactive 3D / Shader',
        'ascii': 'Live Animated ASCII Matrix',
        'video': 'Cinematic Video Loop'
      };
      modalType.textContent = typeLabels[wp.type] || wp.type;
    }
    if (modalAuthor) modalAuthor.textContent = wp.author || 'Vexa Curated Collection';

    // Tags
    if (modalTags) {
      modalTags.innerHTML = '';
      const tags = Array.isArray(wp.tags) ? wp.tags : [wp.catKey || 'wallpaper'];
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'detail-tag';
        span.textContent = `#${t}`;
        modalTags.appendChild(span);
      });
    }

    // Hero Preview Thumb
    if (modalThumb) {
      const imgUrl = getResolvedImageUrl(wp);
      if (wp.type === 'image' && imgUrl) {
        modalThumb.style.backgroundImage = `url('${imgUrl}')`;
        if (modalThumbIcon) modalThumbIcon.style.display = 'none';
      } else {
        modalThumb.style.backgroundImage = 'none';
        modalThumb.style.backgroundColor = '#04060c';
        if (modalThumbIcon) {
          modalThumbIcon.style.display = 'block';
          modalThumbIcon.textContent = wp.icon || '🌀';
        }
      }
    }

    detailsModal.classList.add('open');
  }

  function closeDetailsModal() {
    if (detailsModal) detailsModal.classList.remove('open');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailsModal);
  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) closeDetailsModal();
    });
  }

  if (modalBtnApply) modalBtnApply.addEventListener('click', () => {
    if (modalActiveWallpaper) applyWallpaper(modalActiveWallpaper);
  });
  if (modalBtnInstall) modalBtnInstall.addEventListener('click', () => {
    if (modalActiveWallpaper) installWallpaper(modalActiveWallpaper);
  });
  if (modalBtnBookmark) modalBtnBookmark.addEventListener('click', () => {
    if (modalActiveWallpaper) bookmarkWallpaper(modalActiveWallpaper);
  });

  // Stage Details Button
  if (btnStageDetails) {
    btnStageDetails.addEventListener('click', () => {
      if (activeWallpaper) openDetailsModal(activeWallpaper);
    });
  }

  // ── Background Dynamic Catalog Fetch & Sync ──────────────────
  async function syncCatalog(manual = false) {
    if (syncSpinner) syncSpinner.style.transform = 'rotate(360deg)';
    if (syncStatusText && manual) syncStatusText.textContent = 'Syncing...';

    let targetUrl = localStorage.getItem(CATALOG_REMOTE_URL_KEY);
    if (!targetUrl || targetUrl.includes('/sujangowda077/vexabookmarks/')) {
      targetUrl = GITHUB_LIVE_CATALOG_URL;
      try { localStorage.setItem(CATALOG_REMOTE_URL_KEY, targetUrl); } catch (_) {}
    }

    try {
      let response = null;
      try {
        response = await fetch(targetUrl, { cache: 'no-cache' });
      } catch (networkErr) {
        // If GitHub fetch fails (e.g. offline), try local catalog fallback
        console.warn('[VexaHub] Remote GitHub fetch failed, attempting local fallback:', networkErr.message);
        response = await fetch(LOCAL_CATALOG_FALLBACK_URL, { cache: 'no-cache' });
      }

      if (!response || !response.ok) {
        throw new Error(`HTTP ${response ? response.status : 'ERR'} ${response ? response.statusText : 'Offline'}`);
      }
      const data = await response.json();
      const newItems = Array.isArray(data) ? data : (data.wallpapers || []);

      if (Array.isArray(newItems) && newItems.length > 0) {
        const prevCount = catalog.length;
        catalog = newItems;
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
        localStorage.setItem(CATALOG_SYNC_TIME_KEY, String(Date.now()));

        updateCategoryCounts();
        buildGrid();
        renderStage();

        const indicator = document.getElementById('catalog-sync-indicator');
        if (indicator) {
          indicator.style.color = '#10B981';
          indicator.textContent = `● Synced from GitHub (${catalog.length} Live)`;
        }
        const topBadge = document.getElementById('catalog-sync-badge');
        if (topBadge) {
          topBadge.textContent = `Synced from GitHub (${catalog.length} Live)`;
        }

        if (manual) {
          showToast(`✓ Catalog successfully synced from GitHub! ${catalog.length} wallpapers loaded (${catalog.length - prevCount >= 0 ? '+' : ''}${catalog.length - prevCount} new).`);
        }
      }
    } catch (err) {
      console.warn('[VexaHub] Remote catalog fetch notice (using offline cache):', err.message);
      if (manual) {
        showToast(`ℹ️ Offline mode: Using cached catalog (${catalog.length} wallpapers ready).`);
      }
    } finally {
      setTimeout(() => {
        if (syncSpinner) syncSpinner.style.transform = 'none';
        if (syncStatusText) syncStatusText.textContent = 'Sync Catalog';
      }, 600);
    }
  }

  if (btnSyncCatalog) {
    btnSyncCatalog.addEventListener('click', () => syncCatalog(true));
  }

  let toastTimer = null;
  function showToast(msg, duration = 3500) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // Stage Controls
  if (chipMockUI && mockOverlay) {
    chipMockUI.addEventListener('click', () => {
      showMockUI = !showMockUI;
      chipMockUI.classList.toggle('active', showMockUI);
      mockOverlay.classList.toggle('active', showMockUI);
    });
  }

  if (chipFullscreen && stageCard) {
    chipFullscreen.addEventListener('click', () => {
      stageCard.classList.toggle('fullscreen');
      const isFull = stageCard.classList.contains('fullscreen');
      chipFullscreen.classList.toggle('active', isFull);
      const span = chipFullscreen.querySelector('span');
      if (span) span.textContent = isFull ? '✕ Exit Fullscreen' : '⛶ Fullscreen';
    });
  }

  if (btnApplyActive) btnApplyActive.addEventListener('click', () => applyWallpaper(activeWallpaper));
  if (btnStageApply) btnStageApply.addEventListener('click', () => applyWallpaper(activeWallpaper));
  if (btnStageInstall) btnStageInstall.addEventListener('click', () => installWallpaper(activeWallpaper));
  if (btnStageBookmark) btnStageBookmark.addEventListener('click', () => bookmarkWallpaper(activeWallpaper));

  // Category pills
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      buildGrid();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      buildGrid();
    });
  }

  // Cross-tab storage synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'vexa_installed_wallpapers') {
      updateInstalledPill();
    }
  });

  if (SYNC_CHANNEL) {
    try {
      SYNC_CHANNEL.onmessage = (event) => {
        const data = event.data;
        if (data && (data.type === 'WALLPAPER_REMOVED' || data.type === 'INSTALL_WALLPAPER' || data.type === 'APPLY_WALLPAPER')) {
          updateInstalledPill();
        }
      };
    } catch (_) {}
  }

  // Initialize immediately
  updateCategoryCounts();
  renderStage();
  buildGrid();
  updateInstalledPill();

  // Trigger silent background sync
  syncCatalog(false);

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      updateCategoryCounts();
      renderStage();
      buildGrid();
      updateInstalledPill();
    });
  }
})();
