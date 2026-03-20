// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0
/*! 
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this file.
 *
 * Copyright (C) 2025  Alex Jenkins
 *
 * The JavaScript code in this file is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, version 3 of the License.  The code is distributed
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU GPL
 * for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
* Source: https://github.com/rockenman1234/rockenman1234.github.io/blob/main/public/utils.js
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 */

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

  const handleInteraction = (e) => {
    if (e.type === 'mousedown' && window.__macTouchOccurred) {
      return; // Prevent duplicate flash from simulated mousedown
    }
    if (e.type === 'touchstart') {
      window.__macTouchOccurred = true;
      setTimeout(() => { window.__macTouchOccurred = false; }, 500);
    }
    const clickable = resolveClickable(e.target);
    if (!clickable) return;
    applyFlash(clickable);
  };

  document.addEventListener('mousedown', handleInteraction, true);
  document.addEventListener('touchstart', handleInteraction, { capture: true, passive: true });

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
    const shouldDelay = href && (inMenu || !isHash);

    if (shouldDelay) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clickable.dataset.macClickPending = 'true';
      setTimeout(() => {
        if (isHash) {
          link.click();
          clickable.dataset.macClickPending = 'false';
        } else {
          clickable.dataset.macClickPending = 'false';
          if (isBlank) {
            window.open(href, '_blank');
          } else if (isDownload) {
            const tempLink = document.createElement('a');
            tempLink.href = href;
            tempLink.download = link.getAttribute('download') || '';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
          } else {
            window.location.href = href;
          }
        }
      }, flashDuration);
    }
  }, true);
})();
// @license-end
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0
/*!
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this file.
 *
 * Copyright (C) 2025  Alex Jenkins
 *
 * The JavaScript code in this file is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, version 3 of the License.  The code is distributed
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU GPL
 * for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
* Source: https://github.com/rockenman1234/rockenman1234.github.io/blob/main/public/utils.js
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 */

function updateClock() {
  const clock = document.getElementById('menuClock');
  if (!clock) return;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  clock.innerHTML = `${displayHours}:${minutes} <span class="menu-meridiem">${ampm}</span>`;
}

updateClock();
setInterval(updateClock, 30000);

(() => {
  if (window.__konamiCodeEnabled) return;
  window.__konamiCodeEnabled = true;

  const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let current = 0;

  document.addEventListener('keydown', (event) => {
    if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
      current = 0;
      return;
    }

    current++;

    if (pattern.length === current) {
      current = 0;
      window.open('https://youtube.com/watch?v=vLNRdtLI1lc', '_blank');
    }
  }, false);
})();
// @license-end
