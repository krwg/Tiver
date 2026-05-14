import { routes } from './routes.js';
import { getSession } from '../session/sessionStore.js';
import { renderGuestShell } from '../pages/guest/guestShell.js';

let outlet = null;

function findOutlet() {
  if (!outlet) outlet = document.getElementById('router-outlet');
  return outlet;
}

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname || '/';
}

function matchRoute(pathname) {
  const path = normalizePath(pathname);

  if (path === '/') {
    window.history.replaceState(null, '', '/welcome');
    return routes['/welcome'];
  }

  if (path === '/guest') {
    window.history.replaceState(null, '', '/guest/feed');
    return routes['/guest/feed'];
  }

  if (path === '/app') {
    window.history.replaceState(null, '', '/app/feed');
    return routes['/app/feed'];
  }

  const guestComm = /^\/guest\/community\/([^/]+)$/.exec(path);
  if (guestComm) {
    const communitySlug = decodeURIComponent(guestComm[1]);
    return { view: (ctx) => renderGuestShell({ ...ctx, segment: 'community', communitySlug }) };
  }

  const guestFriend = /^\/guest\/friend\/([^/]+)$/.exec(path);
  if (guestFriend) {
    const friendSlug = decodeURIComponent(guestFriend[1]);
    return { view: (ctx) => renderGuestShell({ ...ctx, segment: 'friend', friendSlug }) };
  }

  const guestGame = /^\/guest\/game\/([^/]+)$/.exec(path);
  if (guestGame) {
    const gameId = decodeURIComponent(guestGame[1]);
    return { view: (ctx) => renderGuestShell({ ...ctx, segment: 'game', gameId }) };
  }

  if (routes[path]) return routes[path];
  return routes['/404'];
}

export function navigate(to, { replace = false } = {}) {
  const next = to.startsWith('/') ? to : `/${to}`;
  if (replace) window.history.replaceState(null, '', next);
  else window.history.pushState(null, '', next);
  render();
}

export function initRouter() {
  window.addEventListener('popstate', () => render());
  render();
}

export function render() {
  const el = findOutlet();
  if (!el) return;

  const path = normalizePath(window.location.pathname);

  if (path.startsWith('/app')) {
    const s = getSession();
    if (s.mode !== 'user' || !s.token) {
      window.history.replaceState(null, '', '/login');
      el.replaceChildren();
      const route = routes['/login'];
      const node = route.view({ path: '/login' });
      if (node instanceof Node) el.appendChild(node);
      return;
    }
  }

  const route = matchRoute(path);

  el.replaceChildren();
  const node = route.view({ path });
  if (node instanceof Node) el.appendChild(node);
  else if (typeof node === 'string') {
    const wrap = document.createElement('div');
    wrap.innerHTML = node;
    el.append(...wrap.childNodes);
  }
}
