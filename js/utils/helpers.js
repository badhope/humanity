(function(global) {
  'use strict';

  const $ = (selector, context = document) => {
    try {
      return context.querySelector(selector);
    } catch (e) {
      console.error(`$: Invalid selector "${selector}"`, e);
      return null;
    }
  };

  const $$ = (selector, context = document) => {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (e) {
      console.error(`$$: Invalid selector "${selector}"`, e);
      return [];
    }
  };

  const create = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') el.className = value;
      else if (key === 'dataset') Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else el.setAttribute(key, value);
    });
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
    });
    return el;
  };

  const animate = (el, props, duration = 0.5, easing = 'power2.out') => {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(el, { ...props, duration, ease: easing });
    } else {
      Object.assign(el.style, props);
    }
  };

  const fadeIn = (el, duration = 0.3) => {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration, ease: 'power2.out' });
    } else {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }
  };

  const fadeOut = (el, duration = 0.3) => {
    return new Promise(resolve => {
      if (!el) { resolve(); return; }
      if (typeof gsap !== 'undefined') {
        gsap.to(el, { opacity: 0, y: -20, duration, ease: 'power2.in', onComplete: resolve });
      } else {
        el.style.opacity = 0;
        el.style.transform = 'translateY(-20px)';
        resolve();
      }
    });
  };

  const slideIn = (el, direction = 'left', duration = 0.4) => {
    if (!el) return;
    const fromX = direction === 'left' ? -50 : direction === 'right' ? 50 : 0;
    const fromY = direction === 'up' ? 50 : direction === 'down' ? -50 : 0;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(el, { opacity: 0, x: fromX, y: fromY }, { opacity: 1, x: 0, y: 0, duration, ease: 'power3.out' });
    } else {
      el.style.opacity = 1;
      el.style.transform = 'translate(0, 0)';
    }
  };

  const scaleIn = (el, duration = 0.3) => {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration, ease: 'back.out(1.7)' });
    } else {
      el.style.opacity = 1;
      el.style.transform = 'scale(1)';
    }
  };

  const staggerAnimate = (els, props, stagger = 0.1, duration = 0.4) => {
    if (!els || !els.length) return;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(els, { opacity: 0, y: 20 }, { ...props, opacity: 1, y: 0, duration, stagger, ease: 'power2.out' });
    } else {
      els.forEach(el => { el.style.opacity = 1; el.style.transform = 'translateY(0)'; });
    }
  };

  const showPage = (pageId) => {
    try {
      $$('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
      });
      const target = $(`#${pageId}`);
      if (target) {
        target.style.display = 'flex';
        requestAnimationFrame(() => target.classList.add('active'));
      }
    } catch (e) {
      console.error('showPage: Failed', e);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    const toast = create('div', { className: `toast toast-${type}` }, [message]);
    document.body.appendChild(toast);
    fadeIn(toast);
    setTimeout(() => {
      fadeOut(toast).then(() => toast.remove());
    }, duration);
  };

  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const throttle = (fn, limit = 100) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
  };

  const formatDate = (date = new Date()) => {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const shuffle = (arr) => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const lerp = (start, end, t) => start + (end - start) * t;

  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const Helpers = {
    $,
    $$,
    create,
    animate,
    fadeIn,
    fadeOut,
    slideIn,
    scaleIn,
    staggerAnimate,
    showPage,
    showToast,
    debounce,
    throttle,
    formatDate,
    formatTime,
    random,
    shuffle,
    clamp,
    lerp,
    isMobile,
    isDarkMode
  };

  global.Helpers = Helpers;

})(window);
