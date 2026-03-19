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
 * Source: https://github.com/rockenman1234/rockenman1234.github.io/blob/main/src/main.js
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 */

// Import system.css
import '@sakun/system.css';

// Import custom styles
import './style.css';

// ==============================
// Menu Bar Clock
// ==============================
function updateClock() {
  const clock = document.getElementById('menuClock');
  if (!clock) return;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  // Render meridiem in a dedicated span so we can control its glyph rendering.
  clock.innerHTML = `${displayHours}:${minutes} <span class="menu-meridiem">${ampm}</span>`;
}

updateClock();
setInterval(updateClock, 30000);

// ==============================
// Window Close Buttons
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  // Close buttons on windows
  document.querySelectorAll('.window .close').forEach(btn => {
    btn.addEventListener('click', () => {
      const win = btn.closest('.window');
      const section = win ? win.closest('section') : null;
      if (win) {
        win.classList.add('window-closing');
        setTimeout(() => {
          win.classList.add('window-closed');
          if (section) section.classList.add('section-closed');
          win.classList.remove('window-closing');
          checkAllWindowsClosed();
        }, 300);
      }
    });
  });

  // Clicking menu items that link to a closed window should re-open it
  document.querySelectorAll('[role="menu-bar"] a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      const section = document.getElementById(targetId);
      if (section) {
        const win = section.querySelector('.window, .welcome-window');
        if (win && win.classList.contains('window-closed')) {
          win.classList.remove('window-closed');
          section.classList.remove('section-closed');
          checkAllWindowsClosed();
        }
      }
    });
  });

  function checkAllWindowsClosed() {
    const allWindows = document.querySelectorAll('.window, .welcome-window');
    const closedWindows = document.querySelectorAll('.window-closed');
    if (allWindows.length === closedWindows.length && allWindows.length > 0) {
      document.body.classList.add('all-closed');
      document.querySelector('.desktop').scrollTo({ top: 0, behavior: 'instant' });
    } else {
      document.body.classList.remove('all-closed');
    }
  }

  // Initial check
  checkAllWindowsClosed();
});

// ==============================
// Back to Top Button
// ==============================
const backToTopBtn = document.getElementById('backToTop');
const desktopEl = document.querySelector('.desktop');

if (backToTopBtn && desktopEl) {
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    desktopEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Fallback
  });

  const handleScroll = () => {
    // Check both standard body and desktop element scroll positions
    const scrollPos = Math.max(desktopEl.scrollTop, window.scrollY || document.documentElement.scrollTop);
    if (scrollPos > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  desktopEl.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
}

// ==============================
// Keyboard Accessibility
// ==============================
const handleFirstTab = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
};

window.addEventListener('keydown', handleFirstTab);

// ==============================
// Konami Code Easter Egg
// ==============================
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

// ==============================
// Deferred Analytics
// ==============================
setTimeout(() => {
  const script = document.createElement('script');
  script.src = 'https://scripts.simpleanalyticscdn.com/latest.js';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}, 2000);

// ==============================
// Service Worker (Optional)
// ==============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    }, 2000);
  });
}

