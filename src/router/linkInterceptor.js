import { navigate } from './router.js';

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function initLinkInterceptor() {
  document.addEventListener('click', (event) => {
    if (isModifiedClick(event)) return;

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (anchor.getAttribute('rel') === 'external') return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

    let url;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;

    // Статические HTML в public/archive — полная навигация браузером, не SPA
    if (url.pathname.startsWith('/archive/')) return;

    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });
}
