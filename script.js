document.documentElement.classList.add("js");

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
  } catch (_error) {
    // Ignore storage errors (private mode, blocked storage, etc.).
  }
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
  if (storedTheme) {
    return storedTheme;
  }

  const alreadyAppliedTheme = document.documentElement.getAttribute("data-theme");
  if (alreadyAppliedTheme === "dark" || alreadyAppliedTheme === "light") {
    return alreadyAppliedTheme;
  }

  return themeMediaQuery.matches ? "dark" : "light";
}

function initTheme() {
  applyTheme(getPreferredTheme());

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });
  }

  const handleSystemThemeChange = (event) => {
    if (getStoredTheme()) {
      return;
    }
    applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof themeMediaQuery.addEventListener === "function") {
    themeMediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof themeMediaQuery.addListener === "function") {
    themeMediaQuery.addListener(handleSystemThemeChange);
  }
}

initTheme();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progressBar = document.querySelector(".scroll-progress span");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".topnav a");
const sections = [...document.querySelectorAll("main section[id]")];
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];

function activateTab(targetId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === targetId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

tabButtons.forEach((button, index) => {
  button.addEventListener("click", () => activateTab(button.dataset.target));

  button.addEventListener("keydown", (event) => {
    const directionMap = {
      ArrowLeft: -1,
      ArrowUp: -1,
      ArrowRight: 1,
      ArrowDown: 1,
    };

    if (!(event.key in directionMap)) {
      return;
    }

    event.preventDefault();

    const nextIndex = (index + directionMap[event.key] + tabButtons.length) % tabButtons.length;
    const nextButton = tabButtons[nextIndex];
    nextButton.focus();
    activateTab(nextButton.dataset.target);
  });
});

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
    const isActive = link.getAttribute("href") === `#${currentSection}`;
    link.classList.toggle("active", isActive);
  });
}

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
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

let ticking = false;

function requestScrollUpdate() {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollState();
    ticking = false;
  });
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);

activateTab("general");
updateScrollState();

// App Carousel Logic (PageView Style)
const appTrack = document.getElementById("app-carousel-track");
const appPrevBtn = document.getElementById("app-prev-btn");
const appNextBtn = document.getElementById("app-next-btn");
const appCarouselTitle = document.getElementById("app-carousel-title");
const appDots = document.querySelectorAll("#app-carousel-dots .carousel-dot");

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

    appDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentAppSlide);
    });
  }

  appPrevBtn.addEventListener("click", () => {
    if (currentAppSlide > 0) {
      currentAppSlide--;
      updateAppCarousel();
    }
  });

  appNextBtn.addEventListener("click", () => {
    if (currentAppSlide < appSlideKeys.length - 1) {
      currentAppSlide++;
      updateAppCarousel();
    }
  });
}
