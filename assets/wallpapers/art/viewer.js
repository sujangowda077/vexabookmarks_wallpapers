(() => {
  'use strict';

  const img = document.getElementById('art-img');
  if (!img) return;

  function setArtImage(src) {
    if (!src) return;
    const filename = src.split('/').pop().split('#').pop();
    if (img.src && img.src.endsWith(filename) && img.classList.contains('loaded')) {
      return;
    }
    img.classList.remove('loaded');
    const temp = new Image();
    temp.onload = () => {
      img.src = filename;
      img.classList.add('loaded');
    };
    temp.onerror = () => {
      img.src = filename;
      img.classList.add('loaded');
    };
    temp.src = filename;
  }

  function loadFromHash() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!hash) return;
    try {
      hash = decodeURIComponent(hash);
    } catch (_) {}
    setArtImage(hash);
  }

  window.addEventListener('hashchange', loadFromHash);
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'set-image' && e.data.image) {
      setArtImage(e.data.image);
    }
  });

  loadFromHash();
})();
