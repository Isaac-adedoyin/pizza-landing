/* -------------------------------------------------------------------------
   Pizza Colombia Újpest - Interactive Script
   ------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Navigation Scroll State
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  const toggleMobileMenu = () => {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  };

  mobileToggle.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // 3. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Stats Number Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const countDuration = 2000; // 2 seconds

  const animateCount = (element) => {
    if (!element.hasAttribute('data-target')) {
      return;
    }

    const target = parseInt(element.getAttribute('data-target'), 10);
    const suffix = element.getAttribute('data-suffix') || '';
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / countDuration, 1);
      const currentVal = Math.floor(progress * target);
      element.innerText = currentVal + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = target + suffix;
      }
    };

    window.requestAnimationFrame(step);
  };

  // Trigger count animation when stats section is visible
  const statsSection = document.querySelector('.stats-section');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statNumbers.forEach(num => animateCount(num));
        statsAnimated = true;
        statsObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // 5. Interactive Digital Menu Modal
  const modal = document.getElementById('menu-modal');
  const btnOpenMenu = document.getElementById('btn-open-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const modalOverlay = document.querySelector('.modal-overlay');

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Release background scroll
  };

  if (btnOpenMenu) btnOpenMenu.addEventListener('click', openModal);
  if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 6. Menu Modal Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.menu-tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active tab button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active tab pane
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `pane-${targetTab}`) {
          pane.classList.add('active');
        }
      });
    });
  });

  // 7. Magnetic Button Micro-Interactions (Desktop only)
  const magneticButtons = document.querySelectorAll('.btn-magnetic');

  if (window.innerWidth > 768) {
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const bound = btn.getBoundingClientRect();
        const mouseX = e.clientX - bound.left - bound.width / 2;
        const mouseY = e.clientY - bound.top - bound.height / 2;

        // Disable transitions temporarily for instant mouse tracking
        btn.style.transition = 'none';
        const innerText = btn.querySelector('span');
        const innerIcon = btn.querySelector('svg');
        if (innerText) innerText.style.transition = 'none';
        if (innerIcon) innerIcon.style.transition = 'none';

        // Move the button slightly in the direction of the cursor
        btn.style.transform = `translate(${mouseX * 0.15}px, ${mouseY * 0.15}px)`;
        
        // Also move inner text / svg contents slightly less
        if (innerText) innerText.style.transform = `translate(${mouseX * 0.05}px, ${mouseY * 0.05}px)`;
        if (innerIcon) innerIcon.style.transform = `translate(${mouseX * 0.08}px, ${mouseY * 0.08}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        // Re-enable smooth transition for return snap
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform = 'translate(0px, 0px)';
        
        const innerText = btn.querySelector('span');
        const innerIcon = btn.querySelector('svg');
        if (innerText) {
          innerText.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          innerText.style.transform = 'translate(0px, 0px)';
        }
        if (innerIcon) {
          innerIcon.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          innerIcon.style.transform = 'translate(0px, 0px)';
        }
      });
    });
  }



  // 9. Dynamic Relative Dates for Reviews
  const reviewTimeElements = document.querySelectorAll('.review-time');
  if (reviewTimeElements.length > 0) {
    reviewTimeElements.forEach(el => {
      const dateStr = el.getAttribute('data-date');
      if (!dateStr) return;
      
      const reviewDate = new Date(dateStr);
      const currentDate = new Date();
      
      // Reset hours to compare calendar days
      reviewDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate - reviewDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let relativeText = '';
      if (diffDays < 0) {
        relativeText = 'just now';
      } else if (diffDays === 0) {
        relativeText = 'today';
      } else if (diffDays === 1) {
        relativeText = 'yesterday';
      } else if (diffDays < 7) {
        relativeText = `${diffDays} days ago`;
      } else {
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks === 1) {
          relativeText = '1 week ago';
        } else if (diffWeeks < 4) {
          relativeText = `${diffWeeks} weeks ago`;
        } else {
          const diffMonths = Math.floor(diffDays / 30);
          if (diffMonths === 1) {
            relativeText = '1 month ago';
          } else {
            relativeText = `${diffMonths} months ago`;
          }
        }
      }
      
      // Parse prefix (e.g. "Google Review" or "Facebook" or "Instagram")
      const prefix = el.innerText.split('•')[0].trim();
      el.innerText = `${prefix} • ${relativeText}`;
    });
  }

});
