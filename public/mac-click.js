(() => {
  if (window.__macClickFlashEnabled) return;
  window.__macClickFlashEnabled = true;

  const flashDuration = 400;
  const singleFlashDuration = 200;
  const flashClass = 'mac-click-flash';
  const singleFlashClass = 'mac-click-flash-single';

  const getClickable = (target) => {
    if (!target) return null;
    return target.closest(
      'button, input[type="button"], input[type="submit"], input[type="reset"], label, [role="button"], [role="menu-item"], .btn, .toolbarButton'
    );
  };

  const applyFlash = (el) => {
    const useSingle = el.classList.contains('close');
    const klass = useSingle ? singleFlashClass : flashClass;
    const duration = useSingle ? singleFlashDuration : flashDuration;

    el.classList.remove(flashClass);
    el.classList.remove(singleFlashClass);
    void el.offsetWidth;
    el.classList.add(klass);
    setTimeout(() => {
      el.classList.remove(klass);
    }, duration);
  };

  const resolveClickable = (target) => {
    let clickable = getClickable(target);
    if (!clickable) return null;
    if (clickable.hasAttribute('data-no-mac-flash')) return null;
    if (clickable.closest('[role="menu-bar"]') && clickable.hasAttribute('aria-haspopup')) return null;
    if (clickable.getAttribute('role') === 'menu-item') {
      const menuLink = clickable.querySelector('a');
      if (menuLink) clickable = menuLink;
    }
    if (clickable.dataset.macClickPending === 'true') return null;
    return clickable;
  };

  document.addEventListener('mousedown', (e) => {
    const clickable = resolveClickable(e.target);
    if (!clickable) return;
    applyFlash(clickable);
  }, true);

  document.addEventListener('click', (e) => {
    const clickable = resolveClickable(e.target);
    if (!clickable) return;

    if (clickable.tagName === 'BUTTON') {
      const inlineHandler = clickable.getAttribute('onclick');
      if (typeof clickable.onclick === 'function' || inlineHandler) {
        e.preventDefault();
        e.stopImmediatePropagation();
        clickable.dataset.macClickPending = 'true';
        setTimeout(() => {
          clickable.dataset.macClickPending = 'false';
          if (typeof clickable.onclick === 'function') {
            clickable.onclick.call(clickable, e);
          } else if (inlineHandler) {
            Function(inlineHandler).call(clickable);
          }
        }, flashDuration);
        return;
      }
    }

    const link = clickable.tagName === 'A' ? clickable : clickable.querySelector('a');
    if (!link) return;

    const href = link.getAttribute('href');
    const isBlank = link.getAttribute('target') === '_blank';
    const isDownload = link.hasAttribute('download');
    const isHash = href && href.startsWith('#');
    const isMailto = href && href.startsWith('mailto:');

    const inMenu = !!link.closest('[role="menu-bar"]');
    const shouldDelay = href && !isBlank && !isDownload && !isMailto && (inMenu || !isHash);

    if (shouldDelay) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setTimeout(() => {
        window.location.href = href;
      }, flashDuration);
    }
  }, true);
})();
