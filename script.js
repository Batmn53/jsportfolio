/**
 * Mohammed Rangoonwala - Developer Portfolio
 * Vanilla JavaScript interactions:
 * - Accessible mobile navigation toggle
 * - Smooth anchor scrolling with header offset and reduced-motion support
 * - Auto-close mobile menu on link click or outside click
 * - Dynamic copyright year in footer
 * - Active navigation link highlighting via IntersectionObserver
 * - Profile image graceful error handling
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 0. Lenis Smooth Momentum Scrolling Integration
  // -------------------------------------------------------------------------
  let lenisInstance = null;

  const initLenis = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return null;
    }

    if (typeof Lenis !== 'undefined') {
      try {
        lenisInstance = new Lenis({
          duration: 1.35, // Heavier, more substantial deceleration
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7.5 * t)), // Weighted drag curve
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.78, // Solid, weighted wheel response
          touchMultiplier: 1.2,
          infinite: false,
        });

        const raf = (time) => {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        window.lenis = lenisInstance;
        return lenisInstance;
      } catch (err) {
        console.warn('Lenis could not be initialized:', err);
      }
    }
    return null;
  };

  // -------------------------------------------------------------------------
  // 1. Dynamic Footer Year
  // -------------------------------------------------------------------------
  const initFooterYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  // -------------------------------------------------------------------------
  // 2. Mobile Navigation Toggle & Accessibility
  // -------------------------------------------------------------------------
  const initMobileNav = () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('primary-nav');

    if (!navToggle || !navMenu) return;

    const toggleMenu = (open) => {
      const shouldOpen = typeof open === 'boolean' 
        ? open 
        : navToggle.getAttribute('aria-expanded') !== 'true';

      navToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      navMenu.classList.toggle('is-open', shouldOpen);
    };

    navToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    // Close menu when a navigation link is clicked
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navToggle.getAttribute('aria-expanded') === 'true') {
          toggleMenu(false);
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        toggleMenu(false);
      }
    });

    // Close menu with Escape key for keyboard accessibility
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  };

  // -------------------------------------------------------------------------
  // 3. Smooth Scrolling with Lenis & Header Offset Fallback
  // -------------------------------------------------------------------------
  const initSmoothScroll = () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    internalLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        event.preventDefault();

        // Calculate target scroll position
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        let targetPosition = 0;

        if (targetId === '#top' || targetElement === header) {
          targetPosition = 0;
        } else {
          targetPosition = Math.max(
            0,
            targetElement.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - headerHeight
          );
        }

        // If Lenis is available, use its momentum-driven smooth scroll
        if (lenisInstance && !prefersReducedMotion.matches) {
          if (targetId === '#top' || targetElement === header) {
            lenisInstance.scrollTo(0, { duration: 1.35 });
          } else {
            lenisInstance.scrollTo(targetElement, {
              offset: -headerHeight,
              duration: 1.35,
            });
          }
        } else {
          // Native smooth scroll fallback
          const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
          window.scrollTo({
            top: targetPosition,
            behavior: behavior
          });
        }

        // Set focus to the target element for screen readers and keyboard users
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        targetElement.focus({ preventScroll: true });

        // Update active nav highlights if scrolled to the top
        if (targetPosition === 0) {
          document.querySelectorAll('.nav-link').forEach((navLink) => {
            navLink.classList.remove('active');
          });
        }

        // Update URL hash without abrupt jumping
        if (history.pushState) {
          history.pushState(null, '', targetId);
        } else {
          location.hash = targetId;
        }
      });
    });
  };

  // -------------------------------------------------------------------------
  // 4. Active Navigation Link Highlighting via IntersectionObserver
  // -------------------------------------------------------------------------
  const initActiveNavHighlight = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));
  };

  // -------------------------------------------------------------------------
  // 5. Profile Picture Graceful Fallback
  // -------------------------------------------------------------------------
  const initProfileImageFallback = () => {
    const profileImg = document.getElementById('profile-image');
    if (!profileImg) return;

    // Check if the image fails to load
    profileImg.addEventListener('error', () => {
      profileImg.classList.add('error');
    });

    // Handle cached broken image edge case
    if (profileImg.complete && profileImg.naturalWidth === 0) {
      profileImg.classList.add('error');
    }
  };

  // -------------------------------------------------------------------------
  // 6. Project Placeholder Links Handling
  // -------------------------------------------------------------------------
  const initPlaceholderLinks = () => {
    // Prevent unconfigured '#' links from jumping to page top
    const placeholderLinks = document.querySelectorAll('a.placeholder-link[href="#"]');
    placeholderLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
      });
    });
  };

  // -------------------------------------------------------------------------
  // 7. Certificate Lightbox Modal
  // -------------------------------------------------------------------------
  const initCertificateModal = () => {
    const modal = document.getElementById('cert-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-cert-img');
    const modalTitle = document.getElementById('modal-cert-title');
    const modalLink = document.getElementById('modal-cert-link');

    if (!modal || !modalImg) return;

    let previousActiveElement = null;

    const openModal = (src, title) => {
      previousActiveElement = document.activeElement;
      modalImg.src = src;
      modalImg.alt = title || 'Certificate image';
      if (modalTitle) modalTitle.textContent = title || 'Certificate Preview';
      if (modalLink) modalLink.href = src;

      modal.removeAttribute('hidden');
      document.body.classList.add('modal-open');

      if (lenisInstance) {
        lenisInstance.stop();
      }

      if (modalClose) {
        modalClose.focus();
      }
    };

    const closeModal = () => {
      modal.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
      modalImg.removeAttribute('src');

      if (lenisInstance) {
        lenisInstance.start();
      }

      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };

    // Attach click listeners to all certificate preview buttons/overlays
    const triggers = document.querySelectorAll('[data-cert-src]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const src = trigger.getAttribute('data-cert-src');
        const title = trigger.getAttribute('data-cert-title') || '';
        if (src) {
          openModal(src, title);
        }
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
      }
    });
  };

  // -------------------------------------------------------------------------
  // 8. Automatic File Download Handler (Forces download instead of PDF viewer)
  // -------------------------------------------------------------------------
  const initAutoDownloads = () => {
    const triggerBlobDownload = (blob, filename) => {
      // Force application/octet-stream MIME type to prevent browser internal PDF viewer interception
      const octetBlob = new Blob([blob], { type: 'application/octet-stream' });
      const blobUrl = window.URL.createObjectURL(octetBlob);
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        downloadLink.remove();
      }, 1500);
    };

    const downloadFileDirectly = (url, filename, button) => {
      if (button) {
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
      }

      // XMLHttpRequest with responseType = 'blob' works reliably across both file:// and http(s)://
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = () => {
        if (button) {
          button.style.pointerEvents = '';
          button.style.opacity = '';
        }

        if (xhr.status === 200 || (xhr.status === 0 && xhr.response && xhr.response.size > 0)) {
          triggerBlobDownload(xhr.response, filename);
        } else {
          fallbackDirectDownload(url, filename);
        }
      };

      xhr.onerror = () => {
        if (button) {
          button.style.pointerEvents = '';
          button.style.opacity = '';
        }
        fallbackDirectDownload(url, filename);
      };

      xhr.send();
    };

    const fallbackDirectDownload = (url, filename) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 500);
    };

    // Attach to all elements with download attribute or .js-download-btn
    const downloadElements = document.querySelectorAll('a[download], .js-download-btn');
    downloadElements.forEach((el) => {
      el.addEventListener('click', (event) => {
        event.preventDefault();
        const url = el.getAttribute('href');
        const filename = el.getAttribute('download') || el.dataset.filename || 'document.pdf';
        if (url) {
          downloadFileDirectly(url, filename, el);
        }
      });
    });
  };

  // Initialize all interactive modules
  initLenis();
  initFooterYear();
  initMobileNav();
  initSmoothScroll();
  initActiveNavHighlight();
  initProfileImageFallback();
  initPlaceholderLinks();
  initCertificateModal();
  initAutoDownloads();
});
