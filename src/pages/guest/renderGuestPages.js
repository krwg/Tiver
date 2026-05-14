import { COMMUNITY_DATA, FRIEND_DATA, GAME_PROFILES } from './guestWorldData.js';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GEO_KEYS = new Set(['void', 'grid', 'hatch', 'brick', 'dots', 'cross', 'guest']);

function geoAvatar(key) {
  const k = GEO_KEYS.has(key) ? key : 'void';
  return `guest-geo-avatar guest-geo-avatar--${k}`;
}

function communityCommentFallback(count) {
  if (!count || count < 1) return [];
  const pool = [
    { who: 'Участник', text: 'Забрал в закладки, спасибо.', avatar: 'dots', slug: 'participant_demo' },
    { who: 'Гость', text: 'Как это будет после входа?', avatar: 'void', slug: 'guest_demo' },
    { who: 'Модератор', text: 'Пока только макет — ответы и счётчики локальные.', avatar: 'grid', slug: 'mod_demo' },
  ];
  return pool.slice(0, Math.min(3, count));
}

function postCommentsBlock(items) {
  const rows = (items || []).map((c) => {
    const av = geoAvatar(c.avatar);
    const slug = c.slug && /^[a-z0-9_-]+$/i.test(String(c.slug)) ? String(c.slug) : '';
    const profileOpen = slug
      ? `<a href="/guest/friend/${esc(slug)}" class="guest-post-comments__profile">`
      : '<span class="guest-post-comments__profile guest-post-comments__profile--nohref">';
    const profileClose = slug ? '</a>' : '</span>';
    return `<li class="guest-post-comments__item">
      ${profileOpen}
      <span class="${av}" aria-hidden="true"></span>
      <span class="guest-post-comments__stack">
        <span class="guest-post-comments__who">${esc(c.who)}</span>
        <span class="guest-post-comments__text">${esc(c.text)}</span>
      </span>
      ${profileClose}
    </li>`;
  });
  const placeholder =
    rows.length === 0
      ? '<li class="guest-post-comments__placeholder text-muted" data-guest-comments-placeholder>Пока никто не написал.</li>'
      : '';
  return `
    <div class="guest-post-comments" hidden data-guest-comments-panel>
      <p class="guest-post-comments__label text-muted text-sm">Комментарии</p>
      <ul class="guest-post-comments__list">${placeholder}${rows.join('')}</ul>
      <div class="guest-post-comments__composer auth-form guest-post-comments__composer--inline">
        <input class="input guest-post-comments__input" type="text" maxlength="240" placeholder="Написать…" aria-label="Текст комментария" />
        <button type="button" class="btn btn--secondary btn--sm guest-post-comments__send">Отправить</button>
      </div>
    </div>
  `;
}

function postCardPixel(author, rel, text, likes, comments, reposts = 0, commentItems = null) {
  const citems = Array.isArray(commentItems) ? commentItems : communityCommentFallback(comments);
  const commentN = citems.length;
  return `
    <article class="guest-cpost card card--pad-md">
      <header class="guest-cpost__head">
        <span class="guest-cpost__avatar" aria-hidden="true"></span>
        <div>
          <span class="guest-cpost__author">${esc(author)}</span>
          <span class="guest-cpost__dot">·</span>
          <span class="guest-cpost__rel">${esc(rel)}</span>
        </div>
      </header>
      <p class="guest-cpost__text">${esc(text)}</p>
      <div class="guest-post__actions guest-post__actions--pixel">
        <button type="button" class="guest-post__like guest-pixbtn" aria-pressed="false" aria-label="Нравится" data-like-base="${likes}">
          <span class="guest-pixbtn__glyph" aria-hidden="true">◆</span>
          <span class="guest-pixbtn__n guest-pixbtn__n--like" data-like-n>${likes}</span>
        </button>
        <button type="button" class="guest-post__side guest-pixbtn" data-guest-comment aria-label="Комментарии" aria-expanded="false">
          <span class="guest-pixbtn__glyph" aria-hidden="true">□</span>
          <span class="guest-pixbtn__n" data-count>${commentN}</span>
        </button>
        <button type="button" class="guest-post__side guest-pixbtn" data-guest-repost aria-label="Репост">
          <span class="guest-pixbtn__glyph" aria-hidden="true">↻</span>
          <span class="guest-pixbtn__n" data-count>${reposts}</span>
        </button>
      </div>
      ${postCommentsBlock(citems)}
    </article>
  `;
}

function communityMetaRows(members, desc, website) {
  return `
    <div class="guest-community-meta-rows">
      <div class="guest-meta-row">
        <span class="guest-pixel-ico guest-pixel-ico--users" aria-hidden="true"></span>
        <span>${esc(members)}</span>
      </div>
      <div class="guest-meta-row">
        <span class="guest-pixel-ico guest-pixel-ico--doc" aria-hidden="true"></span>
        <span>${esc(desc)}</span>
      </div>
      <div class="guest-meta-row">
        <span class="guest-pixel-ico guest-pixel-ico--link" aria-hidden="true"></span>
        <span class="text-muted">${esc(website)}</span>
      </div>
    </div>
  `;
}

export function renderCommunityPage(slug) {
  const c = COMMUNITY_DATA[slug];
  const title = c?.title ?? `«${esc(slug)}»`;
  const tag = c?.tag ?? '—';
  const desc = c?.desc ?? 'Нет в каталоге — вернитесь к сетке сообществ.';
  const members = c?.members ?? '—';
  const handle = c?.handle ?? `@tiver_${esc(slug)}`;
  const website = c?.website ?? 'https://tiver.social';
  const bannerClass = c?.bannerClass ?? 'guest-cbanner--void';
  const posts = c?.posts ?? [];
  const about = c?.aboutExtra ?? '';
  const requestOnly = Boolean(c?.requestOnly);
  const subBlock = requestOnly
    ? `<button type="button" class="btn btn--primary" data-sub-slug="${esc(slug)}" data-guest-request-sub>Подписаться</button>`
    : `<button type="button" class="btn btn--primary guest-community-toggle-sub" data-sub-slug="${esc(slug)}">Подписаться</button>`;

  const feedPosts = posts
    .map((p) => postCardPixel(p.author, p.rel, p.text, p.likes, p.comments, p.reposts ?? 0, p.commentsList))
    .join('');

  return `
    <section class="guest-community-page" data-community-slug="${esc(slug)}">
      <p class="guest-community__back">
        <a class="t-inline-link" href="/guest/groups" data-i18n="community.back">← К каталогу сообществ</a>
      </p>
      <div class="guest-community-cover ${bannerClass}" role="img" aria-label=""></div>
      <div class="guest-community-sheet card">
        <div class="guest-community-headrow">
          <div class="guest-community-head-main">
            <div class="guest-community-topline">
              <div class="guest-community-avatar" aria-hidden="true"></div>
              <div class="guest-community-titles">
                <span class="guest-group-cell__tag">${esc(tag)}</span>
                <h1 class="guest-community-hero-title">${esc(title)}</h1>
                <p class="guest-community-handle">${esc(handle)}</p>
              </div>
              <div class="guest-community-actions">
                ${subBlock}
              </div>
            </div>
            ${communityMetaRows(members, desc, website)}
          </div>
        </div>
        <div class="guest-community-tabs" role="tablist">
          <button type="button" class="guest-chip guest-chip--on" data-c-tab="feed" role="tab" aria-selected="true">Лента</button>
          <button type="button" class="guest-chip" data-c-tab="members" role="tab" aria-selected="false">Участники</button>
          <button type="button" class="guest-chip" data-c-tab="about" role="tab" aria-selected="false">О сообществе</button>
        </div>
        <div class="guest-community-panel" data-c-panel="feed">
          <div class="guest-community-composer auth-form">
            <input class="input guest-community-composer__input" type="text" maxlength="200" placeholder="Что нового в сообществе?" />
            <button type="button" class="btn btn--secondary guest-community-composer__btn">Опубликовать</button>
          </div>
          <div class="guest-community-feed">${feedPosts || '<p class="text-muted">Пока тихо — загляните позже.</p>'}</div>
        </div>
        <div class="guest-community-panel" data-c-panel="members" hidden>
          <p class="text-secondary">Список участников — после авторизации. Здесь только счётчик из шапки.</p>
        </div>
        <div class="guest-community-panel" data-c-panel="about" hidden>
          <p class="text-secondary">${esc(about)}</p>
        </div>
      </div>
    </section>
  `;
}

export function renderFriendPage(slug) {
  const f = FRIEND_DATA[slug];
  const name = f?.name ?? slug;
  const handle = f?.handle ?? `@${slug}`;
  const bio = f?.bio ?? 'Нет данных.';
  const bannerClass = f?.bannerClass ?? 'guest-cbanner--void';
  const posts = f?.posts?.map((p) => postCardPixel(name, p.rel, p.text, 4, 1, 0)).join('') ?? '';

  return `
    <section class="guest-friend-page" data-friend-slug="${esc(slug)}">
      <p class="guest-community__back">
        <a class="t-inline-link" href="/guest/friends">← К друзьям</a>
      </p>
      <div class="guest-community-cover ${bannerClass}"></div>
      <div class="guest-community-sheet card">
        <div class="guest-community-headrow">
          <div class="guest-community-head-main">
            <div class="guest-community-topline guest-community-topline--friend">
              <div class="guest-community-avatar" aria-hidden="true"></div>
              <div class="guest-community-titles">
                <h1 class="guest-community-hero-title">${esc(name)}</h1>
                <p class="guest-community-handle">${esc(handle)}</p>
              </div>
            </div>
            <div class="guest-community-meta-rows">
              <div class="guest-meta-row">
                <span class="guest-pixel-ico guest-pixel-ico--photo" aria-hidden="true"></span>
                <span>${f?.photos ?? 0} фото · полный альбом после входа</span>
              </div>
              <div class="guest-meta-row">
                <span class="guest-pixel-ico guest-pixel-ico--doc" aria-hidden="true"></span>
                <span>${esc(bio)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="guest-community-tabs" role="tablist">
          <button type="button" class="guest-chip guest-chip--on" data-f-tab="wall" role="tab" aria-selected="true">Стена</button>
          <button type="button" class="guest-chip" data-f-tab="photos" role="tab" aria-selected="false">Фото</button>
        </div>
        <div class="guest-community-panel" data-f-panel="wall">
          <div class="guest-community-feed">${posts || '<p class="text-muted">Пусто.</p>'}</div>
          <div class="guest-friend-locked card card--pad-sm">
            <p class="copy-lead text-sm" data-i18n="friend.wall_locked">Полная стена и лента друга — после входа в аккаунт.</p>
            <p class="text-muted text-sm" data-i18n="friend.photos_hint">Галерея и личные фото — только для авторизованных.</p>
            <div class="actions-row actions-row--start">
              <a href="/login" class="btn btn--primary btn--sm" data-i18n="guest.login">Войти</a>
            </div>
          </div>
        </div>
        <div class="guest-community-panel" data-f-panel="photos" hidden>
          <p class="text-muted">Фото скрыты до входа.</p>
        </div>
      </div>
    </section>
  `;
}

export function renderGamePage(id) {
  const g = GAME_PROFILES[id];
  const title = g?.title ?? id;
  const tag = g?.tag ?? '';
  const desc = g?.desc ?? 'Нет карточки в демо.';
  const tagline = g?.tagline ?? '';
  const bannerClass = g?.coverClass ?? 'guest-cbanner--void';
  const shots = g?.shots ?? ['#1a1a1c', '#1e1e22', '#222228'];
  const slides = shots
    .map(
      (bg, i) =>
        `<div class="guest-game-slide" style="background-color:${esc(bg)}" role="img" aria-label="Кадр ${i + 1}"></div>`,
    )
    .join('');

  return `
    <section class="guest-game-page" data-game-id="${esc(id)}">
      <p class="guest-community__back">
        <a class="t-inline-link" href="/guest/games">← К играм</a>
      </p>
      <div class="guest-community-cover ${bannerClass}"></div>
      <div class="guest-community-sheet card">
        <div class="guest-game-hero">
          <p class="guest-group-cell__tag">${esc(tag)}</p>
          <h1 class="guest-community-hero-title">${esc(title)}</h1>
          ${tagline ? `<p class="guest-game-tagline">${esc(tagline)}</p>` : ''}
          <p class="text-secondary">${esc(desc)}</p>
        </div>
        <div class="guest-game-carousel" aria-label="Скриншоты">
          <div class="guest-game-carousel__track">${slides}</div>
        </div>
        <div class="guest-game-spec-card card card--pad-md">
          <h2 class="guest-feed-card__title">Системные требования</h2>
          <p class="guest-game-spec-label">Минимум</p>
          <p class="guest-game-spec-body">${esc(g?.minSpec ?? '')}</p>
          <p class="guest-game-spec-label guest-game-spec-label--top">Максимум</p>
          <p class="guest-game-spec-body">${esc(g?.maxSpec ?? '')}</p>
        </div>
      </div>
    </section>
  `;
}
