/**
 * Mohammed Rangoonwala - Distributed Systems & Backend Portfolio
 * Vanilla JavaScript interactions:
 * - Dynamic scroll progress indicator
 * - Dynamic scroll reveal animations via IntersectionObserver
 * - Interactive 3D card tilt & hover dynamics
 * - Lenis smooth momentum scrolling with parallax response
 * - Accessible mobile navigation toggle with blocky styling
 * - Active navigation link highlighting via IntersectionObserver
 * - Lightbox modal for verified certifications
 * - Direct PDF download handling for resumes and certificates
 * - Dynamic footer copyright year
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------------------
  // 0. Lenis Smooth Momentum Scrolling Integration
  // -------------------------------------------------------------------------
  let lenisInstance = null;

  const initLenis = () => {
    if (prefersReducedMotion) {
      return null;
    }

    if (typeof Lenis !== 'undefined') {
      try {
        lenisInstance = new Lenis({
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7.5 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.85,
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
  // 1. Dynamic Scroll Progress Bar & Header State
  // -------------------------------------------------------------------------
  const initScrollProgress = () => {
    const progressBar = document.getElementById('scroll-progress-bar');
    const header = document.querySelector('.site-header');

    const updateScrollMetrics = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }

      if (header) {
        if (scrollTop > 40) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      }
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });

    if (lenisInstance) {
      lenisInstance.on('scroll', updateScrollMetrics);
    }

    updateScrollMetrics();
  };

  // -------------------------------------------------------------------------
  // 2. Dynamic Scroll Reveal Animations (IntersectionObserver)
  // -------------------------------------------------------------------------
  const initScrollReveals = () => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1,
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  };

  // -------------------------------------------------------------------------
  // 3. Interactive 3D Card Hover & Tilt Physics
  // -------------------------------------------------------------------------
  const initCard3DTilt = () => {
    if (prefersReducedMotion || window.innerWidth < 768) {
      return;
    }

    const interactiveCards = document.querySelectorAll('.project-card, .cert-card, .internship-card');

    interactiveCards.forEach((card) => {
      let bounds = null;

      const handleMouseEnter = () => {
        bounds = card.getBoundingClientRect();
      };

      const handleMouseMove = (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = (mouseX / bounds.width - 0.5) * 2; // -1 to +1
        const yPct = (mouseY / bounds.height - 0.5) * 2; // -1 to +1

        const maxTilt = 5; // degrees of tilt
        const rotateX = -yPct * maxTilt;
        const rotateY = xPct * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      };

      const handleMouseLeave = () => {
        card.style.transform = '';
        bounds = null;
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  };

  // -------------------------------------------------------------------------
  // 4. Parallax Response on Floating Ambient Geometries
  // -------------------------------------------------------------------------
  const initParallaxElements = () => {
    if (prefersReducedMotion || window.innerWidth < 768) {
      return;
    }

    const parallaxNodes = document.querySelectorAll('[data-parallax]');
    if (parallaxNodes.length === 0) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || 0;
          parallaxNodes.forEach((node) => {
            const factor = parseFloat(node.getAttribute('data-parallax')) || 0.05;
            const translateY = scrollY * factor;
            node.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (lenisInstance) {
      lenisInstance.on('scroll', onScroll);
    }
  };

  // -------------------------------------------------------------------------
  // 5. Dynamic Footer Year
  // -------------------------------------------------------------------------
  const initFooterYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  // -------------------------------------------------------------------------
  // 6. Mobile Navigation Toggle & Accessibility
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

    // Close menu with Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  };

  // -------------------------------------------------------------------------
  // 7. Smooth Scrolling with Lenis & Header Offset Fallback
  // -------------------------------------------------------------------------
  const initSmoothScroll = () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        event.preventDefault();

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

        if (lenisInstance && !prefersReducedMotion) {
          if (targetId === '#top' || targetElement === header) {
            lenisInstance.scrollTo(0, { duration: 1.25 });
          } else {
            lenisInstance.scrollTo(targetElement, {
              offset: -headerHeight,
              duration: 1.25,
            });
          }
        } else {
          window.scrollTo({
            top: targetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }

        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        targetElement.focus({ preventScroll: true });

        if (targetPosition === 0) {
          document.querySelectorAll('.nav-link').forEach((navLink) => {
            navLink.classList.remove('active');
          });
        }

        if (history.pushState) {
          history.pushState(null, '', targetId);
        } else {
          location.hash = targetId;
        }
      });
    });
  };

  // -------------------------------------------------------------------------
  // 8. Active Navigation Link Highlighting via IntersectionObserver
  // -------------------------------------------------------------------------
  const initActiveNavHighlight = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
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
  // 9. Profile Picture Graceful Fallback
  // -------------------------------------------------------------------------
  const initProfileImageFallback = () => {
    const profileImg = document.getElementById('profile-image');
    if (!profileImg) return;

    profileImg.addEventListener('error', () => {
      profileImg.classList.add('error');
    });

    if (profileImg.complete && profileImg.naturalWidth === 0) {
      profileImg.classList.add('error');
    }
  };

  // -------------------------------------------------------------------------
  // 10. Certificate Lightbox Modal
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
  // 11. Automatic File Download Handler (Forces download directly)
  // -------------------------------------------------------------------------
  const initAutoDownloads = () => {
    const triggerBlobDownload = (blob, filename) => {
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

  // -------------------------------------------------------------------------
  // Initialize all interactive modules
  // -------------------------------------------------------------------------
  initLenis();
  initScrollProgress();
  initScrollReveals();
  initCard3DTilt();
  initParallaxElements();
  initFooterYear();
  initMobileNav();
  initSmoothScroll();
  initActiveNavHighlight();
  initProfileImageFallback();
  initCertificateModal();
  initAutoDownloads();
});
