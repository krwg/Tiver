/**
 * Гостевой режим: разметка экранов + хуки для guestDemo.js.
 */

import { COMMUNITY_DATA, GAME_PROFILES } from './guestWorldData.js';
import { renderCommunityPage, renderFriendPage, renderGamePage } from './renderGuestPages.js';
import { FEED_COMMENT_THREADS, legacyFeedCommentThread } from './guestFeedComments.js';

function escGuest(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GEO_AVATAR_KEYS = new Set(['void', 'grid', 'hatch', 'brick', 'dots', 'cross', 'guest']);

function guestGeoAvatarClass(key) {
  const k = GEO_AVATAR_KEYS.has(key) ? key : 'void';
  return `guest-geo-avatar guest-geo-avatar--${k}`;
}

function feedCommentsForCount(commentCount, override) {
  if (Array.isArray(override)) return override;
  return [];
}

function guestPostCommentsHtml(items) {
  const rows = (items || []).map((c) => {
    const av = guestGeoAvatarClass(c.avatar);
    const slug = c.slug && /^[a-z0-9_-]+$/i.test(String(c.slug)) ? String(c.slug) : '';
    const profileOpen = slug
      ? `<a href="/guest/friend/${escGuest(slug)}" class="guest-post-comments__profile">`
      : '<span class="guest-post-comments__profile guest-post-comments__profile--nohref">';
    const profileClose = slug ? '</a>' : '</span>';
    return `<li class="guest-post-comments__item">
      ${profileOpen}
      <span class="${av}" aria-hidden="true"></span>
      <span class="guest-post-comments__stack">
        <span class="guest-post-comments__who">${escGuest(c.who)}</span>
        <span class="guest-post-comments__text">${escGuest(c.text)}</span>
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

function mockPost(
  name,
  time,
  line1,
  line2,
  kind = 'all',
  likes = 0,
  comments = 3,
  reposts = 0,
  legacy = false,
  commentOverride = undefined,
) {
  const legacyCls = legacy ? ' guest-post--legacy' : '';
  const commentItems = feedCommentsForCount(comments, commentOverride);
  return `
    <article class="guest-post guest-post--feed${legacyCls}" data-guest-post-kind="${kind}">
      <div class="guest-post__avatar" aria-hidden="true"></div>
      <div class="guest-post__maincol">
        <div class="guest-post__body">
          <header class="guest-post__head">
            <span class="guest-post__name">${name}</span>
            <span class="guest-post__time">${time}</span>
          </header>
          <p class="guest-post__text">${line1}</p>
          ${line2 ? `<p class="guest-post__text guest-post__text--muted">${line2}</p>` : ''}
        </div>
        <div class="guest-post__actions guest-post__actions--pixel">
          <button type="button" class="guest-post__like guest-pixbtn" aria-pressed="false" aria-label="Нравится" data-like-base="${likes}">
            <span class="guest-pixbtn__glyph" aria-hidden="true">◆</span>
            <span class="guest-pixbtn__n guest-pixbtn__n--like" data-like-n>${likes}</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-comment aria-label="Комментарии" aria-expanded="false">
            <span class="guest-pixbtn__glyph" aria-hidden="true">□</span>
            <span class="guest-pixbtn__n" data-count>${comments}</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-repost aria-label="Репост">
            <span class="guest-pixbtn__glyph" aria-hidden="true">↻</span>
            <span class="guest-pixbtn__n" data-count>${reposts}</span>
          </button>
        </div>
        ${guestPostCommentsHtml(commentItems)}
      </div>
    </article>
  `;
}

function mockChatRow(id, name, preview, time, unread, cat = 'all', presence = '', geo = 'void', stamp = 0) {
  const dot = unread ? '<span class="guest-chat-row__dot" aria-hidden="true"></span>' : '';
  const presenceHtml = presence
    ? `<span class="guest-chat-row__presence${presence === 'в сети' ? ' guest-chat-row__presence--online' : ''}">${presence}</span>`
    : '';
  const av = guestGeoAvatarClass(geo);
  return `
    <button type="button" class="guest-chat-row" data-chat="${id}" data-msg-cat="${cat}" data-chat-stamp="${stamp}">
      <div class="guest-chat-row__avatar ${av}" aria-hidden="true"></div>
      <div class="guest-chat-row__mid">
        <span class="guest-chat-row__name">${name}</span>
        <span class="guest-chat-row__preview">${preview}</span>
      </div>
      <div class="guest-chat-row__meta">
        <span class="guest-chat-row__time">${time}${dot}</span>
        ${presenceHtml}
      </div>
    </button>
  `;
}

function mockGroup(title, subs, tag, slug, sortTags = 'pop') {
  const c = slug ? COMMUNITY_DATA[slug] : null;
  const coverExtra = c?.bannerClass ? ` ${c.bannerClass}` : '';
  const cellAttrs = slug ? ` data-group-href="/guest/community/${slug}" tabindex="0" role="link"` : '';
  const subBtn = c?.requestOnly
    ? `<button type="button" class="btn btn--primary btn--sm" data-sub-slug="${slug}" data-guest-request-sub>Подписаться</button>`
    : `<button type="button" class="btn btn--primary btn--sm guest-community-toggle-sub" data-sub-slug="${slug}">Подписаться</button>`;
  return `
    <div class="guest-group-cell"${cellAttrs} data-groups-tags="${sortTags}">
      <div class="guest-group-cell__cover${coverExtra}" aria-hidden="true"></div>
      <div class="guest-group-cell__body">
        <span class="guest-group-cell__tag">${tag}</span>
        <h3 class="guest-group-cell__title">${title}</h3>
        <p class="guest-group-cell__subs">${subs}</p>
        ${subBtn}
      </div>
    </div>
  `;
}

function mockGroupProdsoft() {
  return `
    <div class="guest-group-cell guest-group-cell--prodsoft" data-group-href="/guest/community/prodsoft" tabindex="0" role="link" data-groups-tags="pop new">
      <div class="guest-group-cell__cover guest-cbanner--grid" aria-hidden="true"></div>
      <div class="guest-group-cell__body">
        <a class="guest-group-cell__head-link" href="/guest/community/prodsoft">
          <span class="guest-group-cell__tag">ERP</span>
          <h3 class="guest-group-cell__title">Производственный учёт</h3>
        </a>
        <p class="guest-group-cell__subs">2,4k · регламенты, отчёты, спокойствие</p>
        <button type="button" class="btn btn--primary btn--sm guest-community-toggle-sub" data-sub-slug="prodsoft">Подписаться</button>
      </div>
    </div>
  `;
}

function mockFriend(name, status, slug) {
  return `
    <a class="guest-friend-row" href="/guest/friend/${slug}">
      <div class="guest-friend-row__avatar" aria-hidden="true"></div>
      <div class="guest-friend-row__info">
        <span class="guest-friend-row__name">${name}</span>
        <span class="guest-friend-row__status">${status}</span>
      </div>
      <span class="guest-friend-row__stub" aria-hidden="true">›</span>
    </a>
  `;
}

function mockGameCard(gameId) {
  const g = GAME_PROFILES[gameId];
  if (!g) return '';
  const cover = g.coverClass ?? 'guest-cbanner--void';
  const cat =
    {
      g2048: 'time',
      gcolor: 'time',
      gquiz: 'two',
      gsnake: 'all',
      gsudoku: 'all',
      gpzl: 'all',
      gtetris: 'time',
      goff: 'off',
    }[gameId] || 'all';
  return `
    <a class="guest-vkplay-card" href="/guest/game/${gameId}" data-game-cat="${cat}">
      <div class="guest-vkplay-card__media ${cover}" aria-hidden="true"></div>
      <div class="guest-vkplay-card__body">
        <span class="guest-vkplay-card__genre">${g.tag}</span>
        <h3 class="guest-vkplay-card__title">${g.title}</h3>
        <p class="guest-vkplay-card__lede">${g.tagline ?? ''}</p>
      </div>
    </a>
  `;
}

const PREVIEW = {
  feed: `
    <div class="guest-dash">
      <div class="guest-dash__main">
        <section class="guest-hero guest-hero--compact card card--pad-lg">
          <p class="guest-hero__eyebrow">Гостевой предпросмотр</p>
          <h1 class="guest-hero__title">Новости</h1>
          <p class="guest-hero__lead">Лента, сайдбар, композер и фильтры — ведём себя почти как после логина: пост, фильтры, лайки, комментарии и репосты считаются локально.</p>
          <p class="guest-hero__note text-muted">Бот в «Сообщениях» понимает <code class="text-secondary">/help</code> и соседей по чату — с задержкой и «печатает…», без обмана.</p>
        </section>

        <div id="guest-feed-1c-banner" class="guest-1c-topic" hidden role="status">
          <span class="guest-1c-topic__badge">1С</span>
          <span class="guest-1c-topic__text">Тема разблокирована: жёлтая палитра, отдельный пост в ленте и чат «1С · общий». Запятую в СКД проверили за вас нет.</span>
        </div>

        <div class="guest-feed-rail">
          <div class="guest-composer auth-form">
            <input class="input guest-composer__input" type="text" maxlength="280" placeholder="Что у вас нового? (попадёт в ленту ниже)" aria-label="Текст поста" />
            <button type="button" class="btn btn--primary guest-composer__send">В ленту</button>
          </div>
          <div class="guest-feed-filters" role="toolbar" aria-label="Фильтр ленты">
            <button type="button" class="guest-chip guest-chip--on" data-feed-chip="all" role="tab" aria-selected="true">Всё</button>
            <button type="button" class="guest-chip" data-feed-chip="photo" role="tab" aria-selected="false">Фото</button>
            <button type="button" class="guest-chip" data-feed-chip="article" role="tab" aria-selected="false">Статьи</button>
            <button type="button" class="guest-chip" data-feed-chip="people" role="tab" aria-selected="false">Люди</button>
          </div>
          <p id="guest-feed-filter-note" class="guest-feed-filter-note text-muted text-sm" role="status" aria-live="polite"></p>
          <p id="guest-feed-empty-hint" class="guest-feed-empty-hint text-muted text-sm" hidden>Нет постов в этом фильтре.</p>
        </div>

        <section class="card card--pad-md guest-feed-card">
          <div class="guest-feed-card__head">
            <h2 class="guest-feed-card__title">Лента подписок</h2>
            <span class="guest-feed-card__meta">обновлено только что · гость</span>
          </div>
          <div id="guest-feed-stream" class="guest-preview__main">
            <div id="guest-feed-dynamic">
            ${mockPost('Tiver Dev', 'сейчас', 'Собрали гостевой экран ближе к «живому» продукту: сетка, сайдбар, больше постов.', '', 'article', 24, 5, 1, false, FEED_COMMENT_THREADS.tiverDev)}
            ${mockPost('Клуб фотографии', '9 мин назад', 'Серия «офис в 8 бит» — без фильтров, только честный ISO.', '12 кадров', 'photo', 18, 2, 0, false, FEED_COMMENT_THREADS.photoClub)}
            ${mockPost('Никита', '14:02', 'Кто-нибудь тестил архив на телефоне? У меня кнопка 2026 не перекрывает кнопки из CSS 2021.', 'Прикрепил скрин в голове.', 'people', 3, 12, 0, false, FEED_COMMENT_THREADS.nikita)}
            ${mockPost('Клуб минимализма', '13:40', 'Опрос: оставляем пиксельный шрифт на всём сайте или только в госте?', '', 'article', 41, 7, 2, false, FEED_COMMENT_THREADS.minimal)}
            ${mockPost('Лена', 'вчера', 'Выложила длиннопост про то, как не сойти с ума от линтера.', '…читать дальше', 'article', 8, 1, 0, false, FEED_COMMENT_THREADS.lena)}
            ${mockPost('Репост · Дайджест', 'вчера', '12 ссылок про соцсети и приватность. Сжато, без криков.', '', 'article', 56, 4, 9, false, FEED_COMMENT_THREADS.digest)}
            ${mockPost('Вы', 'черновик', 'Заголовок черновика', 'Текст ещё не дописан — как у всех.', 'people', 0, 0, 0)}
            </div>
            <p class="guest-feed-legacy__label text-muted text-sm">Начало ленты</p>
            <div id="guest-feed-legacy">
            ${mockPost(
              'Tiver Dev',
              '17 февраля 2021',
              'Первый пост: «ещё не знаем, во что это вырастет, но ленту не хочется отдавать чужому алгоритму».',
              'Добро пожаловать в Tiver.',
              'article',
              128,
              24,
              9,
              true,
              legacyFeedCommentThread(),
            )}
            </div>
          </div>
        </section>
      </div>

      <aside class="guest-dash__side" aria-label="Виджеты">
        <div class="guest-widget">
          <h3 class="guest-widget__title">Профиль</h3>
          <div class="guest-widget__row"><span>Гость</span><span class="guest-widget__muted">локально</span></div>
          <div class="guest-widget__row"><span>Подписки</span><span>128</span></div>
          <div class="guest-widget__row"><span>Черновики</span><span>3</span></div>
        </div>
        <div class="guest-widget">
          <h3 class="guest-widget__title">В сети</h3>
          <div class="guest-widget__row"><span class="guest-stat"><span class="guest-stat__dot" aria-hidden="true"></span>12 друзей</span></div>
          <div class="guest-widget__row"><span>Сообщества</span><span class="guest-widget__muted">5 активных</span></div>
        </div>
        <div class="guest-widget">
          <h3 class="guest-widget__title">События</h3>
          <div class="guest-widget__row"><span>Стрим UI</span><span class="guest-widget__muted">пт 20:00</span></div>
          <div class="guest-widget__row"><span>Релиз бета</span><span class="guest-widget__muted">скоро</span></div>
        </div>
      </aside>
    </div>
  `,
  messages: `
    <section class="guest-hero guest-hero--compact card card--pad-lg">
      <p class="guest-hero__eyebrow">Гостевой предпросмотр</p>
      <h1 class="guest-hero__title">Сообщения</h1>
      <p class="guest-hero__lead">Список чатов и переписка: выберите диалог, пишите снизу, жмите быстрые ответы. У бота есть команды; у людей — заготовленные реплики с задержкой.</p>
      <p class="guest-hero__note text-muted">Чаты под фильтром «Личные» / «Работа» — чистая косметика, но удобно потыкать.</p>
    </section>

    <section class="card card--pad-md">
      <div class="guest-msgs-head">
        <div class="guest-msgs-head__tabs" role="tablist" aria-label="Разделы (макет)">
          <button type="button" class="guest-chip guest-chip--on" data-msg-tab="all" role="tab" aria-selected="true">Все</button>
          <button type="button" class="guest-chip" data-msg-tab="personal" role="tab" aria-selected="false">Личные</button>
          <button type="button" class="guest-chip" data-msg-tab="work" role="tab" aria-selected="false">Работа</button>
        </div>
        <span class="guest-feed-card__meta">поиск · уведомления — заглушки</span>
      </div>
      <div class="guest-msgs-layout">
        <div class="guest-msgs-list">
          <div class="guest-preview__toolbar">
            <span class="guest-preview__toolbar-title">Чаты</span>
            <span class="guest-preview__toolbar-fake">Найти…</span>
          </div>
          <div id="guest-chat-1c-slot" class="guest-chat-1c-slot" hidden data-chat-stamp="0"></div>
          ${mockChatRow('askzup', 'Вопросы к гостю · ЗУП', 'cf/cu на пятницу — обязательны?', '17:40', true, 'work', 'в сети', 'grid', 100)}
          ${mockChatRow('askcode', 'Вопросы к гостю · код', 'Роутер настоящий или театр?', '17:22', true, 'work', 'были недавно', 'brick', 99)}
          ${mockChatRow('askui', 'Вопросы к гостю · UI', 'Пиксель — навсегда или A/B?', '16:44', true, 'work', 'в сети', 'cross', 98)}
          ${mockChatRow('mama', 'Мама', 'Ужин через час?', '16:02', true, 'personal', 'в сети', 'dots', 97)}
          ${mockChatRow('team', 'Команда Tiver', 'Архив: оригинальные CSS снова на месте', 'вчера', false, 'work', 'были недавно', 'grid', 96)}
          ${mockChatRow('dr', 'Доктор', 'Результаты анализов вложением', 'вчера', true, 'personal', 'был(а) 1 ч назад', 'hatch', 93)}
          ${mockChatRow('work', 'Рабочий чат', 'Дедлайн по макетам — пятница', '09:41', false, 'work', 'в сети', 'brick', 92)}
          ${mockChatRow('spam', 'Рассылка', 'Скидка 12% на подписку', '09:00', false, 'all', 'автоответ', 'cross', 89)}
          ${mockChatRow('nina', 'Нина', 'Завтра кофе в 11:00 — ты как?', '08:55', false, 'personal', 'в сети', 'dots', 88)}
          ${mockChatRow('support', 'Поддержка Tiver', 'Тикет #2048: статус «в работе»', '08:12', true, 'work', 'в сети', 'grid', 87)}
          ${mockChatRow('photo', 'Клуб фото', 'Серия «туман» — залейте RAW в общий альбом', 'вчера', false, 'all', 'были вчера', 'hatch', 86)}
          ${mockChatRow('retro', 'Ретро-чат', 'Кто-нибудь помнит WinAmp skins?', 'ср', false, 'all', 'онлайн: 4', 'brick', 85)}
          ${mockChatRow('bot', 'Бот', '/help — список команд', 'пн', false, 'all', 'в сети', 'void', 84)}
        </div>
        <div class="guest-preview__col guest-preview__col--thread">
          <div class="guest-thread-head">
            <span class="guest-thread-head__title">Чат</span>
            <span class="guest-thread-head__meta">выберите слева</span>
          </div>
          <div class="guest-thread-messages" hidden></div>
          <div class="guest-thread-empty">Выберите чат слева — здесь появятся сообщения.</div>
          <div class="guest-thread-composer auth-form" hidden>
            <p class="guest-thread-bot-hint text-muted text-sm" data-bot-hint hidden>Команды: <code class="text-secondary">/help</code>, <code class="text-secondary">/ping</code>, <code class="text-secondary">/status</code>, <code class="text-secondary">/tiver</code>, <code class="text-secondary">/зуп</code> — или просто текст.</p>
            <div class="guest-thread-quick" aria-label="Быстрые ответы">
              <button type="button" class="btn btn--ghost btn--sm" data-quick-reply>Ок</button>
              <button type="button" class="btn btn--ghost btn--sm" data-quick-reply>Лол</button>
              <button type="button" class="btn btn--ghost btn--sm" data-quick-reply>+1</button>
              <button type="button" class="btn btn--ghost btn--sm" data-quick-reply>Перезвоню</button>
              <button type="button" class="btn btn--ghost btn--sm" data-quick-reply>?</button>
            </div>
            <div class="guest-thread-compose-row">
              <input class="input guest-thread-compose-input" type="text" maxlength="500" placeholder="Сообщение или команда боту…" aria-label="Текст сообщения" />
              <button type="button" class="btn btn--primary guest-thread-send">Отправить</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  groups: `
    <section class="guest-hero guest-hero--compact card card--pad-lg">
      <p class="guest-hero__eyebrow">Гостевой предпросмотр</p>
      <h1 class="guest-hero__title">Сообщества</h1>
      <p class="guest-hero__lead">Сетка карточек: баннер, тег, название, подписка и ссылка внутрь сообщества.</p>
      <p class="guest-hero__note text-muted">Подписка на «Производственный учёт» открывает тему 1С в настройках; отписка убирает её.</p>
    </section>
    <section class="card card--pad-md">
      <div class="guest-groups-head">
        <div class="guest-groups-head__top">
          <span class="guest-feed-card__title guest-feed-card__title--plain">Каталог</span>
          <button type="button" class="btn btn--secondary btn--sm" id="guest-create-group-btn">Создать сообщество</button>
        </div>
        <div class="guest-groups-head__filters">
          <div class="guest-feed-filters" role="tablist" aria-label="Сортировка каталога">
            <button type="button" class="guest-chip guest-chip--on" data-groups-chip="pop" role="tab" aria-selected="true">Популярное</button>
            <button type="button" class="guest-chip" data-groups-chip="new" role="tab" aria-selected="false">Новые</button>
            <button type="button" class="guest-chip" data-groups-chip="topics" role="tab" aria-selected="false">По темам</button>
          </div>
        </div>
      </div>
      <div class="guest-groups-grid">
        ${mockGroupProdsoft()}
        ${mockGroup('Чтение без скролла', '1,2k подписчиков', 'тема', 'scroll', 'pop topics')}
        ${mockGroup('Ночной деплой', '842', 'оффтоп', 'deploy', 'pop new')}
        ${mockGroup('Мемы про CSS', '5,1k', 'юмор', 'cssmemes', 'pop topics')}
        ${mockGroup('Закрытый канал', 'по приглашению', 'закрыто', 'closed', 'pop topics')}
        ${mockGroup('UI-клуб', '3,4k', 'дизайн', 'ui', 'pop topics')}
        ${mockGroup('Подкасты о коде', '956', 'аудио', 'podcasts', 'pop new')}
      </div>
      <div id="guest-group-auth-modal" class="guest-modal" hidden>
        <div class="guest-modal__backdrop" data-guest-modal-close tabindex="-1"></div>
        <div class="guest-modal__card card card--pad-md" role="dialog" aria-modal="true" aria-labelledby="guest-group-auth-title">
          <button type="button" class="guest-modal__x btn btn--ghost btn--sm" data-guest-modal-close>Закрыть</button>
          <h2 class="guest-modal__title" id="guest-group-auth-title">Сначала авторизуйтесь</h2>
          <p class="text-secondary text-sm">Создание сообщества доступно после входа в аккаунт.</p>
          <div class="actions-row actions-row--start guest-modal__actions">
            <a class="btn btn--primary btn--sm" href="/login">Войти</a>
            <a class="btn btn--secondary btn--sm" href="/register">Регистрация</a>
          </div>
        </div>
      </div>
    </section>
  `,
  friends: `
    <section class="guest-hero guest-hero--compact card card--pad-lg">
      <p class="guest-hero__eyebrow">Гостевой предпросмотр</p>
      <h1 class="guest-hero__title">Друзья</h1>
      <p class="guest-hero__lead">Поиск, блок «онлайн» и полный список — как в адресной книге. Строка ведёт на страницу друга.</p>
      <p class="guest-hero__note text-muted">Фан-посты и фото в профиле — после входа.</p>
    </section>
    <section class="card card--pad-md">
      <div class="guest-friends-toolbar">
        <div class="guest-friends-search" aria-hidden="true"></div>
        <button type="button" class="guest-chip guest-chip--on" data-friends-chip="all">Все</button>
      </div>
      <div class="guest-friends-section">
        <h2 class="guest-friends-section__label">Онлайн</h2>
        <div class="guest-preview__list">
          ${mockFriend('Илья', 'печатает…', 'ilya')}
          ${mockFriend('Саша', 'в сети', 'sasha')}
          ${mockFriend('Оля', 'в игре', 'olya')}
        </div>
      </div>
      <div class="guest-friends-section">
        <h2 class="guest-friends-section__label">Все контакты</h2>
        <div class="guest-preview__list">
          ${mockFriend('Лин', 'не беспокоить', 'lin')}
          ${mockFriend('Марк', 'был(а) недавно', 'mark')}
          ${mockFriend('Катя', 'был(а) вчера', 'katya')}
          ${mockFriend('Вы', 'гость', 'you')}
        </div>
      </div>
    </section>
  `,
  games: `
    <section class="guest-hero guest-hero--compact card card--pad-lg">
      <p class="guest-hero__eyebrow">Гостевой предпросмотр</p>
      <h1 class="guest-hero__title">Игры</h1>
      <p class="guest-hero__lead">Карточки как у сообществ: баннер и краткое описание. Клик — страница игры с каруселью и требованиями.</p>
      <p class="guest-hero__note text-muted">Без магазина — только UI.</p>
    </section>
    <section class="card card--pad-md">
      <div class="guest-games-cats">
        <button type="button" class="guest-chip guest-chip--on" data-games-chip="all">Все</button>
        <button type="button" class="guest-chip" data-games-chip="time">На время</button>
        <button type="button" class="guest-chip" data-games-chip="two">На двоих</button>
        <button type="button" class="guest-chip" data-games-chip="off">Выключено</button>
      </div>
      <div class="guest-games-grid guest-preview__grid--games">
        ${mockGameCard('g2048')}
        ${mockGameCard('gcolor')}
        ${mockGameCard('gquiz')}
        ${mockGameCard('gsnake')}
        ${mockGameCard('gsudoku')}
        ${mockGameCard('gpzl')}
        ${mockGameCard('gtetris')}
        ${mockGameCard('goff')}
      </div>
    </section>
  `,
  settings: `
    <section class="guest-hero guest-hero--compact card card--pad-lg">
      <p class="guest-hero__eyebrow" data-i18n="settings.hero_eyebrow">Гостевой режим</p>
      <h1 class="guest-hero__title" data-i18n="settings.hero_title">Настройки</h1>
      <p class="guest-hero__lead" data-i18n="settings.hero_lead">Тема и язык сохраняются в этом браузере и действуют на весь сайт — и в госте, и после входа.</p>
      <p class="guest-hero__note text-muted" data-i18n="settings.hero_note">Пять цветов палитры темы — ниже, рядом с переключателем.</p>
    </section>
    <section class="card card--pad-lg" aria-labelledby="guest-lang-title">
      <h2 class="guest-feed-card__title" id="guest-lang-title" data-i18n="settings.lang_title">Язык интерфейса</h2>
      <p class="text-secondary guest-settings__lede" data-i18n="settings.lang_lede">Переключение влияет на подписи в подвале и в настройках; часть гостевых экранов пока только на русском.</p>
      <fieldset class="theme-fieldset" data-locale-group>
        <legend class="sr-only">Язык</legend>
        <div class="theme-grid theme-grid--lang">
          <label class="theme-tile">
            <input type="radio" name="tiver-locale" value="ru" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="settings.lang_ru">Русский</span>
              <span class="theme-tile__hint">RU</span>
            </span>
          </label>
          <label class="theme-tile">
            <input type="radio" name="tiver-locale" value="en" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="settings.lang_en">English</span>
              <span class="theme-tile__hint">EN</span>
            </span>
          </label>
        </div>
      </fieldset>
    </section>
    <section class="card card--pad-lg" aria-labelledby="guest-theme-title">
      <h2 class="guest-feed-card__title" id="guest-theme-title" data-i18n="settings.theme_title">Тема интерфейса</h2>
      <p class="text-secondary guest-settings__lede" data-i18n="settings.theme_lede">
        Выберите палитру. Активная тема задаёт пять акцентных «красок» для UI — они же показаны полоской ниже.
      </p>
      <div class="guest-palette-preview" aria-label="Палитра темы (5 цветов)">
        <span class="guest-palette-dot" style="background: var(--palette-1)"></span>
        <span class="guest-palette-dot" style="background: var(--palette-2)"></span>
        <span class="guest-palette-dot" style="background: var(--palette-3)"></span>
        <span class="guest-palette-dot" style="background: var(--palette-4)"></span>
        <span class="guest-palette-dot" style="background: var(--palette-5)"></span>
      </div>
      <fieldset class="theme-fieldset" data-theme-group>
        <legend class="sr-only">Тема</legend>
        <div class="theme-grid" data-theme-tiles>
          <label class="theme-tile">
            <input type="radio" name="tiver-theme" value="dark" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="theme.dark">Тёмная</span>
              <span class="theme-tile__hint" data-i18n="theme.dark_hint">по умолчанию</span>
            </span>
          </label>
          <label class="theme-tile">
            <input type="radio" name="tiver-theme" value="light" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="theme.light">Светлая</span>
              <span class="theme-tile__hint" data-i18n="theme.light_hint">высокий контраст</span>
            </span>
          </label>
          <label class="theme-tile">
            <input type="radio" name="tiver-theme" value="moon" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="theme.moon">Лунная</span>
              <span class="theme-tile__hint" data-i18n="theme.moon_hint">холодный синий</span>
            </span>
          </label>
          <label class="theme-tile">
            <input type="radio" name="tiver-theme" value="sakura" />
            <span class="theme-tile__body">
              <span class="theme-tile__name" data-i18n="theme.sakura">Сакура</span>
              <span class="theme-tile__hint" data-i18n="theme.sakura_hint">розовый акцент</span>
            </span>
          </label>
          <div data-onec-theme-slot class="theme-onec-slot"></div>
        </div>
      </fieldset>
    </section>
    <section class="card card--pad-lg guest-settings-lab" aria-labelledby="guest-lab-title">
      <h2 class="guest-feed-card__title" id="guest-lab-title">Лаборатория гостя</h2>
      <p class="text-secondary guest-settings__lede">Только в этом браузере. Ничего не ломает — максимум слегка меняет настроение.</p>
      <div class="guest-settings-lab__grid">
        <div class="guest-settings-lab__block">
          <label class="copy-lead text-sm" for="guest-universe-slider">Сколько вселенных вы держите в голове?</label>
          <div class="guest-settings-lab__row">
            <input id="guest-universe-slider" type="range" min="0" max="11" value="1" data-guest-universe-slider class="guest-settings-lab__range" />
            <span class="guest-settings-lab__value text-muted text-sm" data-guest-universe-value>1</span>
          </div>
          <p class="text-muted text-sm guest-settings-lab__science" data-guest-universe-caption>Научный вывод появится после движения ползунка.</p>
        </div>
        <div class="guest-settings-lab__block">
          <p class="copy-lead text-sm">Терапия железа</p>
          <button type="button" class="btn btn--secondary" data-guest-ram-scratch>Почесать оперативку</button>
          <p class="text-muted text-sm guest-settings-lab__ram" data-guest-ram-hint hidden>Оперативная память благодарит. +0 к FPS, зато морально теплее.</p>
        </div>
        <div class="guest-settings-lab__block">
          <label class="guest-settings-lab__check">
            <input type="checkbox" data-guest-cup-toggle />
            <span>Показать одобрение модератора кружки</span>
          </label>
          <p class="text-muted text-sm" data-guest-cup-msg hidden>Модератор кружки одобряет ваш выбор темы. Чай считается зачтённым.</p>
        </div>
      </div>
    </section>
  `,
};

export function buildGuestCommentsHtml(commentCount, override) {
  return guestPostCommentsHtml(feedCommentsForCount(commentCount, override));
}

export function renderGuestMain({ segment, communitySlug = '', friendSlug = '', gameId = '' } = {}) {
  if (segment === 'community') {
    return renderCommunityPage(communitySlug || '');
  }
  if (segment === 'friend') {
    return renderFriendPage(friendSlug || '');
  }
  if (segment === 'game') {
    return renderGamePage(gameId || '');
  }
  const key = PREVIEW[segment] ? segment : 'feed';
  const body = PREVIEW[key];
  const cta =
    segment === 'settings'
      ? ''
      : `
    <section class="card card--pad-md guest-cta">
      <p class="guest-cta__text text-secondary" data-i18n="guest.cta">
        Всё выше — клиентский театр: безопасно крутить на демо и перед коллегами, пока бэкенд не проснулся.
      </p>
      <div class="actions-row actions-row--start">
        <a class="btn btn--primary" href="/login" data-i18n="guest.login">Войти</a>
        <a class="btn btn--secondary" href="/register" data-i18n="guest.register">Регистрация</a>
      </div>
    </section>
  `;

  return `${body}${cta}`;
}
