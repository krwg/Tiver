import { setDocumentTitle } from '../../lib/documentTitle.js';
import { getSession, clearAuth } from '../../session/sessionStore.js';
import { siteFooter } from '../../components/siteFooter.js';
import { wireAppProfile } from './appProfile.js';

const NAV = [
  { id: 'feed', href: '/app/feed', label: 'Новости' },
  { id: 'messages', href: '/app/messages', label: 'Сообщения' },
  { id: 'groups', href: '/app/groups', label: 'Сообщества' },
  { id: 'friends', href: '/app/friends', label: 'Друзья' },
  { id: 'games', href: '/app/games', label: 'Игры' },
  { id: 'profile', href: '/app/profile', label: 'Профиль' },
];

function devPlaceholder(title) {
  return `
    <div class="app-dev-placeholder">
      <h2 class="app-dev-placeholder__title">${title}</h2>
      <p class="app-dev-placeholder__text">Ведётся разработка. Здесь будет раздел после подключения API и клиента.</p>
    </div>
  `;
}

export function renderAppShell({ section }) {
  const titles = {
    feed: 'Новости',
    messages: 'Сообщения',
    groups: 'Сообщества',
    friends: 'Друзья',
    games: 'Игры',
    profile: 'Профиль',
  };
  const t = titles[section] ?? 'Tiver';
  setDocumentTitle(`${t} — аккаунт`);

  const session = getSession();
  const root = document.createElement('div');
  root.className = 'page page--app';

  const navHtml = NAV.map(({ id, href, label }) => {
    const active = id === section ? 'app-topbar__link--active' : '';
    return `<a class="app-topbar__link ${active}" href="${href}">${label}</a>`;
  }).join('');

  const inner =
    section === 'profile'
      ? `
    <section class="stack stack--md" aria-labelledby="profile-title">
      <h1 class="hero__title" id="profile-title">Профиль</h1>
      <p class="text-secondary">Имя и короткое описание сохраняются через API, когда он доступен.</p>
      <form class="card card--pad-md stack stack--sm auth-form" id="app-profile-form">
        <label class="field">
          <span class="field__label">Отображаемое имя</span>
          <input class="input" type="text" name="displayName" required value="${escapeAttr(session.user?.displayName || '')}" />
        </label>
        <label class="field">
          <span class="field__label">О себе</span>
          <textarea class="input" name="bio" rows="4" placeholder="Несколько слов о себе">${escapeAttr(session.user?.bio || '')}</textarea>
        </label>
        <button class="btn btn--primary" type="submit">Сохранить</button>
        <p class="text-muted text-sm" id="app-profile-status" role="status"></p>
      </form>
    </section>
  `
      : devPlaceholder(t);

  root.innerHTML = `
    <header class="app-topbar" role="banner">
      <div class="app-topbar__brand">
        <a href="/welcome" class="app-topbar__logo">Tiver</a>
        <span class="guest-badge">${escapeAttr(session.user?.email || '')}</span>
      </div>
      <nav class="app-topbar__nav" aria-label="Разделы">
        ${navHtml}
        <a class="app-topbar__link" href="/guest/feed">Гость</a>
        <a class="app-topbar__link" href="#" data-app-logout>Выйти</a>
      </nav>
    </header>
    <main class="app-main stack stack--lg" id="main-content" role="main">
      ${inner}
    </main>
  `;

  root.appendChild(siteFooter());

  root.querySelector('[data-app-logout]')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    import('../../router/router.js').then(({ navigate }) => navigate('/welcome'));
  });

  if (section === 'profile') wireAppProfile(root);

  return root;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
