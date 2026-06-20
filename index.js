/* -------------------------------------------------------------------------
   Pizza Colombia Újpest - Interactive Script
   ------------------------------------------------------------------------- */

// Global Configuration
const CONFIG = {
  // To load from a Google Sheet, publish your sheet as CSV, copy the link, and paste it here.
  // Example: 'https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv'
  // Set to 'menu.csv' to load from the local fallback spreadsheet in the project folder.
  // Set to null to use the static fallback menu defined in index.html.
  menuSpreadsheetUrl: 'menu.csv'
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
          statusBadge.innerText = 'Open Now';
          statusBadge.className = 'status-badge open';
        } else {
          statusBadge.innerText = 'Closed';
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
      statusBadge.innerText = 'Visit Us';
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
      ctx.fillText(prize.text, radius - 35, 0);
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
    btnSpinWheel.innerText = 'SPUN';

    statusArea.classList.add('hidden');
    resultCard.classList.remove('hidden');

    if (prize.code) {
      resultCard.querySelector('.result-celebration').innerText = '🎉 DINE-IN WINNER! 🎉';
      prizeTitle.innerText = `You won: ${prize.text}!`;
      prizeDesc.innerText = prize.desc;
      promoCodeText.innerText = prize.code;
      resultCard.querySelector('.promo-code-container').classList.remove('hidden');
      
      if (!alreadySpun) {
        startConfetti();
      }
    } else {
      resultCard.querySelector('.result-celebration').innerText = '😢 BETTER LUCK NEXT TIME! 😢';
      prizeTitle.innerText = `Try Again!`;
      prizeDesc.innerText = prize.desc;
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

  // Load menu
  loadDynamicMenu();

});
