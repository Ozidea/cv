document.documentElement.classList.add("js");

/* ============================================================
   THEME
   ============================================================ */

const THEME_STORAGE_KEY = "theme";
const themeToggleButton = document.getElementById("theme-toggle");
const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
  } catch (_error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_error) {}
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  if (themeToggleButton) {
    themeToggleButton.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
  }
}

function getPreferredTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) return storedTheme;
  const alreadyApplied = document.documentElement.getAttribute("data-theme");
  if (alreadyApplied === "dark" || alreadyApplied === "light") return alreadyApplied;
  return themeMediaQuery.matches ? "dark" : "light";
}

function initTheme() {
  applyTheme(getPreferredTheme());

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  const handleSystemChange = (event) => {
    if (getStoredTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof themeMediaQuery.addEventListener === "function") {
    themeMediaQuery.addEventListener("change", handleSystemChange);
  } else if (typeof themeMediaQuery.addListener === "function") {
    themeMediaQuery.addListener(handleSystemChange);
  }
}

initTheme();

/* ============================================================
   CURSOR GLOW
   ============================================================ */

const cursorGlow = document.querySelector(".cursor-glow");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (cursorGlow && !reduceMotion) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let rafId = null;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    glowX += (mouseX - glowX) * 0.07;
    glowY += (mouseY - glowY) * 0.07;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top  = `${glowY}px`;
    rafId = requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/* ============================================================
   SCROLL STATE & PROGRESS
   ============================================================ */

const progressBar = document.querySelector(".scroll-progress span");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".topnav a");
const sections = [...document.querySelectorAll("main section[id]")];
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];

function updateScrollState() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  progressBar.style.transform = `scaleX(${progress})`;

  let currentSection = sections[0]?.id || "";
  sections.forEach((section) => {
    const bounds = section.getBoundingClientRect();
    if (bounds.top <= window.innerHeight * 0.3 && bounds.bottom >= 120) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
  });
}

let ticking = false;
function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => { updateScrollState(); ticking = false; });
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */

if (!reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: "0px 0px -6% 0px" }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ============================================================
   TAB BAR WITH ANIMATED INDICATOR
   ============================================================ */

function createTabIndicator() {
  const tabbar = document.querySelector(".tabbar");
  if (!tabbar) return null;

  const indicator = document.createElement("div");
  indicator.className = "tab-indicator";
  indicator.setAttribute("aria-hidden", "true");
  tabbar.insertBefore(indicator, tabbar.firstChild);
  return indicator;
}

const tabIndicator = createTabIndicator();

function positionIndicator(activeButton) {
  if (!tabIndicator || !activeButton) return;
  const tabbar = activeButton.closest(".tabbar");
  const tabbarRect = tabbar.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  // Account for horizontal scroll (mobile scrollable tabbar)
  const left = buttonRect.left - tabbarRect.left + tabbar.scrollLeft;
  tabIndicator.style.width = `${buttonRect.width}px`;
  tabIndicator.style.left  = `${left}px`;
}

/* ============================================================
   STAGGER ANIMATION ON TAB SWITCH
   ============================================================ */

function triggerStagger(panel) {
  if (reduceMotion) return;
  const cards = panel.querySelectorAll(
    ".panel-card, .timeline-card, .certificate-card, .app-card, .app-overview"
  );
  cards.forEach((card) => {
    card.classList.remove("stagger-card");
    void card.offsetWidth;
    card.classList.add("stagger-card");
  });
}

/* ============================================================
   TAB ACTIVATION
   ============================================================ */

function activateTab(targetId, fromClick = false) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    if (isActive) {
      positionIndicator(button);
      // Scroll active tab into view within horizontal tabbar (mobile)
      const tabbar = button.closest(".tabbar");
      if (tabbar && tabbar.scrollWidth > tabbar.clientWidth) {
        const btnCenter = button.offsetLeft + button.offsetWidth / 2;
        tabbar.scrollTo({ left: btnCenter - tabbar.offsetWidth / 2, behavior: "smooth" });
        // Re-sync indicator after scroll settles
        setTimeout(() => positionIndicator(button), 320);
      }
    }
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === targetId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
    if (isActive && fromClick) triggerStagger(panel);
  });
}

tabButtons.forEach((button, index) => {
  button.addEventListener("click", () => activateTab(button.dataset.target, true));

  button.addEventListener("keydown", (event) => {
    const directionMap = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
    if (!(event.key in directionMap)) return;
    event.preventDefault();
    const nextIndex = (index + directionMap[event.key] + tabButtons.length) % tabButtons.length;
    const nextButton = tabButtons[nextIndex];
    nextButton.focus();
    activateTab(nextButton.dataset.target, true);
  });
});

/* ============================================================
   CARD TILT EFFECT
   ============================================================ */

function initCardTilt() {
  // Skip on touch-only devices (phones/tablets) and reduced motion
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

  const tiltTargets = document.querySelectorAll(
    ".panel-card, .timeline-card, .mini-card-social, .certificate-card, .app-card"
  );

  tiltTargets.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -3.5;
      const ry = ((x - cx) / cx) *  3.5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

initCardTilt();

/* ============================================================
   INIT
   ============================================================ */

activateTab("general");
updateScrollState();

// Position indicator after layout settles
requestAnimationFrame(() => {
  const activeBtn = document.querySelector(".tab-button.is-active");
  positionIndicator(activeBtn);
});

window.addEventListener("resize", () => {
  const activeBtn = document.querySelector(".tab-button.is-active");
  positionIndicator(activeBtn);
});

// Re-position indicator when individual button sizes change (language switch changes text length)
if (typeof ResizeObserver !== "undefined") {
  const btnObserver = new ResizeObserver(() => {
    const activeBtn = document.querySelector(".tab-button.is-active");
    positionIndicator(activeBtn);
  });
  tabButtons.forEach((btn) => btnObserver.observe(btn));
}

/* ============================================================
   APP CAROUSEL
   ============================================================ */

const appTrack      = document.getElementById("app-carousel-track");
const appPrevBtn    = document.getElementById("app-prev-btn");
const appNextBtn    = document.getElementById("app-next-btn");
const appCarouselTitle = document.getElementById("app-carousel-title");
const appDots       = document.querySelectorAll("#app-carousel-dots .carousel-dot");

if (appTrack && appPrevBtn && appNextBtn) {
  let currentAppSlide = 0;
  const appSlideKeys = ["apps_title", "apps_web_kicker"];

  function updateAppCarousel() {
    appTrack.style.transform = `translateX(-${currentAppSlide * 100}%)`;
    appPrevBtn.disabled = currentAppSlide === 0;
    appNextBtn.disabled = currentAppSlide === appSlideKeys.length - 1;
    appCarouselTitle.setAttribute("data-i18n", appSlideKeys[currentAppSlide]);
    if (typeof I18N !== "undefined" && I18N.translations && I18N.translations[appSlideKeys[currentAppSlide]]) {
      appCarouselTitle.innerHTML = I18N.translations[appSlideKeys[currentAppSlide]];
    }
    appDots.forEach((dot, i) => dot.classList.toggle("active", i === currentAppSlide));
  }

  appPrevBtn.addEventListener("click", () => {
    if (currentAppSlide > 0) { currentAppSlide--; updateAppCarousel(); }
  });
  appNextBtn.addEventListener("click", () => {
    if (currentAppSlide < appSlideKeys.length - 1) { currentAppSlide++; updateAppCarousel(); }
  });
}
