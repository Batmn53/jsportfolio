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
  // 3. Smooth Scrolling with Header Offset & Reduced Motion Check
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
        let targetPosition = 0;

        // If target is the page top or the header itself, scroll to top of page (0)
        if (targetId === '#top' || targetElement === header) {
          targetPosition = 0;
        } else {
          // Offset by sticky header height for section targets
          const headerHeight = header ? header.offsetHeight : 0;
          targetPosition = Math.max(
            0,
            targetElement.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - headerHeight
          );
        }

        const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
        window.scrollTo({
          top: targetPosition,
          behavior: behavior
        });

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

  // Initialize all interactive modules
  initFooterYear();
  initMobileNav();
  initSmoothScroll();
  initActiveNavHighlight();
  initProfileImageFallback();
  initPlaceholderLinks();
});
