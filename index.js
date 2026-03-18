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
 * Source: https://github.com/rockenman1234/rockenman1234.github.io/blob/main/index.js
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 */

/* -----------------------------------------
  These are the scripts for the main page
  They are designed to help users who are 
  only using keyboards 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

const desktopElScroll = document.querySelector('.desktop');
if (desktopElScroll) {
  desktopElScroll.addEventListener("scroll", () => {
    if (desktopElScroll.scrollTop > 700) {
      isBackToTopRendered = true;
      alterStyles(isBackToTopRendered);
    } else {
      isBackToTopRendered = false;
      alterStyles(isBackToTopRendered);
    }
  });
}


// Super secret code 
var pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var current = 0;

var keyHandler = function (event) {
	if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
		current = 0;
		return;
	}

	current++;

	if (pattern.length === current) {
		current = 0;
    window.open('https://youtube.com/watch?v=vLNRdtLI1lc', '_blank')
	}

};

document.addEventListener('keydown', keyHandler, false);

// Service Worker Registration and Cache Management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', function() {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, but old content is still being served
              console.log('New content is available; please refresh.');
            }
          });
        });
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Cache management for large assets and animations
function initPerformanceAndAnimations() {
  const largeAssets = [
    './images/code.gif',
    './images/KalibungaDemo.gif'
  ];
  
  const largeFetchAssets = [
    'https://raw.githubusercontent.com/rockenman1234/resume/00be68a23cc2f913489cc5dab064aca5af28caab/Resume.pdf',
    'https://raw.githubusercontent.com/rockenman1234/resume/00be68a23cc2f913489cc5dab064aca5af28caab/Resume__Brief.pdf'
  ];

  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up').forEach(element => {
    observer.observe(element);
  });
  
  // Preload large assets when user shows intent to interact
  let userInteracted = false;
  
  function onUserInteraction() {
    if (!userInteracted) {
      userInteracted = true;
      
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          largeAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = asset;
            document.head.appendChild(link);
          });
          largeFetchAssets.forEach(asset => {
            fetch(asset, { mode: 'cors' }).catch(() => {});
          });
        });
      } else {
        setTimeout(() => {
          largeAssets.forEach(asset => {
            const img = new Image();
            img.src = asset;
          });
          largeFetchAssets.forEach(asset => {
            fetch(asset, { mode: 'cors' }).catch(() => {});
          });
        }, 100);
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('mouseenter', onUserInteraction);
      document.removeEventListener('touchstart', onUserInteraction);
      document.removeEventListener('scroll', onUserInteraction);
    }
  }
  
  // Listen for user interaction signals
  document.addEventListener('mouseenter', onUserInteraction, { passive: true });
  document.addEventListener('touchstart', onUserInteraction, { passive: true });
  document.addEventListener('scroll', onUserInteraction, { passive: true });
}

// Initialize performance improvements
document.addEventListener('DOMContentLoaded', initPerformanceAndAnimations);
