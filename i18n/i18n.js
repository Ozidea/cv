const I18N = {
  currentLocale: 'en',
  translations: {},

  init: async function() {
    let savedLang = this.getCookie('lang');
    if (!savedLang) {
      if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Istanbul') {
        savedLang = 'tr';
      } else {
        savedLang = 'en';
      }
      this.setCookie('lang', savedLang, 365);
    }
    this.currentLocale = savedLang;
    document.documentElement.lang = savedLang;
    await this.loadTranslations(savedLang);
    this.updateDOM();
    this.setupSelector();
  },

  setCookie: function(name, value, days) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },

  getCookie: function(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  },

  loadTranslations: async function(lang) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      if(response.ok) {
        this.translations = await response.json();
      } else {
         console.error("Failed to fetch translations");
      }
    } catch (e) {
      console.error('Translations could not be loaded', e);
    }
  },

  updateDOM: function() {
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-aria]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const ariaKey = el.getAttribute('data-i18n-aria');
      
      if (key && this.translations[key]) {
        if (el.tagName === 'META') {
           el.content = this.translations[key];
        } else {
           el.innerHTML = this.translations[key];
        }
      }
      
      if (ariaKey && this.translations[ariaKey]) {
        el.setAttribute('aria-label', this.translations[ariaKey]);
      }
    });
  },
  
  changeLanguage: async function(lang) {
    if(this.currentLocale === lang) return;
    this.setCookie('lang', lang, 365);
    this.currentLocale = lang;
    document.documentElement.lang = lang;
    await this.loadTranslations(lang);
    this.updateDOM();
    
    // Update active class on selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if(btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  setupSelector: function() {
    const container = document.getElementById('lang-selector');
    if(container) {
      container.querySelectorAll('.lang-btn').forEach(btn => {
        if(btn.dataset.lang === this.currentLocale) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.changeLanguage(btn.dataset.lang);
        });
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
    I18N.init();
});
