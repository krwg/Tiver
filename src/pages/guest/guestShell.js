import { setDocumentTitle } from '../../lib/documentTitle.js';
import { getSession, clearAuth } from '../../session/sessionStore.js';
import { siteFooter } from '../../components/siteFooter.js';
import { GUEST_NAV, GUEST_SEGMENT_META } from './guestMeta.js';
import { wireGuestUserMenu } from './guestMenu.js';
import { COMMUNITY_DATA, FRIEND_DATA, GAME_PROFILES } from './guestWorldData.js';
import { renderGuestMain } from './guestContent.js';
import { wireGuestDemo } from './guestDemo.js';
import { wireGuestSettings } from './guestSettings.js';
import { applyI18n } from '../../lib/locale.js';

export function renderGuestShell({ segment, communitySlug = '', friendSlug = '', gameId = '' } = {}) {
  let meta = GUEST_SEGMENT_META[segment] ?? GUEST_SEGMENT_META.feed;
  if (segment === 'community') {
    meta = {
      title: COMMUNITY_DATA[communitySlug]?.title ?? 'Сообщество',
      label: GUEST_SEGMENT_META.groups.label,
    };
  } else if (segment === 'friend') {
    meta = {
      title: FRIEND_DATA[friendSlug]?.name ?? 'Профиль',
      label: GUEST_SEGMENT_META.friends.label,
    };
  } else if (segment === 'game') {
    meta = {
      title: GAME_PROFILES[gameId]?.title ?? 'Игра',
      label: GUEST_SEGMENT_META.games.label,
    };
  }
  setDocumentTitle(meta.title);

  const session = getSession();
  const root = document.createElement('div');
  root.className = 'page page--guest';

  const navHtml = GUEST_NAV.map(({ segment: id, href }) => {
    const active =
      id === segment ||
      (segment === 'community' && id === 'groups') ||
      (segment === 'friend' && id === 'friends') ||
      (segment === 'game' && id === 'games')
        ? 'guest-nav__link--active'
        : '';
    const label = GUEST_SEGMENT_META[id].label;
    return `<a class="guest-nav__link ${active}" href="${href}">${label}</a>`;
  }).join('');

  const accountBlock =
    session.mode === 'user'
      ? `
          <a class="guest-user-menu__item" href="/app/profile">Личный кабинет</a>
          <a class="guest-user-menu__item" href="#" data-logout>Выйти из аккаунта</a>
        `
      : `
          <a class="guest-user-menu__item" href="/login">Войти в аккаунт</a>
          <a class="guest-user-menu__item" href="/register">Зарегистрироваться</a>
        `;

  root.innerHTML = `
    <header class="guest-topbar" role="banner">
      <div class="guest-topbar__brand">
        <a href="/welcome" class="guest-topbar__logo">Tiver</a>
        <span class="guest-badge">${session.mode === 'user' ? 'Аккаунт' : 'Гость'}</span>
      </div>
      <nav class="guest-nav" aria-label="Разделы">
        ${navHtml}
      </nav>
      <div class="guest-user-menu">
        <button type="button" class="guest-user-menu__trigger" data-user-menu-trigger aria-expanded="false" aria-haspopup="true">
          ${session.mode === 'user' ? (session.user?.displayName || 'Аккаунт') : 'Гостевой режим'}
          <span class="guest-user-menu__chevron" aria-hidden="true"></span>
        </button>
        <div class="guest-user-menu__panel" data-user-menu-panel hidden>
          ${accountBlock}
          <a class="guest-user-menu__item" href="/guest/settings">Настройки</a>
          <span class="guest-user-menu__item guest-user-menu__item--muted">Помощь</span>
          <a class="guest-user-menu__item" href="/welcome">На главную</a>
        </div>
      </div>
    </header>

    <main class="guest-main stack stack--lg" id="main-content" role="main">
      ${renderGuestMain({ segment, communitySlug, friendSlug, gameId })}
    </main>
  `;

  root.appendChild(siteFooter());
  applyI18n(root);
  wireGuestUserMenu(root);
  root.querySelector('[data-logout]')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    import('../../router/router.js').then(({ navigate }) => navigate('/welcome'));
  });

  if (segment === 'settings') wireGuestSettings(root);
  else wireGuestDemo(root, { segment, communitySlug, friendSlug, gameId });

  return root;
}
