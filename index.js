/* -------------------------------------------------------------------------
   Pizza Colombia Újpest - Interactive Script
   ------------------------------------------------------------------------- */

// Global Configuration
const CONFIG = {
  // To load from a Google Sheet, publish your sheet as CSV, copy the link, and paste it here.
  // Example: 'https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv'
  // Set to 'menu.csv' to load from the local fallback spreadsheet in the project folder.
  // Set to null to use the static fallback menu defined in index.html.
  menuSpreadsheetUrl: null,
  // Configurable SumUp payment link
  sumupPaymentLink: "https://pay.sumup.com/b2c/Q2NFISOS",
  // Restaurant WhatsApp Phone Number for receiving orders
  whatsappNumber: "36708846991"
};

// Simple but robust CSV parser handling commas and quotes inside fields
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped double-quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = localStorage.getItem('pizza_lang') || 'en';

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
  const initMenuTabs = () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.menu-tab-pane');

    tabButtons.forEach(btn => {
      // Remove previous listener to avoid duplicate bindings
      btn.removeEventListener('click', btn._tabHandler);
      
      btn._tabHandler = () => {
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
      };
      
      btn.addEventListener('click', btn._tabHandler);
    });
  };

  initMenuTabs();

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

  // 10. Copy Address to Clipboard
  const btnCopyAddress = document.getElementById('btn-copy-address');
  if (btnCopyAddress) {
    btnCopyAddress.addEventListener('click', () => {
      const addressText = btnCopyAddress.getAttribute('data-address');
      navigator.clipboard.writeText(addressText).then(() => {
        btnCopyAddress.classList.add('copied');
        const originalSvg = btnCopyAddress.innerHTML;
        
        // Success checkmark SVG
        btnCopyAddress.innerHTML = `
          <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        
        setTimeout(() => {
          btnCopyAddress.classList.remove('copied');
          btnCopyAddress.innerHTML = originalSvg;
        }, 2000);
      }).catch(err => {
        console.error('Could not copy address: ', err);
      });
    });
  }

  // 11. Pizzeria Opening Status & Highlight Active Day
  const updatePizzeriaStatus = () => {
    const statusBadge = document.getElementById('pizzeria-status');
    if (!statusBadge) return;

    try {
      // Get Europe/Budapest Time Info
      const options = { timeZone: 'Europe/Budapest', hour: 'numeric', minute: 'numeric', weekday: 'long', hour12: false };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(new Date());
      
      let day = '';
      let hour = 0;
      let minute = 0;
      for (const part of parts) {
        if (part.type === 'weekday') day = part.value;
        if (part.type === 'hour') hour = parseInt(part.value, 10);
        if (part.type === 'minute') minute = parseInt(part.value, 10);
      }
      
      // Opening hours schedule (startHr, startMin, endHr, endMin)
      const schedule = {
        Monday: [13, 30, 23, 30],
        Tuesday: [12, 0, 23, 30],
        Wednesday: [12, 0, 23, 30],
        Thursday: [12, 0, 23, 30],
        Friday: [11, 30, 23, 30],
        Saturday: [11, 30, 23, 30],
        Sunday: [11, 30, 23, 30]
      };
      
      const currentDayHours = schedule[day];
      if (currentDayHours) {
        const [startH, startM, endH, endM] = currentDayHours;
        const currentMinutes = hour * 60 + minute;
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        const isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        
        if (isOpen) {
          statusBadge.innerText = currentLang === 'hu' ? 'Nyitva' : 'Open Now';
          statusBadge.className = 'status-badge open';
        } else {
          statusBadge.innerText = currentLang === 'hu' ? 'Zárva' : 'Closed';
          statusBadge.className = 'status-badge closed';
        }
      }

      // Highlight current day row
      const todayHoursRow = document.querySelector(`.hours-list p[data-day="${day}"]`);
      if (todayHoursRow) {
        todayHoursRow.classList.add('active-day');
      }
    } catch (e) {
      console.error('Error calculating Budapest opening status:', e);
      statusBadge.innerText = currentLang === 'hu' ? 'Látogass el hozzánk' : 'Visit Us';
      statusBadge.className = 'status-badge checking';
    }
  };

  updatePizzeriaStatus();

  // ==========================================================================
  // Spin the Pizza Wheel Logic
  // ==========================================================================
  const prizes = [
    { text: '5% Off Bill', color: '#E74C3C', textCol: '#ffffff', code: 'COLOMBIA-5', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
    { text: 'Free Drink', color: '#F1C40F', textCol: '#2C3E50', code: 'FREE-DRINK', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
    { text: 'Try Again', color: '#BDC3C7', textCol: '#2C3E50', code: '', desc: 'No luck this time! Spin again tomorrow.' },
    { text: '10% Off Bill', color: '#E67E22', textCol: '#ffffff', code: 'COLOMBIA-10', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
    { text: 'Free Drink', color: '#F1C40F', textCol: '#2C3E50', code: 'FREE-DRINK', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
    { text: 'Real Spin', color: '#9B59B6', textCol: '#ffffff', code: 'EATIN-SPIN', desc: 'You won a Real-Life Spin at our pizzeria! Take a screenshot now, post & tag us on Facebook/Instagram, and show this screen to our staff when dining in to spin our physical wheel for a surprise reward! 🎡' },
    { text: 'Free Nutella', color: '#2ECC71', textCol: '#ffffff', code: 'FREE-NUTELLA', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
    { text: 'Try Again', color: '#BDC3C7', textCol: '#2C3E50', code: '', desc: 'No luck today! Spin again tomorrow.' }
  ];

  const pizzaWheel = document.getElementById('pizza-wheel');
  const btnSpinWheel = document.getElementById('btn-spin-wheel');
  const statusArea = document.getElementById('wheel-status-area');
  const resultCard = document.getElementById('wheel-result-card');
  const prizeTitle = document.getElementById('wheel-prize-title');
  const prizeDesc = document.getElementById('wheel-prize-desc');
  const promoCodeText = document.getElementById('wheel-promo-code');
  const btnCopyPromo = document.getElementById('btn-copy-promo');

  // Confetti Particle Engine
  let confettiActive = false;
  let confettiParticles = [];
  const confettiColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

  const initConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }
  };

  const drawConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let activeParticlesCount = 0;
    confettiParticles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;
      
      if (p.y <= canvas.height) {
        activeParticlesCount++;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    if (confettiActive && activeParticlesCount > 0) {
      requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiActive = false;
    }
  };

  const startConfetti = () => {
    initConfetti();
    confettiActive = true;
    drawConfetti();
  };

  window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas && confettiActive) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  const drawWheel = () => {
    const canvas = document.getElementById('pizza-wheel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = cw / 2 - 10;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw outer crust (Pizza border)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#D35400';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#E59866';
    ctx.fill();

    // 2. Draw segments
    const sliceAngle = (Math.PI * 2) / prizes.length;
    prizes.forEach((prize, idx) => {
      const startAngle = idx * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 15, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Slice cuts
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (radius - 15) * Math.cos(startAngle), cy + (radius - 15) * Math.sin(startAngle));
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pepperonis on pizza slices (offset to the sides to prevent text overlap)
      ctx.fillStyle = '#C0392B';
      const midAngle = startAngle + sliceAngle / 2;
      const pepDist = (radius - 15) * 0.55;
      
      // Left side pepperoni
      ctx.beginPath();
      ctx.arc(cx + pepDist * Math.cos(midAngle - 0.22), cy + pepDist * Math.sin(midAngle - 0.22), 5, 0, Math.PI * 2);
      ctx.fill();

      // Right side pepperoni
      ctx.beginPath();
      ctx.arc(cx + pepDist * Math.cos(midAngle + 0.22), cy + pepDist * Math.sin(midAngle + 0.22), 5, 0, Math.PI * 2);
      ctx.fill();

      // Slice text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.fillStyle = prize.textCol;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const textToDraw = currentLang === 'hu' ? (wheelTranslations.hu[prize.text]?.text || prize.text) : prize.text;
      ctx.fillText(textToDraw, radius - 35, 0);
      ctx.restore();
    });

    // 3. Draw inner crust circle ring
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#D35400';
    ctx.stroke();
  };

  function showPrizeResult(prize, alreadySpun) {
    if (alreadySpun) {
      const winIndex = prizes.indexOf(prize);
      const targetDegrees = 270 - (winIndex * 45) - 22.5;
      pizzaWheel.style.transition = 'none';
      pizzaWheel.style.transform = `rotate(${targetDegrees}deg)`;
    }

    btnSpinWheel.classList.add('disabled');
    btnSpinWheel.innerText = currentLang === 'hu' ? 'PÖRGETVE' : 'SPUN';

    statusArea.classList.add('hidden');
    resultCard.classList.remove('hidden');

    if (prize.code) {
      resultCard.querySelector('.result-celebration').innerText = currentLang === 'hu' ? '🎉 HELYBEN FOGYASZTÁS NYERTES! 🎉' : '🎉 DINE-IN WINNER! 🎉';
      const transText = currentLang === 'hu' ? (wheelTranslations.hu[prize.text]?.text || prize.text) : prize.text;
      prizeTitle.innerText = currentLang === 'hu' ? `Nyertél: ${transText}!` : `You won: ${prize.text}!`;
      prizeDesc.innerText = currentLang === 'hu' ? (wheelTranslations.hu[prize.text]?.desc || prize.desc) : prize.desc;
      promoCodeText.innerText = prize.code;
      resultCard.querySelector('.promo-code-container').classList.remove('hidden');
      
      if (!alreadySpun) {
        startConfetti();
      }
    } else {
      resultCard.querySelector('.result-celebration').innerText = currentLang === 'hu' ? '😢 PRÓBÁLD ÚJRA LEGKÖZELEBB! 😢' : '😢 BETTER LUCK NEXT TIME! 😢';
      prizeTitle.innerText = currentLang === 'hu' ? `Próbáld újra!` : `Try Again!`;
      prizeDesc.innerText = currentLang === 'hu' ? (wheelTranslations.hu[prize.text]?.desc || prize.desc) : prize.desc;
      resultCard.querySelector('.promo-code-container').classList.add('hidden');
    }
  }

  if (pizzaWheel && btnSpinWheel) {
    drawWheel();

    // Check localStorage
    const savedPrizeIndex = localStorage.getItem('pizza_wheel_prize');
    if (savedPrizeIndex !== null) {
      const idx = parseInt(savedPrizeIndex, 10);
      const prize = prizes[idx];
      showPrizeResult(prize, true);
    }

    let isSpinning = false;

    btnSpinWheel.addEventListener('click', () => {
      if (isSpinning || localStorage.getItem('pizza_wheel_prize') !== null) return;

      isSpinning = true;
      btnSpinWheel.classList.add('disabled');

      // Random winner based on odds weightings
      const pool = [0, 0, 0, 1, 1, 1, 2, 3, 4, 4, 4, 5, 6, 7];
      const winIndex = pool[Math.floor(Math.random() * pool.length)];
      const prize = prizes[winIndex];

      const fullSpins = 5;
      const targetDegrees = (fullSpins * 360) + (270 - (winIndex * 45) - 22.5);

      pizzaWheel.style.transform = `rotate(${targetDegrees}deg)`;

      pizzaWheel.addEventListener('transitionend', function handler() {
        pizzaWheel.removeEventListener('transitionend', handler);
        isSpinning = false;
        
        localStorage.setItem('pizza_wheel_prize', winIndex);
        showPrizeResult(prize, false);
      });
    });
  }

  // Copy Promo Code to clipboard
  if (btnCopyPromo) {
    btnCopyPromo.addEventListener('click', () => {
      const code = promoCodeText.innerText;
      navigator.clipboard.writeText(code).then(() => {
        btnCopyPromo.classList.add('copied');
        const originalSvg = btnCopyPromo.innerHTML;
        btnCopyPromo.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        setTimeout(() => {
          btnCopyPromo.classList.remove('copied');
          btnCopyPromo.innerHTML = originalSvg;
        }, 2000);
      });
    });
  }

  // 12. Load Dynamic Menu from Spreadsheet / CSV
  async function loadDynamicMenu() {
    if (!CONFIG.menuSpreadsheetUrl) {
      console.log("No menuSpreadsheetUrl defined, using static fallback menu from HTML.");
      return;
    }

    try {
      const response = await fetch(CONFIG.menuSpreadsheetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      
      if (rows.length < 2) {
        throw new Error("CSV file is empty or invalid.");
      }

      // Header mapping
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const catIdx = headers.indexOf("category");
      const nameIdx = headers.indexOf("name");
      const priceIdx = headers.indexOf("price");
      const descIdx = headers.indexOf("description");
      const vegIdx = headers.indexOf("veg/vegan");
      const allergenIdx = headers.indexOf("allergens");
      const popularIdx = headers.indexOf("popular");

      if (catIdx === -1 || nameIdx === -1 || priceIdx === -1) {
        throw new Error("CSV requires at least Category, Name, and Price columns.");
      }

      const items = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3 || !row[nameIdx]) continue; // Skip incomplete/empty rows
        
        items.push({
          category: row[catIdx].trim(),
          name: row[nameIdx].trim(),
          price: row[priceIdx].trim(),
          description: descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "",
          vegVegan: vegIdx !== -1 && row[vegIdx] ? row[vegIdx].trim() : "",
          allergens: allergenIdx !== -1 && row[allergenIdx] ? row[allergenIdx].trim() : "",
          popular: popularIdx !== -1 && row[popularIdx] ? row[popularIdx].trim() : ""
        });
      }

      if (items.length === 0) {
        throw new Error("No menu items parsed from CSV.");
      }

      // Group items by category in order of appearance
      const categoriesMap = new Map();
      items.forEach(item => {
        if (!categoriesMap.has(item.category)) {
          categoriesMap.set(item.category, []);
        }
        categoriesMap.get(item.category).push(item);
      });

      const categories = Array.from(categoriesMap.keys());

      // Generate tab slug mapping (e.g. "Tomato Base Pizzas" -> "tomato-base-pizzas")
      const getSlug = (str) => {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      };

      // Render Tabs
      const tabsContainer = document.getElementById("menu-tabs-container");
      const contentContainer = document.getElementById("menu-content-container");

      if (!tabsContainer || !contentContainer) {
        throw new Error("Menu DOM containers not found.");
      }

      let tabsHTML = "";
      let contentHTML = "";

      categories.forEach((cat, index) => {
        const slug = getSlug(cat);
        const activeClass = index === 0 ? "active" : "";
        
        // Tab button
        tabsHTML += `<button class="tab-btn ${activeClass}" data-tab="${slug}">${cat}</button>`;

        // Tab pane
        contentHTML += `<div class="menu-tab-pane ${activeClass}" id="pane-${slug}">`;
        contentHTML += `<div class="menu-grid">`;

        categoriesMap.get(cat).forEach(item => {
          // Badges HTML
          let badgesHTML = "";
          if (item.vegVegan) {
            const val = item.vegVegan.toLowerCase();
            const isVegan = val === "vegan";
            const badgeClass = isVegan ? "badge-vegan" : "badge-veg";
            const emoji = isVegan ? "🍃" : "🌱";
            badgesHTML += `<span class="badge ${badgeClass}">${emoji} ${item.vegVegan}</span>`;
          }
          if (item.allergens) {
            badgesHTML += `<span class="badge badge-allergen">Allergens: ${item.allergens}</span>`;
          }
          if (item.popular && (item.popular.toLowerCase() === "yes" || item.popular.toLowerCase() === "true")) {
            badgesHTML += `<span class="badge badge-popular">🔥 Popular</span>`;
          }

          contentHTML += `
            <div class="menu-item">
              <div class="menu-item-header">
                <span class="menu-item-name">${item.name}</span>
                <span class="menu-item-price">${item.price}</span>
              </div>
              ${item.description ? `<p class="menu-item-desc">${item.description}</p>` : ''}
              ${badgesHTML ? `<div class="menu-item-badges">${badgesHTML}</div>` : ''}
            </div>
          `;
        });

        contentHTML += `</div></div>`;
      });

      // Update DOM
      tabsContainer.innerHTML = tabsHTML;
      contentContainer.innerHTML = contentHTML;
      console.log(`Successfully loaded ${items.length} menu items from CSV.`);

      // Reinitialize tab click listeners
      initMenuTabs();
    } catch (error) {
      console.warn("Failed to load spreadsheet menu. Defaulting to HTML fallback. Error:", error);
    }
  }

  // ==========================================================================
  // Shopping Cart & Multi-Step Checkout Logic
  // ==========================================================================
  let cart = [];
  let currentStep = 'cart'; // 'cart', 'checkout', 'review', 'success'
  const DELIVERY_FEE = 800;

  // DOM Elements
  const btnFloatingCart = document.getElementById('btn-floating-cart');
  const cartCount = document.getElementById('cart-count');
  const cartTotalFloating = document.getElementById('cart-total-floating');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.querySelector('.cart-drawer-overlay');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartDrawerFooter = document.getElementById('cart-drawer-footer');
  
  const subtotalLabel = document.getElementById('cart-summary-subtotal');
  const deliveryFeeRow = document.getElementById('delivery-fee-row');
  const deliveryLabel = document.getElementById('cart-summary-delivery');
  const totalLabel = document.getElementById('cart-summary-total');

  const checkoutForm = document.getElementById('checkout-form');
  const deliveryAddressGroup = document.getElementById('delivery-address-group');
  const radioPickup = document.getElementById('type-pickup');
  const radioDelivery = document.getElementById('type-delivery');
  const inputAddress = document.getElementById('checkout-address');

  // Steps
  const stepCart = document.getElementById('step-cart');
  const stepCheckout = document.getElementById('step-checkout');
  const stepReview = document.getElementById('step-review');
  const stepPayment = document.getElementById('step-payment');
  const verificationModal = document.getElementById('verification-modal');
  const stepSuccess = document.getElementById('step-success');
  const btnSkipTimer = document.getElementById('btn-skip-timer');
  const drawerTitle = document.getElementById('cart-drawer-title');

  // Footer Buttons
  const btnGotoCheckout = document.getElementById('btn-goto-checkout');
  const checkoutButtonsGroup = document.getElementById('checkout-buttons-group');
  const btnBackToCart = document.getElementById('btn-back-to-cart');
  const btnGotoReview = document.getElementById('btn-goto-review');
  
  const reviewButtonsGroup = document.getElementById('review-buttons-group');
  const btnBackToCheckout = document.getElementById('btn-back-to-checkout');
  const btnPaySumup = document.getElementById('btn-pay-sumup');
  const btnSuccessClose = document.getElementById('btn-success-close');

  // Payment Pending Buttons
  const btnPaymentDone = document.getElementById('btn-payment-done');
  const btnPaymentCancel = document.getElementById('btn-payment-cancel');

  // Verification Modal Elements
  const btnChefConfirmed = document.getElementById('btn-chef-confirmed');
  const btnVerificationWhatsapp = document.getElementById('btn-verification-whatsapp');
  const btnVerificationCancel = document.getElementById('btn-verification-cancel');
  const verificationContactGroup = document.getElementById('verification-contact-group');
  const verificationInstructionText = document.getElementById('verification-instruction-text');
  const verificationPulseDot = document.getElementById('verification-pulse-dot');
  const verificationPulseText = document.getElementById('verification-pulse-text');
  const verificationRing = document.getElementById('verification-ring');

  // Open & Close Cart Drawer
  const openCart = (step = 'cart') => {
    if (cartDrawer) {
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      switchStep(step);
    }
  };

  const closeCart = () => {
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (btnFloatingCart) btnFloatingCart.addEventListener('click', () => openCart('cart'));
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Toggle delivery address group visibility
  const updateAddressFieldVisibility = () => {
    if (!deliveryAddressGroup || !inputAddress) return;
    if (radioDelivery && radioDelivery.checked) {
      deliveryAddressGroup.classList.add('active');
      deliveryAddressGroup.classList.remove('hidden');
      inputAddress.setAttribute('required', 'required');
    } else {
      deliveryAddressGroup.classList.remove('active');
      deliveryAddressGroup.classList.add('hidden');
      inputAddress.removeAttribute('required');
    }
    updateTotals();
  };

  if (radioPickup) radioPickup.addEventListener('change', updateAddressFieldVisibility);
  if (radioDelivery) radioDelivery.addEventListener('change', updateAddressFieldVisibility);

  // Add Item to Cart
  const addToCart = (name, price) => {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCartCount();
    updateTotals();
    renderCartItems();
    openCart();
    
    // Switch back to cart view step if adding new items
    switchStep('cart');
  };

  // Change Quantity
  const changeQty = (name, delta) => {
    const item = cart.find(i => i.name === name);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
      }
      updateCartCount();
      updateTotals();
      renderCartItems();
    }
  };

  // Remove Item
  const removeItem = (name) => {
    cart = cart.filter(item => item.name !== name);
    updateCartCount();
    updateTotals();
    renderCartItems();
  };

  // Update Cart Count Badge
  const updateCartCount = () => {
    if (!cartCount || !btnFloatingCart) return;
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCount.innerText = count;
    
    if (count > 0) {
      btnFloatingCart.classList.remove('hidden');
    } else {
      btnFloatingCart.classList.add('hidden');
      closeCart();
    }
  };

  // Update totals
  const updateTotals = () => {
    if (!subtotalLabel || !cartTotalFloating || !totalLabel) return;
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const hasDelivery = radioDelivery && radioDelivery.checked;
    const total = subtotal + (hasDelivery ? DELIVERY_FEE : 0);

    const formatPrice = (val) => val.toLocaleString('hu-HU') + ' Ft';

    subtotalLabel.innerText = formatPrice(subtotal);
    cartTotalFloating.innerText = formatPrice(subtotal);
    
    if (hasDelivery && subtotal > 0) {
      if (deliveryFeeRow) deliveryFeeRow.classList.remove('hidden');
      if (deliveryLabel) deliveryLabel.innerText = formatPrice(DELIVERY_FEE);
    } else {
      if (deliveryFeeRow) deliveryFeeRow.classList.add('hidden');
    }
    
    totalLabel.innerText = formatPrice(total);
  };

  // Render items list
  const renderCartItems = () => {
    if (!cartItemsContainer || !cartDrawerFooter) return;
    if (cart.length === 0) {
      const emptyText = currentLang === 'hu' ? 'A kosarad üres.' : 'Your cart is empty.';
      const emptySub = currentLang === 'hu' ? 'Kezdéshez adj hozzá néhány finom pizzát az étlapról!' : 'Add some delicious pizzas from our menu to get started!';
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <span class="cart-empty-emoji">🍕</span>
          <p>${emptyText}</p>
          <p class="empty-sub">${emptySub}</p>
        </div>
      `;
      cartDrawerFooter.classList.add('hidden');
      return;
    }

    cartDrawerFooter.classList.remove('hidden');
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
      let displayName = item.name;
      if (item.name.startsWith('Extra Topping: ')) {
        const topName = item.name.replace('Extra Topping: ', '').trim();
        const translatedTop = currentLang === 'hu' ? (toppingTranslations[topName] || topName) : topName;
        displayName = currentLang === 'hu' ? `Extra feltét: ${translatedTop}` : `Extra Topping: ${translatedTop}`;
      } else {
        displayName = currentLang === 'hu' ? (menuTranslations.hu[item.name]?.name || item.name) : item.name;
      }

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-details">
          <div class="cart-item-name">${displayName}</div>
          <div class="cart-item-price">${(item.price * item.qty).toLocaleString('hu-HU')} Ft</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn dec-btn" type="button">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="qty-btn inc-btn" type="button">+</button>
          <button class="btn-remove-item" type="button" aria-label="Remove item">&times;</button>
        </div>
      `;

      row.querySelector('.dec-btn').addEventListener('click', () => changeQty(item.name, -1));
      row.querySelector('.inc-btn').addEventListener('click', () => changeQty(item.name, 1));
      row.querySelector('.btn-remove-item').addEventListener('click', () => removeItem(item.name));
      
      cartItemsContainer.appendChild(row);
    });
  };

  // Switch steps
  const switchStep = (step) => {
    currentStep = step;
    
    // Toggle active step pane
    [stepCart, stepCheckout, stepReview, stepPayment, stepSuccess].forEach(el => {
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none'; // Force hide inline
      }
    });
    
    // Toggle footer buttons group
    if (btnGotoCheckout) {
      btnGotoCheckout.classList.remove('active');
      btnGotoCheckout.style.display = 'none'; // Force hide inline
    }
    if (checkoutButtonsGroup) checkoutButtonsGroup.classList.add('hidden');
    if (reviewButtonsGroup) reviewButtonsGroup.classList.add('hidden');
    if (cartDrawerFooter) cartDrawerFooter.classList.remove('hidden');

    // Footer actions labels
    const btnGotoCheckoutText = btnGotoCheckout ? btnGotoCheckout.querySelector('span') : null;
    const btnGotoReviewText = btnGotoReview ? btnGotoReview.querySelector('span') : null;
    const btnBackToCart = document.getElementById('btn-back-to-cart');
    const btnBackToCheckout = document.getElementById('btn-back-to-checkout');
    const btnPaySumupText = btnPaySumup ? btnPaySumup.querySelector('span') : null;

    if (btnGotoCheckoutText) {
      btnGotoCheckoutText.innerText = currentLang === 'hu' ? 'Tovább a pénztárhoz' : 'Proceed to Checkout';
    }
    if (btnGotoReviewText) {
      btnGotoReviewText.innerText = currentLang === 'hu' ? 'Rendelés áttekintése' : 'Review Order';
    }
    if (btnBackToCart) {
      btnBackToCart.innerText = currentLang === 'hu' ? 'Vissza' : 'Back';
    }
    if (btnBackToCheckout) {
      btnBackToCheckout.innerText = currentLang === 'hu' ? 'Adatok módosítása' : 'Edit Info';
    }
    if (btnPaySumupText) {
      btnPaySumupText.innerText = currentLang === 'hu' ? 'Fizetés SumUp-pal' : 'Pay with SumUp';
    }

    if (step === 'cart') {
      if (stepCart) {
        stepCart.classList.add('active');
        stepCart.style.display = 'flex'; // Force show inline
      }
      if (btnGotoCheckout) {
        btnGotoCheckout.classList.add('active');
        btnGotoCheckout.style.display = 'inline-flex'; // Force show inline
      }
      if (drawerTitle) drawerTitle.innerText = currentLang === 'hu' ? 'Rendelésed 🛒' : 'Your Order 🛒';
    } else if (step === 'checkout') {
      if (stepCheckout) {
        stepCheckout.classList.add('active');
        stepCheckout.style.display = 'flex'; // Force show inline
      }
      if (checkoutButtonsGroup) checkoutButtonsGroup.classList.remove('hidden');
      if (drawerTitle) drawerTitle.innerText = currentLang === 'hu' ? 'Szállítási adatok ✍️' : 'Checkout details ✍️';
    } else if (step === 'review') {
      if (stepReview) {
        stepReview.classList.add('active');
        stepReview.style.display = 'flex'; // Force show inline
      }
      if (reviewButtonsGroup) reviewButtonsGroup.classList.remove('hidden');
      if (drawerTitle) drawerTitle.innerText = currentLang === 'hu' ? 'Rendelés áttekintése 👀' : 'Review Order 👀';
    } else if (step === 'payment') {
      if (stepPayment) {
        stepPayment.classList.add('active');
        stepPayment.style.display = 'flex'; // Force show inline
      }
      if (cartDrawerFooter) cartDrawerFooter.classList.add('hidden');
      if (drawerTitle) drawerTitle.innerText = currentLang === 'hu' ? 'Fizetés megerősítése 💳' : 'Confirm Payment 💳';
    } else if (step === 'success') {
      if (stepSuccess) {
        stepSuccess.classList.add('active');
        stepSuccess.style.display = 'flex'; // Force show inline
      }
      if (cartDrawerFooter) cartDrawerFooter.classList.add('hidden');
      if (drawerTitle) drawerTitle.innerText = currentLang === 'hu' ? 'Rendelés elküldve! 🚀' : 'Order Sent! 🚀';
    }
  };

  let verificationTimerInterval = null;

  const startVerificationTimer = () => {
    if (verificationTimerInterval) clearInterval(verificationTimerInterval);
    
    // Reset Verification modal state
    if (verificationPulseDot) {
      verificationPulseDot.className = 'pulse-dot-green';
    }
    if (verificationPulseText) {
      verificationPulseText.innerText = currentLang === 'hu' ? 'Várakozás a konyha válaszára...' : 'Waiting for kitchen response...';
    }
    if (verificationInstructionText) {
      verificationInstructionText.innerText = currentLang === 'hu'
        ? "Összevetjük a WhatsApp rendelési adatait a SumUp fizetéssel. Amint a konyha megerősíti a fizetést, kattintson az alábbi megerősítő gombra."
        : "We are matching your WhatsApp order details with your SumUp payment. Once the kitchen confirms your payment, click the confirmation button below.";
    }
    if (btnChefConfirmed) {
      btnChefConfirmed.style.display = 'inline-flex';
    }
    if (verificationContactGroup) {
      verificationContactGroup.classList.add('hidden');
    }
    if (verificationRing) {
      verificationRing.style.borderColor = 'rgba(46, 204, 113, 0.3)';
      verificationRing.style.borderTopColor = '#2ECC71';
    }

    let timeLeft = 180; // 3 minutes in seconds
    const timerDisplay = document.getElementById('verification-timer');
    
    const updateTimer = () => {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      if (timerDisplay) {
        timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      
      if (timeLeft <= 0) {
        clearInterval(verificationTimerInterval);
        handleVerificationTimeout();
      }
      timeLeft--;
    };
    
    updateTimer();
    verificationTimerInterval = setInterval(updateTimer, 1000);
  };

  const handleVerificationTimeout = () => {
    if (verificationPulseDot) {
      verificationPulseDot.className = 'pulse-dot-red';
    }
    if (verificationPulseText) {
      verificationPulseText.innerText = currentLang === 'hu' ? 'Az ellenőrzés túllépte az időkorlátot.' : 'Verification timeout.';
    }
    if (verificationInstructionText) {
      verificationInstructionText.innerText = currentLang === 'hu'
        ? "Nem tudtuk automatikusan megerősíteni a fizetést. Ha már fizetett, kérjük, lépjen kapcsolatba a konyhával közvetlenül az alábbi elérhetőségeken a manuális ellenőrzéshez."
        : "We couldn't verify your payment automatically. If you have already paid, please contact our kitchen directly below to verify manually.";
    }
    if (btnChefConfirmed) {
      btnChefConfirmed.style.display = 'none';
    }
    if (verificationContactGroup) {
      verificationContactGroup.classList.remove('hidden');
    }
    if (verificationRing) {
      verificationRing.style.borderColor = 'rgba(231, 76, 60, 0.3)';
      verificationRing.style.borderTopColor = '#E74C3C';
    }
  };

  const completeVerification = () => {
    if (verificationTimerInterval) clearInterval(verificationTimerInterval);
    
    // Hide verification modal
    if (verificationModal) {
      verificationModal.classList.add('hidden');
    }
    
    // Open cart drawer directly to success view
    openCart('success');
    
    // Clear cart state now
    cart = [];
    updateCartCount();
    updateTotals();
    renderCartItems();
    
    // Launch confetti celebration
    if (typeof startConfetti === 'function') {
      startConfetti();
    }
  };

  // Bind confirmation button click
  if (btnChefConfirmed) {
    btnChefConfirmed.addEventListener('click', () => {
      completeVerification();
    });
  }

  // Bind WhatsApp help button
  if (btnVerificationWhatsapp) {
    btnVerificationWhatsapp.addEventListener('click', () => {
      const name = document.getElementById('checkout-name').value || (currentLang === 'hu' ? 'Vásárló' : 'Customer');
      const helpMessage = currentLang === 'hu'
        ? `Üdvözlöm! A fizetés ellenőrzése túllépte a várakozási időt a(z) *${name}* néven leadott rendelésnél. Segítene a fizetés manuális ellenőrzésében?`
        : `Hello, my payment verification timed out for my order under the name *${name}*. Could you please verify my payment manually?`;
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(helpMessage)}`, '_blank');
    });
  }

  // Bind cancel verification button
  if (btnVerificationCancel) {
    btnVerificationCancel.addEventListener('click', () => {
      if (verificationTimerInterval) clearInterval(verificationTimerInterval);
      if (verificationModal) {
        verificationModal.classList.add('hidden');
      }
      openCart('review');
    });
  }

  // Step 1: Proceed to Checkout click
  if (btnGotoCheckout) {
    btnGotoCheckout.addEventListener('click', () => {
      switchStep('checkout');
    });
  }

  // Step 2: Back to Cart click
  if (btnBackToCart) {
    btnBackToCart.addEventListener('click', () => {
      switchStep('cart');
    });
  }

  // Step 2: Proceed to Review click
  if (btnGotoReview) {
    btnGotoReview.addEventListener('click', () => {
      // Validate inputs
      const name = document.getElementById('checkout-name').value.trim();
      const phone = document.getElementById('checkout-phone').value.trim();
      const isDelivery = radioDelivery && radioDelivery.checked;
      const address = document.getElementById('checkout-address').value.trim();

      if (!name) {
        alert(currentLang === 'hu' ? 'Kérjük, adja meg a nevét.' : 'Please enter your full name.');
        document.getElementById('checkout-name').focus();
        return;
      }
      if (!phone) {
        alert(currentLang === 'hu' ? 'Kérjük, adja meg a telefonszámát.' : 'Please enter your phone number.');
        document.getElementById('checkout-phone').focus();
        return;
      }
      if (isDelivery && !address) {
        alert(currentLang === 'hu' ? 'Kérjük, adja meg a szállítási címet.' : 'Please enter your delivery address.');
        document.getElementById('checkout-address').focus();
        return;
      }

      // Populate review section
      document.getElementById('review-name').innerText = name;
      document.getElementById('review-phone').innerText = phone;
      document.getElementById('review-method').innerText = isDelivery 
        ? (currentLang === 'hu' ? '🚗 Kiszállítás' : '🚗 Delivery') 
        : (currentLang === 'hu' ? '🚶 Helyszíni átvétel' : '🚶 Pickup');

      if (isDelivery) {
        const floor = document.getElementById('checkout-floor').value.trim();
        const door = document.getElementById('checkout-door').value.trim();
        const doorbell = document.getElementById('checkout-doorbell').value.trim();
        
        let fullAddress = address;
        if (floor) fullAddress += `, ${currentLang === 'hu' ? 'Emelet' : 'Floor'}: ${floor}`;
        if (door) fullAddress += `, ${currentLang === 'hu' ? 'Ajtó' : 'Door'}: ${door}`;
        if (doorbell) fullAddress += `, ${currentLang === 'hu' ? 'Kapucsengő' : 'Doorbell'}: ${doorbell}`;
        
        document.getElementById('review-address').innerText = fullAddress;
        document.getElementById('review-address-box').classList.remove('hidden');
      } else {
        document.getElementById('review-address-box').classList.add('hidden');
      }

      const notes = document.getElementById('checkout-notes').value.trim();
      if (notes) {
        document.getElementById('review-notes').innerText = notes;
        document.getElementById('review-notes-box').classList.remove('hidden');
      } else {
        document.getElementById('review-notes-box').classList.add('hidden');
      }

      // Populate review items list
      const reviewList = document.getElementById('review-items-list');
      if (reviewList) {
        reviewList.innerHTML = '';
        cart.forEach(item => {
          let displayName = item.name;
          if (item.name.startsWith('Extra Topping: ')) {
            const topName = item.name.replace('Extra Topping: ', '').trim();
            const translatedTop = currentLang === 'hu' ? (toppingTranslations[topName] || topName) : topName;
            displayName = currentLang === 'hu' ? `Extra feltét: ${translatedTop}` : `Extra Topping: ${translatedTop}`;
          } else {
            displayName = currentLang === 'hu' ? (menuTranslations.hu[item.name]?.name || item.name) : item.name;
          }
          const row = document.createElement('div');
          row.className = 'review-item-row';
          row.innerHTML = `
            <span class="item-qty-name">${item.qty}x ${displayName}</span>
            <span>${(item.price * item.qty).toLocaleString('hu-HU')} Ft</span>
          `;
          reviewList.appendChild(row);
        });
      }

      switchStep('review');
    });
  }

  // Step 3: Back to Checkout click
  if (btnBackToCheckout) {
    btnBackToCheckout.addEventListener('click', () => {
      switchStep('checkout');
    });
  }

  // Step 3: Pay with SumUp click
  if (btnPaySumup) {
    btnPaySumup.addEventListener('click', () => {
      // Calculate total
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      const hasDelivery = radioDelivery && radioDelivery.checked;
      const total = subtotal + (hasDelivery ? DELIVERY_FEE : 0);

      // Open configurable SumUp link in a new tab (adding query param for amount auto-filling if supported by payment gateway)
      window.open(CONFIG.sumupPaymentLink + "?amount=" + total, '_blank');

      // Populate success and pending view details
      const successAmountEl = document.getElementById('success-total-amount');
      if (successAmountEl) {
        successAmountEl.innerText = total.toLocaleString('hu-HU') + ' Ft';
      }
      const pendingAmountEl = document.getElementById('pending-total-amount');
      if (pendingAmountEl) {
        pendingAmountEl.innerText = total.toLocaleString('hu-HU') + ' Ft';
      }

      // Switch to payment pending step
      switchStep('payment');
    });
  }

  // Payment Pending Done click
  if (btnPaymentDone) {
    btnPaymentDone.addEventListener('click', () => {
      // Compile order text before clearing cart
      const name = document.getElementById('checkout-name').value;
      const phone = document.getElementById('checkout-phone').value;
      const method = radioDelivery && radioDelivery.checked ? 'Delivery' : 'Pickup';
      const notes = document.getElementById('checkout-notes').value || (currentLang === 'hu' ? 'Nincs' : 'None');
      const address = document.getElementById('checkout-address').value || '';
      const floor = document.getElementById('checkout-floor').value || '';
      const door = document.getElementById('checkout-door').value || '';
      const doorbell = document.getElementById('checkout-doorbell').value || '';

      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      const hasDelivery = method === 'Delivery';
      const total = subtotal + (hasDelivery ? 800 : 0);

      let itemsText = '';
      cart.forEach(item => {
        let displayName = item.name;
        if (item.name.startsWith('Extra Topping: ')) {
          const topName = item.name.replace('Extra Topping: ', '').trim();
          const translatedTop = currentLang === 'hu' ? (toppingTranslations[topName] || topName) : topName;
          displayName = currentLang === 'hu' ? `Extra feltét: ${translatedTop}` : `Extra Topping: ${translatedTop}`;
        } else {
          displayName = currentLang === 'hu' ? (menuTranslations.hu[item.name]?.name || item.name) : item.name;
        }
        itemsText += ` - ${item.qty}x ${displayName} (${(item.price * item.qty).toLocaleString('hu-HU')} Ft)\n`;
      });

      let orderMessage = '';
      if (currentLang === 'hu') {
        const transMethod = method === 'Delivery' ? 'Kiszállítás' : 'Helyszíni átvétel';
        orderMessage = `🍕 *Új rendelés!* 🍕\n\n`;
        orderMessage += `👤 *Név:* ${name}\n`;
        orderMessage += `📞 *Telefon:* ${phone}\n`;
        orderMessage += `📦 *Átvétel:* ${transMethod}\n`;
        if (hasDelivery) {
          orderMessage += `📍 *Cím:* ${address}\n`;
          if (floor) orderMessage += `🏢 *Emelet:* ${floor}\n`;
          if (door) orderMessage += `🚪 *Ajtó:* ${door}\n`;
          if (doorbell) orderMessage += `🔔 *Kapucsengő:* ${doorbell}\n`;
        }
        orderMessage += `📝 *Megjegyzés:* ${notes}\n\n`;
        orderMessage += `🛒 *Rendelt termékek:*\n${itemsText}\n`;
        orderMessage += `💰 *Részösszeg:* ${subtotal.toLocaleString('hu-HU')} Ft\n`;
        if (hasDelivery) orderMessage += `🚚 *Szállítási díj:* 800 Ft\n`;
        orderMessage += `💳 *Fizetett végösszeg:* *${total.toLocaleString('hu-HU')} Ft*\n\n`;
        orderMessage += `⚠️ *FONTOS: A konyha KIZÁRÓLAG azután kezdi el az étel készítését, miután megerősítette a SumUp fizetés sikeres beérkezését.*`;
      } else {
        orderMessage = `🍕 *New Order!* 🍕\n\n`;
        orderMessage += `👤 *Name:* ${name}\n`;
        orderMessage += `📞 *Phone:* ${phone}\n`;
        orderMessage += `📦 *Method:* ${method}\n`;
        if (hasDelivery) {
          orderMessage += `📍 *Address:* ${address}\n`;
          if (floor) orderMessage += `🏢 *Floor:* ${floor}\n`;
          if (door) orderMessage += `🚪 *Door:* ${door}\n`;
          if (doorbell) orderMessage += `🔔 *Doorbell:* ${doorbell}\n`;
        }
        orderMessage += `📝 *Notes:* ${notes}\n\n`;
        orderMessage += `🛒 *Items Ordered:*\n${itemsText}\n`;
        orderMessage += `💰 *Subtotal:* ${subtotal.toLocaleString('hu-HU')} Ft\n`;
        if (hasDelivery) orderMessage += `🚚 *Delivery Fee:* 800 Ft\n`;
        orderMessage += `💳 *Total Amount Paid:* *${total.toLocaleString('hu-HU')} Ft*\n\n`;
        orderMessage += `⚠️ *IMPORTANT: The kitchen will ONLY start preparing this order AFTER confirming that the SumUp payment has been successfully received.*`;
      }

      // Open WhatsApp to send the order message to the kitchen
      const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank');

      // Close the cart drawer
      closeCart();

      // Open the chef verification modal
      if (verificationModal) {
        verificationModal.classList.remove('hidden');
      }

      // Start the timer
      startVerificationTimer();
    });
  }

  // Payment Pending Cancel click
  if (btnPaymentCancel) {
    btnPaymentCancel.addEventListener('click', () => {
      switchStep('review');
    });
  }

  // Success Done button click
  if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => {
      closeCart();
      if (checkoutForm) checkoutForm.reset();
      updateAddressFieldVisibility();
      switchStep('cart');
    });
  }

  // Initialize cart buttons
  const initAddToCartButtons = () => {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      // Avoid duplicates
      if (item.querySelector('.btn-add-to-cart')) return;
      
      const nameEl = item.querySelector('.menu-item-name');
      const priceEl = item.querySelector('.menu-item-price');
      if (!nameEl || !priceEl) return;
      
      const name = nameEl.innerText.trim();
      const priceText = priceEl.innerText.trim();
      
      // Parse numeric price
      const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      if (isNaN(price)) return;
      
      const btn = document.createElement('button');
      btn.className = 'btn-add-to-cart btn-magnetic';
      btn.type = 'button';
      btn.innerHTML = '<span>Add to Cart 🛒</span>';
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(name, price);
      });
      
      item.appendChild(btn);
    });
  };

  // Bind topping badge clicks to add to cart
  const initToppingBadges = () => {
    const toppingBadges = document.querySelectorAll('.topping-badge');
    toppingBadges.forEach(badge => {
      if (badge._hasListener) return;
      badge._hasListener = true;
      
      badge.style.cursor = 'pointer';
      badge.style.transition = 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease';
      
      badge.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Extract topping name and price
        const nameText = badge.childNodes[0].textContent.trim();
        const priceText = badge.querySelector('.price').textContent.replace('+', '').replace('Ft', '').replace(/\s/g, '').trim();
        const priceVal = parseInt(priceText, 10);
        
        if (nameText && !isNaN(priceVal)) {
          addToCart(`Extra Topping: ${nameText}`, priceVal);
          
          // Flash green feedback
          const originalBg = badge.style.backgroundColor;
          const originalColor = badge.style.color;
          badge.style.backgroundColor = '#2ECC71';
          badge.style.color = '#ffffff';
          badge.style.transform = 'scale(1.05)';
          
          setTimeout(() => {
            badge.style.backgroundColor = originalBg;
            badge.style.color = originalColor;
            badge.style.transform = '';
          }, 600);
        }
      });
    });
  };

  // Helper function to copy clean amount to clipboard
  const bindCopyAmountButton = (btnId, amountElId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      // Remove previous listener to avoid duplicates
      btn.onclick = null;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const amountEl = document.getElementById(amountElId);
        if (amountEl) {
          const cleanNumber = amountEl.innerText.replace(/[^0-9]/g, '');
          navigator.clipboard.writeText(cleanNumber).then(() => {
            const originalLabel = btn.innerHTML;
            btn.innerHTML = `<span>${currentLang === 'hu' ? '✅ Másolva!' : '✅ Copied!'}</span>`;
            setTimeout(() => {
              btn.innerHTML = originalLabel;
            }, 1500);
          });
        }
      });
    }
  };

  // ==========================================================================
  // Bilingual English / Hungarian Translation System
  // ==========================================================================
  const uiTranslations = {
    en: {
      nav_home: 'Home',
      nav_oven: 'Oven',
      nav_ingredients: 'Ingredients',
      nav_styles: 'Styles',
      nav_stats: 'Stats',
      nav_order: 'Order Now',
      nav_order_mobile: 'Order Online',
      hero_title: 'Pizza Colombia offers fresh Neapolitan and New York-style pizzas in Újpest.',
      hero_subtitle: 'View our menu, see upcoming events, and get all essential information in one place.',
      hero_btn: 'Explore Menu & Order',
      showcase1_title: 'Authentic Neapolitan Pizza Catering & Pizzeria Experience',
      showcase1_subtitle: 'Experience authentic Neapolitan pizza, whether at your event or in our pizzeria.',
      card1_title: '🔥 Mobile Gas Ovens for Off-Site Catering',
      card1_text: 'For corporate events, private functions, birthdays, weddings, and festivals, we bring our professional mobile gas-fired pizza ovens directly to your venue. Operating at temperatures of up to 450°C, these ovens allow us to hand-stretch and bake authentic Neapolitan pizzas fresh on-site in as little as 90 seconds, creating an unforgettable live food experience for your guests.',
      badge_corporate: 'Corporate Catering',
      badge_private: 'Private Functions',
      badge_birthday: 'Birthday Parties',
      badge_weddings: 'Weddings',
      badge_teambuilding: 'Team Building Events',
      badge_festivals: 'Festivals & Gatherings',
      card2_title: '⚡ Artisanal Electric Deck Oven for In-House Service',
      card2_text: 'At Pizza Colombia, our electric deck oven forms the heart of our kitchen. Baking at approximately 450°C (840°F), it delivers precise and consistent heat across the stone deck, producing our signature leopard-spotted crust, airy cornicione, and perfectly baked Neapolitan style pizzas every time.',
      badge_dining: 'In-House Dining',
      badge_excellence: 'Dine-in Excellence',
      badge_takeaway: 'Takeaway Service',
      badge_consistent: 'Consistent Baking',
      badge_crust: 'Leopard-Spotted Crust',
      feature1: 'Authentic Neapolitan Pizza',
      feature2: 'Mobile Gas Ovens for Events',
      feature3: 'Electric Deck Oven for Pizzeria Service',
      feature4: 'Freshly Made Before Your Guests',
      feature5: 'Tailored Catering Packages Available',
      catering_outro: 'We offer a range of classic and gourmet pizzas, with vegetarian, vegan, and meat options available. From intimate gatherings to large-scale events, we bring the authentic taste of Naples to every occasion.',
      tagline: 'Fresh. Authentic. Fired with Passion.',
      showcase2_title: 'Fresh & Premium Ingredients',
      showcase2_subheading: 'Exceptional pizza begins with exceptional ingredients.',
      showcase2_text1: 'We use only carefully selected, high-quality ingredients, starting with <strong>San Marzano tomatoes</strong> creating a naturally sweet and balanced sauce.',
      showcase2_text2: 'Each pizza is topped with <strong>premium mozzarella</strong> particular for each type of oven (gas or electric), fresh basil, and a drizzle of extra virgin olive oil, complemented by locally sourced produce and quality imported Italian ingredients wherever possible.',
      showcase2_text3: 'The result is simple, honest food that celebrates the authentic flavours of Naples—fresh, vibrant, and crafted with care in every bite.',
      showcase3_title: 'Neapolitan Meets New York',
      showcase3_subheading: 'Why choose one when you can enjoy both?',
      showcase3_text1: 'Experience the best of two pizza traditions.',
      comparison_neapolitan_title: '🍕 Neapolitan Style',
      comparison_neapolitan_desc: 'Our handcrafted Neapolitan pizzas feature a light, airy sourdough crust with a soft, tender center and beautifully blistered cornicione, baked at high heat for authentic flavor and texture.',
      comparison_newyork_title: '🗽 New York Style',
      comparison_newyork_desc: 'Prefer something crispier? Our New York-style pizzas offer a thin, foldable crust with the perfect balance of crunch and chew, topped generously and baked to golden perfection.',
      showcase3_text2: "Whether you're craving the artisanal elegance of Naples or the bold, satisfying bite of New York, we've got a pizza for every mood. Perfect for dine-in, takeaway, private events, corporate catering, and mobile pizza experiences. 🍕",
      stat1_kicker: 'Dual Style',
      stat1_label: 'Neapolitan & New York',
      stat1_desc: 'Baked at extreme heat to achieve the signature leopard-spotted crust or crisp foldable slice.',
      stat2_kicker: 'Late Hours',
      stat2_label: 'Continuous Service',
      stat2_desc: 'Built for easy daytime lunch stops, cozy dinners, and late-night pizza runs in Újpest.',
      stat3_kicker: 'Fresh First',
      stat3_label: 'Premium Import Quality',
      stat3_desc: 'San Marzano tomatoes, premium cheeses, and toppings chosen for authentic flavor instead of filler.',
      order_title: 'Taste Pizza Colombia',
      order_subtitle: 'Browse our digital menu or order delivery directly below!',
      wheel_title: '🍕 Dine-In Spin & Win!',
      wheel_desc: 'Available for Eat-In only! Spin the wheel, take a screenshot of your win, post & tag us on Facebook, Instagram, or TikTok to receive a special Surprise Pack on your next visit! 🎁',
      prize_10: '🍕 10% Off Bill',
      tag_rare: 'Rare',
      prize_drink: '🥤 Free Drink',
      tag_common: 'Common',
      prize_real: '🎡 Real-Life Spin',
      tag_lucky: 'Lucky',
      prize_5: '🍕 5% Off Bill',
      wheel_hint: 'Click SPIN in the center of the pizza to test your luck!',
      wheel_spin_btn: 'SPIN',
      result_celebration_win: '🎉 DINE-IN WINNER! 🎉',
      wheel_terms: 'Valid for eat-in only. Limit one spin per day. Tag must be active.',
      order_wolt: 'Order on Wolt',
      order_foodora: 'Order on Foodora',
      order_btn: 'Explore Digital Menu',
      reviews_header: 'What Our Guests Say',
      review1_title: 'Local Guide • 18 reviews',
      review1_text: '"Best Neapolitan pizza in Újpest! The leopard-spotted crust is light, airy, and baked to perfection in their deck oven. Highly recommend the Margherita with extra buffalo mozzarella."',
      review2_title: 'Recommends Pizza Colombia',
      review2_text: '"Great vibes on the terrace and the pizzas are top tier. We got a half-and-half New York style crust which was crispy and foldable. Very friendly staff and fast delivery."',
      review3_title: 'Budapest Foodie',
      review3_text: '"Literally obsessed with their Nutella dough balls (Nutella Golyó) and their White Base pizzas! Truly authentic Italian taste in Budapest. 10/10 local spot!"',
      info_title: 'Visit Our Pizzeria',
      info_address: 'Address:',
      info_phone: 'Phone:',
      info_hours: 'Opening Hours:',
      footer_rights: '&copy; 2026 Pizza Colombia Újpest. All rights reserved.',
      modal_title: 'Pizza Colombia Menu',
      tab_red: 'Tomato Base Pizzas',
      tab_white: 'Sour Cream Base Pizzas',
      tab_calzones: 'Calzones & Breads',
      tab_pastas: 'Pastas & Desserts',
      tab_extras: 'Extras & Drinks',
      customize_toppings: '🍕 Customize with Extra Toppings',
      cart_subtotal_label: 'Subtotal:',
      cart_delivery_label: 'Delivery Fee:',
      cart_total_label: 'Total:',
      btn_success_close: 'Done / Order Again',
      verification_title: 'Awaiting Chef Confirmation',
      verification_instruction: 'We are matching your WhatsApp order details with your SumUp payment. Once the kitchen confirms your payment, click the confirmation button below.',
      verification_warning: '⚠️ If payment is not confirmed, your order will NOT be prepared.',
      verification_timer_label: 'Estimated Verification Time',
      verification_pulse_text: 'Waiting for kitchen response...',
      btn_chef_confirmed: 'Kitchen Has Confirmed ✅',
      btn_verification_whatsapp: '💬 Contact Chef on WhatsApp',
      btn_verification_call: '📞 Call Kitchen (+36 70 884 6991)',
      btn_verification_cancel: 'Cancel / Go Back',
      form_title: 'Delivery Details',
      form_name_label: 'Full Name *',
      form_phone_label: 'Phone Number *',
      form_type_label: 'Order Option *',
      form_pickup_toggle: '🚶 Pickup',
      form_delivery_toggle: '🚗 Delivery',
      form_address_label: 'Delivery Address (Street, Number) *',
      form_floor_label: 'Floor',
      form_door_label: 'Door',
      form_doorbell_label: 'Doorbell',
      form_notes_label: 'Notes for Courier',
      review_title: 'Order Summary',
      review_details_title: 'Customer Details',
      review_name_label: 'Name:',
      review_phone_label: 'Phone:',
      review_method_label: 'Method:',
      review_address_label: 'Address:',
      review_notes_label: 'Notes:',
      payment_pending_title: 'Payment Pending',
      payment_pending_instruction: 'We have opened the secure SumUp payment portal in a new tab. Please pay exactly',
      payment_pending_warning: '⚠️ IMPORTANT: If your payment is not confirmed in our system, your order will NOT be prepared.',
      btn_payment_done: 'Done / I Have Paid',
      btn_payment_cancel: 'Cancel / Go Back',
      success_title: 'Order Submitted!',
      success_instruction: 'We have received your order details. Your pizza will be prepared as soon as your payment is verified! 🍕',
      success_warning: '⚠️ NOTE: If payment is not confirmed on SumUp, your order will NOT be prepared.',
      success_total_label: 'Total Amount:',
      btn_copy_amount: '📋 Copy Amount',
      placeholder_name: 'John Doe',
      placeholder_phone: '+36 70 123 4567',
      placeholder_address: 'e.g. Megyeri út 205/D',
      placeholder_floor: 'e.g. 3rd',
      placeholder_door: 'e.g. 12',
      placeholder_doorbell: 'e.g. Kiss / 45',
      placeholder_notes: 'e.g. Ring code 45, lift is broken'
    },
    hu: {
      nav_home: 'Kezdőlap',
      nav_oven: 'Kemence',
      nav_ingredients: 'Összetevők',
      nav_styles: 'Stílusok',
      nav_stats: 'Statisztika',
      nav_order: 'Rendelés',
      nav_order_mobile: 'Rendelés Online',
      hero_title: 'A Pizza Colombia friss nápolyi és New York-i stílusú pizzákat kínál Újpesten.',
      hero_subtitle: 'Tekintse meg étlapunkat, kísérje figyelemmel eseményeinket, és tájékozódjon a legfontosabb információkról egy helyen.',
      hero_btn: 'Étlap és rendelés',
      showcase1_title: 'Eredeti nápolyi pizza catering és pizzéria élmény',
      showcase1_subtitle: 'Tapasztalja meg az eredeti nápolyi pizzát, legyen szó akár rendezvényéről, akár pizzériánkról.',
      card1_title: '🔥 Mobil gázkemencék külső cateringhez',
      card1_text: 'Céges rendezvényekre, privát összejövetelekre, születésnapokra, esküvőkre és fesztiválokra professzionális, mobil gázüzemű kemencéinket közvetlenül a helyszínre szállítjuk. A 450°C-ig terjedő sütési hőmérsékletnek köszönhetően a helyszínen nyújtjuk és sütjük ki a nápolyi pizzákat akár 90 másodperc alatt, felejthetetlen gasztronómiai látványélményt nyújtva a vendégeknek.',
      badge_corporate: 'Céges catering',
      badge_private: 'Magánrendezvények',
      badge_birthday: 'Születésnapi bulik',
      badge_weddings: 'Esküvők',
      badge_teambuilding: 'Csapatépítő események',
      badge_festivals: 'Fesztiválok és találkozók',
      card2_title: '⚡ Kézműves elektromos kemence a pizzériában',
      card2_text: 'A Pizza Colombiában az elektromos kemence jelenti a konyhánk szívét. A körülbelül 450°C-on (840°F) történő sütés precíz és egyenletes hőt biztosít a samott lapon, így minden alkalommal garantálja a jellegzetes párductarkás szélű, levegős peremű és tökéletesen átsült nápolyi pizzát.',
      badge_dining: 'Helyben fogyasztás',
      badge_excellence: 'Prémium minőség',
      badge_takeaway: 'Elviteles szolgáltatás',
      badge_consistent: 'Egyenletes sütés',
      badge_crust: 'Párductarkás perem',
      feature1: 'Eredeti nápolyi pizza',
      feature2: 'Mobil gázkemencék rendezvényekre',
      feature3: 'Elektromos kemence a pizzériában',
      feature4: 'Frissen, a vendégek előtt készítve',
      feature5: 'Személyre szabott catering csomagok',
      catering_outro: 'Klasszikus és gourmet pizzák széles választékát kínáljuk, vegetáriánus, vegán és húsos opciókkal egyaránt. A szűk családi körben tartott eseményektől a nagyszabású rendezvényekig, elhozzuk Nápoly igazi ízeit minden alkalomra.',
      tagline: 'Friss. Eredeti. Szenvedéllyel sütve.',
      showcase2_title: 'Friss és prémium alapanyagok',
      showcase2_subheading: 'A kivételes pizza a kivételes alapanyagokkal kezdődik.',
      showcase2_text1: 'Kizárólag gondosan válogatott, kiváló minőségű alapanyagokat használunk, kezdve a <strong>San Marzano paradicsommal</strong>, amely természetesen édes és kiegyensúlyozott szószt eredményez.',
      showcase2_text2: 'Minden pizzát <strong>prémium mozzarellával</strong> (a kemence típusának megfelelően optimalizálva), friss bazsalikommal és extra szűz olívaolajjal koronázunk meg, amit lehetőség szerint helyi termelők árui és minőségi import olasz alapanyagok egészítenek ki.',
      showcase2_text3: 'Az eredmény egyszerű, őszinte étel, amely Nápoly autentikus ízeit ünnepli – friss, életteli és minden falatban odaadással elkészített.',
      showcase3_title: 'Nápoly találkozása New York-al',
      showcase3_subheading: 'Miért választana egyet, ha mindkettőt élvezheti?',
      showcase3_text1: 'Tapasztalja meg a két legnagyobb pizzahagyomány legjavát.',
      comparison_neapolitan_title: '🍕 Nápolyi Stílus',
      comparison_neapolitan_desc: 'Kézzel készített nápolyi pizzáinkat könnyű, levegős kovászos tészta jellemzi, puha, omlós középpel és gyönyörűen megpirult peremmel, magas hőmérsékleten sütve az autentikus íz és textúra érdekében.',
      comparison_newyork_title: '🗽 New York Stílus',
      comparison_newyork_desc: 'Valami ropogósabbat szeretne? New York-i stílusú pizzáink vékony, hajtogatható tésztát kínálnak a ropogósság és a lágyság tökéletes egyensúlyával, bőséges feltéttel, aranybarnára sütve.',
      showcase3_text2: 'Akár a nápolyi kézműves eleganciára, akár a New York-i merész, laktató falatokra vágyik, nálunk minden hangulathoz megtalálja a tökéletes pizzát. Ideális helyben fogyasztásra, elvitelre, magánrendezvényekre, céges cateringre és mobil pizzakemence szolgáltatásokhoz. 🍕',
      stat1_kicker: 'Két stílus',
      stat1_label: 'Nápolyi és New York',
      stat1_desc: 'Extrém magas hőmérsékleten sütve a jellegzetes párductarkás szél vagy a ropogós, hajtogatható szelet eléréséhez.',
      stat2_kicker: 'Késői nyitvatartás',
      stat2_label: 'Folyamatos kiszolgálás',
      stat2_desc: 'Könnyű nappali ebédekhez, hangulatos vacsorákhoz és késő esti pizzázásokhoz tervezve Újpesten.',
      stat3_kicker: 'Első a frissesség',
      stat3_label: 'Prémium import minőség',
      stat3_desc: 'San Marzano paradicsom, prémium sajtok és válogatott feltétek az autentikus ízvilágért az olcsó helyettesítők helyett.',
      order_title: 'Kóstolja meg a Pizza Colombiát',
      order_subtitle: 'Böngésszen digitális étlapunkon vagy rendeljen házhoz szállítást közvetlenül alább!',
      wheel_title: '🍕 Pörgess és Nyerj Helyben!',
      wheel_desc: 'Kizárólag helyben fogyasztás esetén! Pörgesd meg a kereket, készíts képernyőképet a nyereményről, posztolj és jelölj meg minket Facebookon, Instagramon vagy TikTokon, hogy különleges Meglepetés Csomagot kapj a következő látogatásodkor! 🎁',
      prize_10: '🍕 10% Kedvezmény',
      tag_rare: 'Ritka',
      prize_drink: '🥤 Ingyen Ital',
      tag_common: 'Gyakori',
      prize_real: '🎡 Valódi Pörgetés',
      tag_lucky: 'Szerencsés',
      prize_5: '🍕 5% Kedvezmény',
      wheel_hint: 'Kattints a PÖRGETÉS gombra a pizza közepén, hogy próbára tedd a szerencsédet!',
      wheel_spin_btn: 'PÖRGETÉS',
      result_celebration_win: '🎉 HELYBEN FOGYASZTÁS NYERTES! 🎉',
      wheel_terms: 'Helyben fogyasztás esetén érvényes. Napi egy pörgetés megengedett. A megjelölésnek aktívnak kell lennie.',
      order_wolt: 'Rendelés Wolton',
      order_foodora: 'Rendelés Foodorán',
      order_btn: 'Digitális Étlap Felfedezése',
      reviews_header: 'Mit mondanak vendégeink',
      review1_title: 'Helyi kalauz • 18 értékelés',
      review1_text: '"A legjobb nápolyi pizza Újpesten! A párductarkás szél könnyű, levegős és tökéletesre sült a kemencéjükben. Nagyon ajánlom a Margheritát extra bivalymozzarellával."',
      review2_title: 'Ajánlja a Pizza Colombiát',
      review2_text: '"Szuper hangulat a teraszon, és a pizzák is kiválóak. Felesben kértünk New York-i stílusú pizzát, ami ropogós és jól hajtogatható volt. Nagyon barátságos személyzet és gyors szállítás."',
      review3_title: 'Budapesti gasztro-rajongó',
      review3_text: '"Komolyan függője lettem a Nutellás golyójuknak (Nutella Golyó) és a tejfölös alapú pizzáiknak! Igazi autentikus olasz ízek Budapesten. 10/10-es hely!"',
      info_title: 'Látogasson el hozzánk',
      info_address: 'Cím:',
      info_phone: 'Telefon:',
      info_hours: 'Nyitvatartás:',
      footer_rights: '&copy; 2026 Pizza Colombia Újpest. Minden jog fenntartva.',
      modal_title: 'Pizza Colombia Étlap',
      tab_red: 'Paradicsomos alapú pizzák',
      tab_white: 'Tejfölös alapú pizzák',
      tab_calzones: 'Calzone & Kenyerek',
      tab_pastas: 'Tészták & Desszertek',
      tab_extras: 'Extrák & Italok',
      customize_toppings: '🍕 Testreszabás extra feltétekkel',
      cart_subtotal_label: 'Részösszeg:',
      cart_delivery_label: 'Szállítási díj:',
      cart_total_label: 'Összesen:',
      btn_success_close: 'Kész / Új rendelés',
      verification_title: 'Várakozás a szakács jóváhagyására',
      verification_instruction: 'Összevetjük a WhatsApp rendelési adatait a SumUp fizetéssel. Amint a konyha megerősíti a fizetést, kattintson az alábbi megerősítő gombra.',
      verification_warning: '⚠️ Ha a fizetés nincs megerősítve, a rendelés NEM kerül elkészítésre.',
      verification_timer_label: 'Becsült ellenőrzési idő',
      verification_pulse_text: 'Várakozás a konyha válaszára...',
      btn_chef_confirmed: 'A konyha megerősítette ✅',
      btn_verification_whatsapp: '💬 Kapcsolatfelvétel WhatsApp-on',
      btn_verification_call: '📞 Konyha felhívása (+36 70 884 6991)',
      btn_verification_cancel: 'Mégse / Vissza',
      form_title: 'Szállítási adatok',
      form_name_label: 'Teljes név *',
      form_phone_label: 'Telefonszám *',
      form_type_label: 'Átvétel módja *',
      form_pickup_toggle: '🚶 Átvétel',
      form_delivery_toggle: '🚗 Kiszállítás',
      form_address_label: 'Szállítási cím (Utca, Házszám) *',
      form_floor_label: 'Emelet',
      form_door_label: 'Ajtó',
      form_doorbell_label: 'Kapucsengő',
      form_notes_label: 'Megjegyzés a futárnak',
      review_title: 'Rendelés áttekintése',
      review_details_title: 'Vevő adatai',
      review_name_label: 'Név:',
      review_phone_label: 'Telefon:',
      review_method_label: 'Átvétel:',
      review_address_label: 'Cím:',
      review_notes_label: 'Megjegyzés:',
      payment_pending_title: 'Kifizetésre vár',
      payment_pending_instruction: 'Megnyitottuk a biztonságos SumUp fizetési felületet egy új lapon. Kérjük, fizessen ki pontosan',
      payment_pending_warning: '⚠️ FONTOS: Ha a fizetés nincs megerősítve a rendszerünkben, a rendelés NEM kerül elkészítésre.',
      btn_payment_done: 'Kész / Befizettem',
      btn_payment_cancel: 'Mégse / Vissza',
      success_title: 'Rendelés beküldve!',
      success_instruction: 'Megkaptuk a rendelési adatait. A pizzája elkészítését azonnal megkezdjük, amint a fizetés megerősítésre kerül! 🍕',
      success_warning: '⚠️ MEGJEGYZÉS: Ha a fizetés nincs megerősítve a SumUp-on, a rendelés NEM kerül elkészítésre.',
      success_total_label: 'Fizetendő végösszeg:',
      btn_copy_amount: '📋 Összeg másolása',
      placeholder_name: 'Minta János',
      placeholder_phone: '+36 70 123 4567',
      placeholder_address: 'pl. Megyeri út 205/D',
      placeholder_floor: 'pl. 3. emelet',
      placeholder_door: 'pl. 12',
      placeholder_doorbell: 'pl. Kiss / 45',
      placeholder_notes: 'pl. Kapucsengő kód 45, a lift nem működik'
    }
  };

  const menuTranslations = {
    hu: {
      'Margherita Pizza': { name: 'Margherita Pizza', desc: 'Paradicsom alap, mozzarella, friss bazsalikom.' },
      'Marinara Pizza': { name: 'Marinara Pizza', desc: 'Paradicsom alap, fokhagyma, oregánó.' },
      'Diablo Pizza': { name: 'Diablo Pizza', desc: 'Paradicsom alap, mozzarella, szalámi, bacon, erős paprika.' },
      'Ham Pizza / Sonkás Pizza': { name: 'Ham Pizza / Sonkás Pizza', desc: 'Paradicsom alap, mozzarella, sonka.' },
      'Songoku Pizza': { name: 'Songoku Pizza', desc: 'Paradicsom alap, mozzarella, sonka, gomba, kukorica.' },
      'Hawaii Pizza': { name: 'Hawaii Pizza', desc: 'Paradicsom alap, mozzarella, sonka, kukorica, ananász.' },
      'Four Cheese / Négy Sajtos': { name: 'Four Cheese / Négy Sajtos', desc: 'Paradicsom alap, mozzarella, márványsajt, füstölt sajt, parmezán.' },
      'Salami Pizza': { name: 'Salami Pizza', desc: 'Paradicsom alap, mozzarella, csemege szalámi, lilahagyma.' },
      'Grilled Chicken Supreme': { name: 'Grilled Chicken Supreme', desc: 'Paradicsom alap, mozzarella, csirke, lilahagyma, gomba.' },
      'Magyaros / Made in Hungary': { name: 'Magyaros / Made in Hungary', desc: 'Paradicsom alap, mozzarella, sonka, szalámi, bacon, lilahagyma, erős paprika.' },
      'Tuna Pizza': { name: 'Tuna Pizza', desc: 'Paradicsom alap, mozzarella, tonhal, lilahagyma, olívabogyó / csemegeuborka.' },
      'Húsímádó / Meaty One': { name: 'Húsímádó / Meaty One', desc: 'Paradicsom alap, mozzarella, sonka, szalámi, bacon, sült kolbász / csirke, lilahagyma.' },
      'Mexico Pizza': { name: 'Mexico Pizza', desc: 'Paradicsom alap, mozzarella, bacon, vörösbab, kukorica, erős paprika.' },
      'Garlic Sourcream Pizza': { name: 'Garlic Sourcream Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, sonka, szalámi, lilahagyma.' },
      'Asterix Pizza': { name: 'Asterix Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, sonka, bacon, kukorica.' },
      'Colombia Pizza': { name: 'Colombia Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, bacon, füstölt sajt, erős paprika.' },
      'Tatra Pizza': { name: 'Tatra Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, sonka, márványsajt, parmezán.' },
      'Gyros Pizza': { name: 'Gyros Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, csirke, lilahagyma, csemegeuborka, paradicsom.' },
      'Colombia Greek Pizza': { name: 'Colombia Greek Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, sonka, spenót, ricotta, lilahagyma.' },
      'Megyeri Pizza': { name: 'Megyeri Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, sonka, gomba.' },
      'Bacon Pizza': { name: 'Bacon Pizza', desc: 'Fokhagymás-tejfölös alap, mozzarella, bacon, gomba, füstölt sajt.' },
      'Garlic Bread': { name: 'Fokhagymás kenyér', desc: 'Fokhagymás olaj, oregánó.' },
      'Cheesy Garlic Bread': { name: 'Sajtos fokhagymás kenyér', desc: 'Fokhagymás olaj, oregánó, mozzarella.' },
      'Spicy Cheese Garlic Bread': { name: 'Csípős sajtos fokhagymás kenyér', desc: 'Fokhagymás olaj, oregánó, mozzarella, chili.' },
      'Signature Calzones (32cm)': { name: 'Különleges Calzone (32cm)', desc: 'Bármelyik pizza kérhető friss, hajtogatott Calzoneként.' },
      'Arrabiata Sauce Pasta': { name: 'Arrabiata tészta', desc: 'Tészta csípős paradicsomszósszal, fokhagymával, chilivel és olívaolajjal.' },
      'Marinara Sauce Pasta': { name: 'Marinara tészta', desc: 'Egyszerű és friss paradicsomszósz fokhagymával, zöldfűszerekkel és olívaolajjal.' },
      'Alfredo Cream Sauce Pasta': { name: 'Alfredo tészta', desc: 'Krémes és gazdag szósz vajjal, tejszínnel és parmezánnal.' },
      'Four Cheese Sauce Pasta': { name: 'Négysajtos tészta', desc: 'Krémes sajtos szósz négyféle sajtból a gazdag ízért.' },
      'Carbonara': { name: 'Carbonara', desc: 'Klasszikus krémes tészta parmezánnal és ropogós baconnel.' },
      'Basil Pesto Sauce Pasta': { name: 'Bazsalikom pestos tészta', desc: 'Tészta illatos bazsalikom pestoval, fokhagymával, parmezánnal és olívaolajjal.' },
      'Aglio e Olio': { name: 'Aglio e Olio', desc: 'Tészta fokhagymával, olívaolajjal és egy csipet chilivel az egyszerű és klasszikus ízért.' },
      'Cheesecake Slice': { name: 'Sajttorta szelet', desc: 'Krémes, New York-i stílusú sajttorta szelet.' },
      'Nutella Golyó (8 db)': { name: 'Nutella Golyó (8 db)', desc: 'Meleg tésztagolyók prémium Nutellával töltve.' },
      'Churros': { name: 'Churros', desc: 'Sült tésztarudak fahéjas cukorba forgatva.' },
      'Garlic Sourcream Dip': { name: 'Fokhagymás tejfölös mártogatós', desc: 'Házi fokhagymás tejfölös mártogatós szósz, tökéletes a szélek mártogatásához.' },
      'Spicy Chili Dip': { name: 'Csípős chilis mártogatós', desc: 'Csípős chilis paradicsomszósz mártogatós a pikáns ízek kedvelőinek.' },
      'BBQ Dip': { name: 'BBQ mártogatós', desc: 'Édes és füstös barbecue mártogatós szósz.' },
      'Coca-Cola (0.33l)': { name: 'Coca-Cola (0.33l)', desc: 'Klasszikus, jéghideg frissítő üdítőital.' },
      'Coca-Cola Zero (0.33l)': { name: 'Coca-Cola Zero (0.33l)', desc: 'Klasszikus Coca-Cola íz cukor nélkül.' },
      'Fanta Orange (0.33l)': { name: 'Fanta Orange (0.33l)', desc: 'Édes és buborékos narancsos üdítőital.' },
      'Mineral Water (0.5l)': { name: 'Ásványvíz (0.5l)', desc: 'Szénsavmentes természetes ásványvíz.' }
    }
  };

  const toppingTranslations = {
    'Chicken': 'Csirke',
    'Bacon': 'Bacon',
    'Tuna': 'Tonhal',
    'Mushrooms': 'Gomba',
    'Mozzarella': 'Mozzarella',
    'Olives': 'Olívabogyó',
    'Artichokes': 'Articsóka',
    'Parmesan': 'Parmezán',
    'Chilli': 'Chili'
  };

  const dayNameTranslations = {
    hu: {
      'Monday': 'Hétfő',
      'Tuesday': 'Kedd',
      'Wednesday': 'Szerda',
      'Thursday': 'Csütörtök',
      'Friday': 'Péntek',
      'Saturday': 'Szombat',
      'Sunday': 'Vasárnap'
    },
    en: {
      'Monday': 'Monday',
      'Tuesday': 'Tuesday',
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday',
      'Saturday': 'Saturday',
      'Sunday': 'Sunday'
    }
  };

  const wheelTranslations = {
    en: {
      '5% Off Bill': { text: '5% Off Bill', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
      'Free Drink': { text: 'Free Drink', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
      'Try Again': { text: 'Try Again', desc: 'No luck this time! Spin again tomorrow.' },
      '10% Off Bill': { text: '10% Off Bill', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' },
      'Real Spin': { text: 'Real Spin', desc: 'You won a Real-Life Spin at our pizzeria! Take a screenshot now, post & tag us on Facebook/Instagram, and show this screen to our staff when dining in to spin our physical wheel for a surprise reward! 🎡' },
      'Free Nutella': { text: 'Free Nutella', desc: 'Take a screenshot of this win now! Post it on your stories, tag @pizzacolombiaujpest, and show it to our staff when dining in to claim your Surprise Pack.' }
    },
    hu: {
      '5% Off Bill': { text: '5% Kedvezmény', desc: 'Készíts képernyőképet a nyereményről most! Oszd meg történetedben, jelöld be a @pizzacolombiaujpest fiókot, és mutasd meg munkatársainknak helyben, hogy átvedd a meglepetés csomagodat.' },
      'Free Drink': { text: 'Ingyen Ital', desc: 'Készíts képernyőképet a nyereményről most! Oszd meg történetedben, jelöld be a @pizzacolombiaujpest fiókot, és mutasd meg munkatársainknak helyben, hogy átvedd a meglepetés csomagodat.' },
      'Try Again': { text: 'Próbáld újra', desc: 'Sajnos most nem sikerült! Pörgess újra holnap.' },
      '10% Off Bill': { text: '10% Kedvezmény', desc: 'Készíts képernyőképet a nyereményről most! Oszd meg történetedben, jelöld be a @pizzacolombiaujpest fiókot, és mutasd meg munkatársainknak helyben, hogy átvedd a meglepetés csomagodat.' },
      'Real Spin': { text: 'Valódi pörgetés', desc: 'Nyertél egy valódi pörgetést a pizzériánkban! Készíts képernyőképet, oszd meg és jelölj meg minket Facebookon/Instagramon, majd mutasd meg a helyszínen, hogy megpörgethesd a fizikai szerencsekerekünket egy meglepetés ajándékért! 🎡' },
      'Free Nutella': { text: 'Ingyen Nutella', desc: 'Készíts képernyőképet a nyereményről most! Oszd meg történetedben, jelöld be a @pizzacolombiaujpest fiókot, és mutasd meg munkatársainknak helyben, hogy átvedd a meglepetés csomagodat.' }
    }
  };

  const updateLanguageUI = () => {
    // 1. Static elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (uiTranslations[currentLang] && uiTranslations[currentLang][key]) {
        el.innerHTML = uiTranslations[currentLang][key];
      }
    });

    // 2. Input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (uiTranslations[currentLang] && uiTranslations[currentLang][key]) {
        el.placeholder = uiTranslations[currentLang][key];
      }
    });

    // 3. Flags and label toggler updates
    document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
      const flagEl = btn.querySelector('.flag-icon');
      const labelEl = btn.querySelector('.lang-label');
      if (currentLang === 'hu') {
        if (flagEl) flagEl.innerText = '🇭🇺';
        if (labelEl) labelEl.innerText = 'HU';
      } else {
        if (flagEl) flagEl.innerText = '🇬🇧';
        if (labelEl) labelEl.innerText = 'EN';
      }
    });

    // 4. Translate menu items drawn inside the modal
    document.querySelectorAll('.menu-item').forEach(item => {
      const nameEl = item.querySelector('.menu-item-name');
      const descEl = item.querySelector('.menu-item-desc');
      if (nameEl) {
        if (!item.hasAttribute('data-en-name')) {
          item.setAttribute('data-en-name', nameEl.innerText.trim());
        }
        const enName = item.getAttribute('data-en-name');
        if (currentLang === 'hu' && menuTranslations.hu[enName]) {
          nameEl.innerText = menuTranslations.hu[enName].name;
        } else {
          nameEl.innerText = enName;
        }
        
        // Translate the "Add to Cart 🛒" button text
        const btnSpan = item.querySelector('.btn-add-to-cart span');
        if (btnSpan) {
          btnSpan.innerText = currentLang === 'hu' ? 'Kosárba 🛒' : 'Add to Cart 🛒';
        }
      }
      if (descEl) {
        if (!item.hasAttribute('data-en-desc')) {
          item.setAttribute('data-en-desc', descEl.innerText.trim());
        }
        const enDesc = item.getAttribute('data-en-desc');
        const enName = item.getAttribute('data-en-name');
        if (currentLang === 'hu' && menuTranslations.hu[enName]) {
          descEl.innerText = menuTranslations.hu[enName].desc;
        } else {
          descEl.innerText = enDesc;
        }
      }
    });

    // 5. Translate day rows in opening hours
    document.querySelectorAll('.hours-list p').forEach(row => {
      const day = row.getAttribute('data-day');
      if (day) {
        const spanDay = row.querySelector('span:first-child');
        if (spanDay && dayNameTranslations[currentLang] && dayNameTranslations[currentLang][day]) {
          spanDay.innerText = dayNameTranslations[currentLang][day];
        }
      }
    });

    // Translate dynamic status badge
    updatePizzeriaStatus();

    // Redraw wheel canvas with correct language
    if (typeof drawWheel === 'function') {
      drawWheel();
    }
  };

  // Bind language switcher buttons
  document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentLang = currentLang === 'en' ? 'hu' : 'en';
      localStorage.setItem('pizza_lang', currentLang);
      updateLanguageUI();
    });
  });

  // Run on page load
  initAddToCartButtons();
  initToppingBadges();
  
  // Bind copy buttons
  bindCopyAmountButton('btn-copy-payment-amount', 'pending-total-amount');
  bindCopyAmountButton('btn-copy-success-amount', 'success-total-amount');

  // Trigger initial language translation rendering
  updateLanguageUI();

  // Load menu
  loadDynamicMenu().then(() => {
    // Re-run after dynamic loading is complete
    initAddToCartButtons();
    initToppingBadges();
    bindCopyAmountButton('btn-copy-payment-amount', 'pending-total-amount');
    bindCopyAmountButton('btn-copy-success-amount', 'success-total-amount');
    updateLanguageUI();
  });

});
