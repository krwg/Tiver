/**
 * Интерактивные демо в гостевом режиме: лента, чаты, 1С, бот.
 */

import { setTheme, getTheme, reconcileThemeAfterStorage } from '../../lib/theme.js';
import { isProdsoftSubbed, isCommunitySubbed, setCommunitySub, STORAGE_SUBS } from '../../lib/guestSubs.js';
import { buildGuestCommentsHtml } from './guestContent.js';

const CHAT_MESSAGES = {
  mama: [
    { out: false, text: 'Ужин через час?' },
    { out: true, text: 'Да, успею.' },
    { out: false, text: 'Ок, жду.' },
    { out: false, text: 'Кстати, десерт не забудь — мороженое тает в дороге.' },
    { out: true, text: 'Взял термосумку, всё под контролем.' },
    { out: false, text: 'Ты лучший. Не спорь.' },
  ],
  team: [
    { out: false, author: 'Лид фронта', text: 'Архив: снова оригинальные CSS из 2021, без «стекла» поверх.' },
    { out: true, text: 'Отлично, проверю на телефоне.' },
    { out: false, author: 'Дизайн', text: 'Кнопка 2026 только в chrome.css — не лезет в вёрстку.' },
    { out: true, text: 'На iOS Safari тоже ок — проверил в эмуляторе.' },
    { out: false, author: 'Продакт', text: 'Тогда вливаю в релиз-ноты одной строкой.' },
    { out: false, author: 'Маркетинг', text: 'Кто-нибудь снимет короткое видео для демо?' },
    { out: true, text: 'Сниму завтра утром, свет лучше.' },
  ],
  bot: [
    { out: false, text: 'Доступные команды: /help, /ping, /status' },
    { out: true, text: '/help' },
    { out: false, text: 'Вы гость. Живые данные позже.' },
    { out: true, text: '/ping' },
    { out: false, text: 'pong — цикл событий жив.' },
    { out: true, text: 'А если серьёзно — когда бэкенд?' },
    { out: false, text: 'Когда будет готов. Я пока только тексты и таймеры.' },
  ],
  onec: [
    { out: false, text: 'Коллеги, обновление ЗУП — в пятницу после обеда. Кофе обеспечим.' },
    { out: true, text: 'Запятая в СКД на месте или это фича?' },
    { out: false, text: 'Это не баг, это «расширенная диагностика ожиданий бизнеса».' },
    { out: true, text: 'Ок, тогда в отчёт пишу «ожидаемое поведение».' },
    { out: false, text: 'Не забудьте тестовую базу — в пятницу без неё никак.' },
    { out: true, text: 'Уже накатил копию, жду дампа.' },
  ],
  dr: [
    { out: false, text: 'Результаты загружены в раздел «Документы».' },
    { out: true, text: 'Спасибо, посмотрю вечером.' },
    { out: false, text: 'Если вопросы — напишите, отвечу до 20:00.' },
    { out: true, text: 'Хорошо, тогда завтра уточню по анализу.' },
  ],
  work: [
    { out: false, text: 'Дедлайн по макетам — пятница 18:00.' },
    { out: true, text: 'Успеем, если без новых фич.' },
    { out: false, text: 'Ок, фиксирую в доске.' },
    { out: true, text: 'Добавили только правку копирайта — это не фича?' },
    { out: false, text: 'Считаем не фичей. Но в changelog всё равно строка.' },
    { out: false, text: 'Ревью дизайна в 15:00 — кто свободен, кидайте реакцию ✅' },
    { out: true, text: 'Буду.' },
  ],
  spam: [
    { out: false, text: 'Скидка 12% на годовую подписку…' },
    { out: true, text: 'Отписаться.' },
    { out: false, text: 'Понял, больше не шлём.' },
    { out: false, text: 'Если передумаете — промокод TIVER2026 ещё неделю.' },
    { out: true, text: 'Не надо, спасибо.' },
  ],
  nina: [
    { out: false, text: 'Завтра кофе в 11:00 — ты как?' },
    { out: true, text: 'Да, подойду. Место то же у окна?' },
    { out: false, text: 'Да, я уже забронировала столик на двоих.' },
    { out: true, text: 'Супер, захвачу зарядку на всякий.' },
    { out: false, text: 'И расскажи про тот баг в ленте — так и не поняла из треда.' },
  ],
  support: [
    { out: false, text: 'Здравствуйте! Тикет #2048 в работе.' },
    { out: true, text: 'Спасибо. Когда ориентир по ответу?' },
    { out: false, text: 'Обычно до 24 ч. Если срочно — отметьте приоритет в форме.' },
    { out: true, text: 'Ок, отметил «высокий».' },
    { out: false, text: 'Приняли. Коллега из смены уже смотрит логи.' },
    { out: true, text: 'Отлично, жду.' },
  ],
  photo: [
    { out: false, text: 'Серия «туман» — залейте RAW в общий альбом до вечера.' },
    { out: true, text: 'Залил три кадра, проверьте экспозицию на третьем.' },
    { out: false, text: 'Третий чуть пере — но лечится в лайте. Круто по настроению.' },
    { out: true, text: 'Согласен, оставлю как есть.' },
    { out: false, text: 'Кто хочет — завтра разбор в Zoom в 19:00.' },
  ],
  retro: [
    { out: false, text: 'Кто-нибудь помнит WinAmp skins?' },
    { out: true, text: 'Помню. У меня до сих пор где-то llama.wsz.' },
    { out: false, text: 'Легенда. Кидайте в общий диск, соберём «музей».' },
    { out: true, text: 'У меня только MilkDrop и ностальгия.' },
    { out: false, text: 'Тоже считается. Главное — визуальный шум.' },
  ],
  askui: [
    { out: false, author: 'Рекрут', text: 'Гость, подскажешь: пиксель в госте — это навсегда или A/B?' },
    { out: false, author: 'Стажёр', text: 'А если Tiver без буквы T — это вообще тот же продукт? Хахахаха.' },
    { out: false, author: 'Дизайнер', text: '67% макета готово — можно ли уже постить скрин в ленту-заглушку?' },
  ],
  askcode: [
    { out: false, author: 'Джун', text: 'Гость, у вас же нет аккаунта — как тогда тестить API? Или это магия?' },
    { out: false, author: 'Сеньор', text: 'Нужен честный ответ: роутер тут настоящий или театр?' },
    { out: false, author: 'QA', text: 'Можешь ответить одним словом: «шипит» или «не шипит»?' },
  ],
  askzup: [
    { out: false, author: 'Бухгалтер', text: 'Гость, после обновления ЗУП не сходится сальдо — что делать первым делом?' },
    { out: false, author: 'Кадры', text: 'Подскажи: отпуск в переносе периода — это песня или оперетта?' },
    { out: false, author: 'ИТ', text: 'cf/cu на пятницу — обязательны или можно «как получится»?' },
  ],
};

const CHAT_LABELS = {
  mama: { title: 'Мама', meta: 'личный чат', presence: 'в сети' },
  team: { title: 'Команда Tiver', meta: '6 участников', presence: 'в сети' },
  bot: { title: 'Бот', meta: 'системный', presence: 'в сети' },
  onec: { title: '1С · общий', meta: 'ERP и запятая', presence: 'в сети' },
  dr: { title: 'Доктор', meta: 'здоровье', presence: 'был(а) недавно' },
  work: { title: 'Рабочий чат', meta: 'команда продукта', presence: 'в сети' },
  spam: { title: 'Рассылка', meta: 'маркетинг', presence: 'бот' },
  nina: { title: 'Нина', meta: 'личный чат', presence: 'в сети' },
  support: { title: 'Поддержка Tiver', meta: 'тикеты', presence: 'в сети' },
  photo: { title: 'Клуб фото', meta: '12 участников онлайн', presence: 'онлайн: 12' },
  retro: { title: 'Ретро-чат', meta: 'оффтоп', presence: 'был(а) вчера' },
  askui: { title: 'Вопросы к гостю · UI', meta: 'ждут ответа', presence: 'в сети' },
  askcode: { title: 'Вопросы к гостю · код', meta: 'ждут ответа', presence: 'были недавно' },
  askzup: { title: 'Вопросы к гостю · ЗУП', meta: '1С-юмор', presence: 'в сети' },
};

const PEER_REPLIES = {
  mama: [
    'Ок ❤️',
    'Уже выхожу',
    'Мам, я на созвоне',
    'Через 15 мин',
    'Захвачу хлеб по дороге',
    'Ты права, без десерта нельзя',
    'Перезвоню с лестницы',
    'Сделаю, обещаю',
    'Люблю',
    'Успею даже если метро злое',
  ],
  team: [
    'Залил ветку',
    'Линтер молчит — подозрительно',
    'LGTM с оговоркой',
    'RFC написал',
    'Скринкаст приложил',
    'На стейдже проверю',
    'Дифф на 12 строк — почти идеал',
    'Мержу после обеда',
    'У меня варнинг только в комменте',
    'Перекину в дизайн-чат',
  ],
  dr: [
    'Понял, спасибо',
    'Запишусь на приём',
    'Ок, изучу вложения',
    'Результаты скачал',
    'Вопросов пока нет',
    'Отчёт перешлю коллеге',
    'Спасибо за оперативность',
    'Завтра гляну спокойно',
    'Документы на флешке сохранил',
    'До связи',
  ],
  work: [
    'Зафиксировал',
    'Нужен ещё один день',
    'В Jira уже',
    'Сделаю к EOD',
    'Поставил себе напоминание',
    'Уточню у дизайна и отпишусь',
    'Риски прописал в карточке',
    'Согласен с дедлайном',
    'Блокеров нет',
    'Пингую в общем канале',
  ],
  spam: [
    'Не надо',
    'Ок, оставьте скидку',
    'Удалите из базы',
    'В спам больше не надо',
    'Промокод запомнил, но не сейчас',
    'Отписка окончательная',
    'Нет, спасибо',
    'Мне и так хорошо',
    'Письма не открываю',
    'Стоп',
  ],
  nina: [
    'Договорились',
    'Перенесём на вечер?',
    'Я за 10 мин',
    'Захвачу печенье',
    'Ок, 11:00 вижу',
    'Окно у стекла — топ',
    'Могу на 15 мин позже',
    'Напишу как выйду',
    'Кофе тебе как обычно?',
    'Про баг — вечером расскажу голосом',
  ],
  support: [
    'Понял, жду',
    'Логи приложил в тикет',
    'Спасибо за скорость',
    'Ок, проверю',
    'Номер тикета записал',
    'Если нужно — скину HAR',
    'Жду апдейт от инженера',
    'Повторю шаги и отпишусь',
    'Критичность согласована',
    'На связи',
  ],
  photo: [
    'Залью вечером',
    'Красивый кадр',
    'RAW на диске',
    '+1 к созвону',
    'Экспозицию чуть подтяну',
    'Отличная серия',
    'В альбом закинул',
    'Завтра гляну на большом экране',
    'Цвета берегу',
    'Можно в печать почти',
  ],
  retro: [
    'WinAmp forever',
    'У меня только VLC',
    'Скиньте ссылку на архив',
    'Ностальгия бьёт',
    'Bento skin был лучшим',
    'MilkDrop на втором мониторе',
    'У меня до сих пор mp3-папка',
    'Потом обязательно залью',
    'Это уже музей',
    'Лампа всё ещё прыгает',
  ],
  askui: [
    'Пиксель — это настроение, не A/B. Хахахаха.',
    'Буква T в Tiver — как якорь: без неё это просто «iver», и никто не купит.',
    '67% — это уже почти релиз. Постим скрин, но с дисклеймером.',
    'Гость видит театр: роутер настоящий, данные — декорации.',
    'Если серьёзно: всё локально, бэкенд спит.',
    'UI-полиция одобряет пиксель до лучших времён.',
    'Мы не спорим с пикселем — мы его любим.',
    'Заглушка честнее половины «coming soon» в индустрии.',
    'T — как «trust the process».',
    'Скрин в закреп, и пусть лайкают.',
    'Гость ≠ тестировщик, но фидбек ценим.',
    'Про A/B: пока один вариант — тот, что вы видите.',
  ],
  askcode: [
    'Магия называется «демо без аккаунта». Роутер — настоящий.',
    'Театр с хорошим сценарием: навигация живая, API — позже.',
    'Шипит ровно настолько, насколько вы в это верите.',
    'Если не шипит — проверьте звук. Шутка. Пока «не шипит».',
    'Гость тестит UX, не прод. Это фича.',
    'Буква T в diff — знак качества.',
    '67 строк без багов — рекорд недели.',
    'Хахахаха, но честно: пока только фронт.',
    'Локальный стор — наш прод на минуту.',
    'Когда бэкенд — обещаем не скучать.',
    'Роутер не врёт. Остальное — декорации.',
    'API в голове, контракт в сердце.',
  ],
  askzup: [
    'Первым делом — кофе. Потом бэкап. Потом уже cf/cu.',
    'Отпуск в переносе — это опера «не будите буха».',
    'cf/cu в пятницу — как bungee: страшно, но по регламенту.',
    'Типовая не виновата — классика, хахахаха.',
    'Сверка с обменом — и спать спокойно.',
    'Буква T в ЗУП — табель, не мем. Но мем тоже ок.',
    '67 отчётов в очереди — повод для чая.',
    'Ошибка «поле не обнаружено» — четверг в чистом виде.',
    'Обновление конфигурации: сначала копия, потом геройство.',
    'ЗУП шепчет: «ещё один регламент и я домой».',
    'Расширение без поддержки — как спагетти без вилки.',
    'Локальный мем: «обмен прошёл — можно жить».',
  ],
  onec: [
    'Провёл тест на копии — всё жёлтое, как надо.',
    'Типовая не виновата. Виноват тот, кто нажал «Да» без бэкапа.',
    'Обновили платформу — теперь и правда «всё поехало», но по регламенту.',
    'Запятая — это не баг, это контур интеграции с бизнесом.',
    'В отчёт добавил скрин из конфигуратора',
    'Сверка с обменом — в пятницу',
    'Кофе обещали — держим слово',
    'Регламент прочитал дважды',
    'На тестовой базе ок',
    'Жду финального ок от буха',
  ],
};

const BOT_PROJECT = [
  'Tiver — соцсеть в разработке: сейчас вы в гостевом предпросмотре (SPA, локальные счётчики, без живого API).',
  'Проект: веб-клиент, пиксель-эстетика в госте, темы (в т.ч. 1С после подписки на «Производственный учёт»), роутер навигации — уже в сборке.',
  'Дорожная карта (макет): лента, сообщества, сообщения, профили друзей, мини-игры — всё как «театр», пока бэкенд не подключён.',
];

const BOT_HELP = [
  'Команды: /help — список. /ping — проверка. /status — «процессы». /tiver или /project — что за Tiver. /1с или /зуп — шутка для ERP.',
  '/help: я бот-заглушка, но стараюсь. /ping — жив ли цикл событий. /status — честный отчёт. /tiver — коротко о демо.',
  'Шпаргалка: /ping для нервов, /status для начальства, /tiver для коллег, /help когда забыли всё.',
];

const BOT_PING = ['pong', 'pong (TTL≈42ms, честно придумал)', 'pong — и ни одного segfault', 'pong. Redis бы гордился.'];

const BOT_STATUS = [
  'Все зелёные индикаторы — нарисованы в CSS.',
  'Процессы спят. Один процесс притворяется, что работает.',
  'Статус: как у npm install — вроде идёт, а вроде уже час.',
];

const BOT_ONEC = [
  'ЗУП шепчет: «сначала копия, потом геройство».',
  'СКД и запятая — вечная драма. Типовая тут ни при чём.',
  'cf/cu по пятницам — только с кофе и бэкапом.',
  'Ошибка после обновления? Кэш сеанса, перезапуск, чай. Порядок не менять.',
  'Буква T — табель. Или Tiver. Контекст решает.',
];

const BOT_DEFAULT = [
  'Принял. В проде это ушло бы в очередь.',
  'Интересная мысль. Записал в /dev/null для истории.',
  'Обработал за O(1) — правда, ответ заранее известен.',
  'Это не в моём backlog. Попробуйте человека слева.',
  'Ок, положил в стек «когда-нибудь».',
  'Звучит как план. Я пока без плана, но поддерживаю.',
  'Если бы у меня были руки — я бы апплодировал.',
  'Сохранил в RAM. RAM не против.',
  'Мой любимый протокол — честный nod.',
  'Перефразирую: «да», но художественно.',
];

function onProdsoftSubscribe() {
  setCommunitySub('prodsoft', true);
  setTheme('onec');
}

function onProdsoftUnsubscribe() {
  setCommunitySub('prodsoft', false);
  if (getTheme() === 'onec') setTheme('dark');
  reconcileThemeAfterStorage();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickReplyAuthorForChat(id) {
  const msgs = CHAT_MESSAGES[id];
  if (!msgs) return CHAT_LABELS[id]?.title || 'Собеседник';
  const authors = [...new Set(msgs.filter((m) => !m.out && m.author).map((m) => m.author))];
  if (authors.length) return pick(authors);
  return CHAT_LABELS[id]?.title || 'Собеседник';
}

function renderBubbles(messages, chatId) {
  const peer = CHAT_LABELS[chatId]?.title || 'Собеседник';
  return messages
    .map((m) => {
      const who = m.author || (m.out ? 'Вы' : peer);
      return `<div class="guest-thread-bubble guest-thread-bubble--${m.out ? 'out' : 'in'}"><span class="guest-thread-bubble__author">${escapeHtml(who)}</span><span class="guest-thread-bubble__text">${escapeHtml(m.text)}</span></div>`;
    })
    .join('');
}

function onecChatRowHtml() {
  return `
    <button type="button" class="guest-chat-row" data-chat="onec" data-msg-cat="work" data-chat-stamp="94">
      <div class="guest-chat-row__avatar guest-geo-avatar guest-geo-avatar--grid" aria-hidden="true"></div>
      <div class="guest-chat-row__mid">
        <span class="guest-chat-row__name">1С · общий</span>
        <span class="guest-chat-row__preview">Типовая не виновата…</span>
      </div>
      <div class="guest-chat-row__meta">
        <span class="guest-chat-row__time">сейчас<span class="guest-chat-row__dot" aria-hidden="true"></span></span>
        <span class="guest-chat-row__presence guest-chat-row__presence--online">в сети</span>
      </div>
    </button>
  `;
}

function userPostHtml(text) {
  const safe = escapeHtml(text);
  return `
    <article class="guest-post guest-post--in" data-guest-post-kind="people">
      <div class="guest-post__avatar" aria-hidden="true"></div>
      <div class="guest-post__maincol">
        <div class="guest-post__body">
          <header class="guest-post__head">
            <span class="guest-post__name">Вы</span>
            <span class="guest-post__time">только что</span>
          </header>
          <p class="guest-post__text">${safe}</p>
        </div>
        <div class="guest-post__actions guest-post__actions--pixel">
          <button type="button" class="guest-post__like guest-pixbtn" aria-pressed="false" aria-label="Нравится" data-like-base="0">
            <span class="guest-pixbtn__glyph" aria-hidden="true">◆</span>
            <span class="guest-pixbtn__n guest-pixbtn__n--like" data-like-n>0</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-comment aria-label="Комментарии" aria-expanded="false">
            <span class="guest-pixbtn__glyph" aria-hidden="true">□</span>
            <span class="guest-pixbtn__n" data-count>0</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-repost aria-label="Репост">
            <span class="guest-pixbtn__glyph" aria-hidden="true">↻</span>
            <span class="guest-pixbtn__n" data-count>0</span>
          </button>
        </div>
        ${buildGuestCommentsHtml(0)}
      </div>
    </article>
  `;
}

function onecFeedPostHtml() {
  const comments = buildGuestCommentsHtml(12, [
    {
      who: 'Анна',
      text: 'Конфигуратор 8.5 в полноэкранном: крестик исчезает, случайный клик — и весь сеанс без предупреждения. Классика жанра.',
      avatar: 'hatch',
      slug: 'anna_feed',
    },
    { who: 'Пётр', text: '«Запланированная стабильность» 8.5: слева асинхронность, справа ты ждёшь, пока платформа перестанет лагать.', avatar: 'brick', slug: 'petr_feed' },
    { who: 'Вы (гость)', text: 'Локально всё честно подсвечено. На КОРПе тестил — у заказчика базовая, это отдельный квест.', avatar: 'guest', slug: 'guest_you_feed' },
    { who: 'ЗУП-бот', text: 'cf/cu в пятницу — только с копией. Иначе ЗУП 3.1 с базой по вычетам превращается в детектив без финала.', avatar: 'grid', slug: 'zup_bot_feed' },
    {
      who: 'СКД-guru',
      text: 'ERP 2.5: над водой «правила факта идеальны», под водой «Расход в ЭтапеПроизводства пустой и синк с БП сломал склад».',
      avatar: 'dots',
      slug: 'skd_guru_feed',
    },
    { who: 'Бух', text: 'Красная таблетка — «ЗУП 8.5», синяя — «7.7». На 7.7 не забудь процедуры в заголовке модуля. Честный кринж.', avatar: 'cross', slug: 'buh_feed' },
    { who: 'Олег', text: 'УНФ на 8.5: «не соскочить с лабораторной крысы». Коллега отвечает: «Примите соболезнования с вашим горем (УНФ)».', avatar: 'void', slug: 'oleg_feed' },
    { who: 'Модератор', text: 'А ты заполнил закладку «Расход в ЭтапеПроизводства 2.5»? T в отчёте — табель, не опечатка.', avatar: 'hatch', slug: 'mod_feed_1c' },
    { who: 'Кадры', text: 'ЗУП после обмена — как понедельник: ожидаемо. ДЕБЕТ в ERP — отдельная карточная сцена, там только кредит.', avatar: 'brick', slug: 'kadry_feed' },
    { who: 'Илья', text: 'Заповедник: «осторожно, динамическое планирование» — и ошибка при заполнении видов рабочих центров. Смотрите под ноги.', avatar: 'grid', slug: 'ilya_feed' },
    { who: 'Лин', text: 'Расширение без поддержки — как спагетти без вилки. Типовая не виновата, но обмен проверьте.', avatar: 'dots', slug: 'lin_feed' },
    { who: 'Саша', text: 'Тестировал на КОРПе, а у заказчика базовая — мем про абстрактный ужас, без картинки, зато с болью в одном предложении.', avatar: 'cross', slug: 'sasha_feed' },
  ]);
  return `
    <article class="guest-post guest-post--1c guest-post--in" data-guest-post-kind="article" data-guest-onec-post="1">
      <div class="guest-post__avatar" aria-hidden="true"></div>
      <div class="guest-post__maincol">
        <div class="guest-post__body">
          <header class="guest-post__head">
            <span class="guest-post__name">1С · лента</span>
            <span class="guest-post__time">тема</span>
          </header>
          <p class="guest-post__text">Секретная тема активна: палитра, баннер и этот пост — награда за любопытство к «Производственному учёту».</p>
          <p class="guest-post__text guest-post__text--muted">Перед обновлением — бэкап, кофе и честный разговор с обменом.</p>
        </div>
        <div class="guest-post__actions guest-post__actions--pixel">
          <button type="button" class="guest-post__like guest-pixbtn" aria-pressed="false" aria-label="Нравится" data-like-base="0">
            <span class="guest-pixbtn__glyph" aria-hidden="true">◆</span>
            <span class="guest-pixbtn__n guest-pixbtn__n--like" data-like-n>0</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-comment aria-label="Комментарии" aria-expanded="false">
            <span class="guest-pixbtn__glyph" aria-hidden="true">□</span>
            <span class="guest-pixbtn__n" data-count>12</span>
          </button>
          <button type="button" class="guest-post__side guest-pixbtn" data-guest-repost aria-label="Репост">
            <span class="guest-pixbtn__glyph" aria-hidden="true">↻</span>
            <span class="guest-pixbtn__n" data-count>4</span>
          </button>
        </div>
        ${comments}
      </div>
    </article>
  `;
}

function bumpCount(btn, delta) {
  const n = btn.querySelector('[data-count]');
  if (!n) return;
  const cur = parseInt(n.textContent || '0', 10) || 0;
  n.textContent = String(Math.max(0, cur + delta));
}

function syncCommunitySubButton(btn) {
  const slug = btn.getAttribute('data-sub-slug');
  if (!slug) return;
  const subbed = isCommunitySubbed(slug);
  btn.textContent = subbed ? 'Отписаться' : 'Подписаться';
  btn.classList.toggle('btn--secondary', subbed);
  btn.classList.toggle('btn--primary', !subbed);
}

function syncAllCommunitySubButtons() {
  document.querySelectorAll('.guest-community-toggle-sub[data-sub-slug]').forEach(syncCommunitySubButton);
}

function guestPendingRequestKey(slug) {
  return `tiver-guest-pending-request-${slug}`;
}

function syncGuestRequestButtons(scope = document) {
  scope.querySelectorAll('[data-guest-request-sub][data-sub-slug]').forEach((b) => {
    const slug = b.getAttribute('data-sub-slug');
    if (!slug || localStorage.getItem(guestPendingRequestKey(slug)) !== '1') return;
    b.textContent = 'Ваша заявка рассматривается';
    b.disabled = true;
    b.setAttribute('aria-disabled', 'true');
    b.classList.remove('btn--primary');
    b.classList.add('btn--secondary');
  });
}

let communitySubDelegation = false;
function ensureCommunitySubDelegation() {
  if (communitySubDelegation) return;
  communitySubDelegation = true;
  document.addEventListener('click', (e) => {
    const reqBtn = e.target.closest('[data-guest-request-sub][data-sub-slug]');
    if (reqBtn) {
      e.preventDefault();
      e.stopPropagation();
      const slug = reqBtn.getAttribute('data-sub-slug');
      if (!slug || reqBtn.disabled) return;
      if (localStorage.getItem(guestPendingRequestKey(slug)) === '1') return;
      localStorage.setItem(guestPendingRequestKey(slug), '1');
      reqBtn.textContent = 'Ваша заявка рассматривается';
      reqBtn.disabled = true;
      reqBtn.setAttribute('aria-disabled', 'true');
      reqBtn.classList.remove('btn--primary');
      reqBtn.classList.add('btn--secondary');
      return;
    }
    const btn = e.target.closest('.guest-community-toggle-sub[data-sub-slug]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const slug = btn.getAttribute('data-sub-slug');
    if (!slug) return;
    if (isCommunitySubbed(slug)) {
      setCommunitySub(slug, false);
      if (slug === 'prodsoft') onProdsoftUnsubscribe();
    } else {
      setCommunitySub(slug, true);
      if (slug === 'prodsoft') onProdsoftSubscribe();
    }
    syncAllCommunitySubButtons();
  });
  window.addEventListener('tiver-community-subs', syncAllCommunitySubButtons);
  window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_SUBS) syncAllCommunitySubButtons();
  });
}

function toggleGuestPostComments(postRoot, triggerBtn) {
  const panel = postRoot.querySelector('[data-guest-comments-panel]');
  if (!panel) return;
  const opening = panel.hasAttribute('hidden');
  if (opening) {
    panel.removeAttribute('hidden');
    triggerBtn?.setAttribute('aria-expanded', 'true');
    const input = postRoot.querySelector('.guest-post-comments__input');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    input?.focus();
  } else {
    panel.setAttribute('hidden', '');
    triggerBtn?.setAttribute('aria-expanded', 'false');
  }
}

function wireGuestPostComments(scope) {
  scope.querySelectorAll('.guest-post-comments__send').forEach((btn) => {
    if (btn.dataset.guestDemoComments) return;
    btn.dataset.guestDemoComments = '1';
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.guest-post-comments');
      const post = btn.closest('.guest-post') || btn.closest('.guest-cpost');
      const inp = wrap?.querySelector('.guest-post-comments__input');
      const list = wrap?.querySelector('.guest-post-comments__list');
      const raw = (inp?.value || '').trim();
      if (!raw || !list) return;
      wrap?.querySelector('[data-guest-comments-placeholder]')?.remove();
      const li = document.createElement('li');
      li.className = 'guest-post-comments__item';
      li.innerHTML = `<a href="/guest/friend/you" class="guest-post-comments__profile"><span class="guest-geo-avatar guest-geo-avatar--guest" aria-hidden="true"></span><span class="guest-post-comments__stack"><span class="guest-post-comments__who">Вы</span><span class="guest-post-comments__text">${escapeHtml(raw)}</span></span></a>`;
      list.appendChild(li);
      if (inp) inp.value = '';
      const cbtn = post?.querySelector('[data-guest-comment]');
      if (cbtn) bumpCount(cbtn, 1);
    });
  });
}

function wirePostEngagement(scope) {
  scope.querySelectorAll('.guest-post__like').forEach((btn) => {
    if (btn.dataset.guestDemoEngaged) return;
    btn.dataset.guestDemoEngaged = '1';
    const n = btn.querySelector('[data-like-n]');
    if (n && btn.dataset.likeBase === undefined) btn.dataset.likeBase = String(parseInt(n.textContent || '0', 10) || 0);
    btn.addEventListener('click', () => {
      const base = parseInt(btn.dataset.likeBase ?? '0', 10) || 0;
      const on = btn.getAttribute('aria-pressed') === 'true';
      const next = !on;
      btn.setAttribute('aria-pressed', String(next));
      btn.classList.toggle('guest-post__like--on', next);
      if (n) n.textContent = String(base + (next ? 1 : 0));
    });
  });
  scope.querySelectorAll('[data-guest-comment]').forEach((btn) => {
    if (btn.dataset.guestDemoEngaged) return;
    btn.dataset.guestDemoEngaged = '1';
    btn.addEventListener('click', () => {
      const post = btn.closest('.guest-post') || btn.closest('.guest-cpost');
      if (post) toggleGuestPostComments(post, btn);
    });
  });
  scope.querySelectorAll('[data-guest-repost]').forEach((btn) => {
    if (btn.dataset.guestDemoEngaged) return;
    btn.dataset.guestDemoEngaged = '1';
    btn.addEventListener('click', () => {
      btn.classList.toggle('guest-post__side--on');
      bumpCount(btn, btn.classList.contains('guest-post__side--on') ? 1 : -1);
    });
  });
  wireGuestPostComments(scope);
}

function applyFeedFilter(root, kind) {
  root.querySelectorAll('.guest-post[data-guest-post-kind]').forEach((post) => {
    if (post.classList.contains('guest-post--legacy')) {
      post.hidden = false;
      return;
    }
    const k = post.getAttribute('data-guest-post-kind');
    const show = kind === 'all' || k === kind;
    post.hidden = !show;
  });
}

const FEED_FILTER_NOTES = {
  all: 'Показаны все типы постов.',
  photo: 'Фильтр: только посты с пометкой «фото».',
  article: 'Фильтр: статьи и длинные заметки.',
  people: 'Фильтр: персональные посты.',
};

function syncTablistAria(root, selector, activeChip) {
  root.querySelectorAll(selector).forEach((c) => {
    c.setAttribute('aria-selected', c === activeChip ? 'true' : 'false');
  });
}

function wireChipGroup(root, selector, onSelect) {
  const chips = [...root.querySelectorAll(selector)];
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('guest-chip--on'));
      chip.classList.add('guest-chip--on');
      onSelect(chip);
    });
  });
}

function syncOnecChatRow(root) {
  const slot = root.querySelector('#guest-chat-1c-slot');
  if (!slot) return;
  if (isProdsoftSubbed()) {
    slot.hidden = false;
    slot.dataset.chatStamp = '94';
    if (!slot.querySelector('[data-chat="onec"]')) {
      slot.innerHTML = onecChatRowHtml();
    }
  } else {
    slot.innerHTML = '';
    slot.hidden = true;
    slot.dataset.chatStamp = '0';
  }
}

function initFeedDemo(root, reducedMotion) {
  const stream = root.querySelector('#guest-feed-dynamic') || root.querySelector('#guest-feed-stream');
  const banner = root.querySelector('#guest-feed-1c-banner');
  const input = root.querySelector('.guest-composer__input');
  const send = root.querySelector('.guest-composer__send');

  const posts = stream ? stream.querySelectorAll('.guest-post') : root.querySelectorAll('.guest-post');
  posts.forEach((el, i) => {
    if (reducedMotion) {
      el.classList.add('guest-post--in');
      return;
    }
    requestAnimationFrame(() => {
      window.setTimeout(() => el.classList.add('guest-post--in'), 40 + i * 70);
    });
  });

  wirePostEngagement(root);

  root.querySelectorAll('.guest-widget__row').forEach((row) => {
    row.addEventListener('click', () => row.classList.toggle('guest-widget__row--flash'));
  });

  function sync1cFeed() {
    if (banner) banner.hidden = !isProdsoftSubbed();
    if (isProdsoftSubbed() && stream && !stream.querySelector('[data-guest-onec-post]')) {
      stream.insertAdjacentHTML('afterbegin', onecFeedPostHtml());
      wirePostEngagement(stream);
    }
    if (!isProdsoftSubbed() && stream) {
      stream.querySelector('[data-guest-onec-post]')?.remove();
    }
  }
  sync1cFeed();
  window.addEventListener('tiver-community-subs', sync1cFeed);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_SUBS) sync1cFeed();
  });

  let feedFilter = 'all';
  const noteEl = root.querySelector('#guest-feed-filter-note');
  const emptyEl = root.querySelector('#guest-feed-empty-hint');
  const feedChips = [...root.querySelectorAll('[data-feed-chip]')];

  function refreshFeedUi(kind) {
    applyFeedFilter(root, kind);
    if (noteEl) noteEl.textContent = FEED_FILTER_NOTES[kind] ?? '';
    const dynamic = root.querySelector('#guest-feed-dynamic');
    if (dynamic && emptyEl) {
      const visible = [...dynamic.querySelectorAll('.guest-post')].filter((p) => !p.hidden);
      emptyEl.hidden = visible.length > 0;
    }
  }

  feedChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      feedChips.forEach((c) => c.classList.remove('guest-chip--on'));
      chip.classList.add('guest-chip--on');
      feedFilter = chip.getAttribute('data-feed-chip') || 'all';
      syncTablistAria(root, '[data-feed-chip]', chip);
      refreshFeedUi(feedFilter);
    });
  });
  syncTablistAria(root, '[data-feed-chip]', feedChips.find((c) => c.classList.contains('guest-chip--on')) || feedChips[0]);
  refreshFeedUi('all');

  function publish() {
    const text = (input?.value || '').trim();
    if (!text || !stream) return;
    stream.insertAdjacentHTML('afterbegin', userPostHtml(text));
    if (input) input.value = '';
    const first = stream.querySelector('.guest-post');
    if (first) {
      if (!reducedMotion) {
        first.classList.remove('guest-post--in');
        void first.offsetWidth;
      }
      first.classList.add('guest-post--in');
      wirePostEngagement(first);
    }
    refreshFeedUi(feedFilter);
  }

  send?.addEventListener('click', publish);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      publish();
    }
  });
}

function botReply(text) {
  const t = text.trim().toLowerCase();
  if (t === '/help') return pick(BOT_HELP);
  if (t === '/ping') return pick(BOT_PING);
  if (t === '/status') return pick(BOT_STATUS);
  if (t === '/tiver' || t === '/project') return pick(BOT_PROJECT);
  if (t === '/1с' || t === '/1c' || t === '/зуп' || t === '/zup') return pick(BOT_ONEC);
  return pick(BOT_DEFAULT);
}

function initMessagesDemo(root) {
  const threadTitle = root.querySelector('.guest-thread-head__title');
  const threadMeta = root.querySelector('.guest-thread-head__meta');
  const empty = root.querySelector('.guest-thread-empty');
  const panel = root.querySelector('.guest-thread-messages');
  const composer = root.querySelector('.guest-thread-composer');
  const composeInput = root.querySelector('.guest-thread-compose-input');
  const sendBtn = root.querySelector('.guest-thread-send');
  const botHint = root.querySelector('[data-bot-hint]');
  if (!panel || !empty || !composer) return;

  function sortGuestMsgList() {
    const list = root.querySelector('.guest-msgs-list');
    if (!list) return;
    const toolbar = list.querySelector('.guest-preview__toolbar');
    if (!toolbar) return;
    const slot = list.querySelector('#guest-chat-1c-slot');
    const movable = [];
    let n = toolbar.nextElementSibling;
    while (n) {
      const cur = n;
      n = n.nextElementSibling;
      movable.push(cur);
    }
    movable.sort((a, b) => {
      const da = Number(a.dataset?.chatStamp ?? a.querySelector?.('[data-chat-stamp]')?.dataset?.chatStamp ?? 0);
      const db = Number(b.dataset?.chatStamp ?? b.querySelector?.('[data-chat-stamp]')?.dataset?.chatStamp ?? 0);
      return db - da;
    });
    movable.forEach((el) => list.appendChild(el));
  }

  function wireChatRows() {
    root.querySelectorAll('.guest-chat-row[data-chat]').forEach((row) => {
      if (row.dataset.guestDemoWired) return;
      row.dataset.guestDemoWired = '1';
      row.addEventListener('click', () => openChat(row.getAttribute('data-chat')));
    });
  }

  syncOnecChatRow(root);
  wireChatRows();
  sortGuestMsgList();
  window.addEventListener('tiver-community-subs', () => {
    syncOnecChatRow(root);
    wireChatRows();
    sortGuestMsgList();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_SUBS) {
      syncOnecChatRow(root);
      wireChatRows();
      sortGuestMsgList();
    }
  });

  let currentId = null;

  const typing = document.createElement('div');
  typing.className = 'guest-thread-typing';
  typing.setAttribute('hidden', '');
  typing.innerHTML =
    '<span class="guest-thread-typing__dot"></span><span class="guest-thread-typing__dot"></span><span class="guest-thread-typing__dot"></span>';

  const showTyping = () => {
    panel.appendChild(typing);
    typing.removeAttribute('hidden');
  };
  const hideTyping = () => {
    typing.setAttribute('hidden', '');
    typing.remove();
  };

  function appendBubble(out, text, author) {
    const who =
      author ??
      (out ? 'Вы' : currentId && CHAT_LABELS[currentId]?.title ? CHAT_LABELS[currentId].title : 'Собеседник');
    const div = document.createElement('div');
    div.className = `guest-thread-bubble guest-thread-bubble--${out ? 'out' : 'in'}`.trim();
    div.innerHTML = `<span class="guest-thread-bubble__author">${escapeHtml(who)}</span><span class="guest-thread-bubble__text">${escapeHtml(text)}</span>`;
    panel.appendChild(div);
    panel.scrollTop = panel.scrollHeight;
  }

  function scheduleReply(getText, delay = 480) {
    showTyping();
    window.setTimeout(() => {
      hideTyping();
      const replyAuthor = currentId === 'bot' ? 'Бот' : pickReplyAuthorForChat(currentId);
      appendBubble(false, getText(), replyAuthor);
      panel.scrollTop = panel.scrollHeight;
    }, delay);
  }

  function openChat(id) {
    if (!id || !CHAT_MESSAGES[id]) return;
    currentId = id;

    root.querySelectorAll('.guest-chat-row').forEach((r) => r.classList.remove('guest-chat-row--active'));
    root.querySelector(`.guest-chat-row[data-chat="${id}"]`)?.classList.add('guest-chat-row--active');

    const labels = CHAT_LABELS[id];
    if (threadTitle && labels) threadTitle.textContent = labels.title;
    if (threadMeta && labels) {
      threadMeta.textContent = [labels.meta, labels.presence].filter(Boolean).join(' · ');
    }

    empty.setAttribute('hidden', '');
    panel.hidden = false;
    composer.hidden = false;
    panel.innerHTML = renderBubbles(CHAT_MESSAGES[id], id);
    if (botHint) botHint.hidden = id !== 'bot';

    if (composeInput) composeInput.value = '';
    panel.scrollTop = panel.scrollHeight;
  }

  root.querySelectorAll('[data-quick-reply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = btn.textContent?.trim();
      if (t && composeInput) composeInput.value = t;
    });
  });

  function sendMessage() {
    const raw = (composeInput?.value || '').trim();
    if (!raw || !currentId) return;
    appendBubble(true, raw, 'Вы');
    if (composeInput) composeInput.value = '';

    if (currentId === 'bot') {
      scheduleReply(() => botReply(raw), 520);
      return;
    }

    const pool = PEER_REPLIES[currentId];
    if (pool && pool.length) {
      scheduleReply(() => pick(pool), 400 + Math.random() * 500);
      return;
    }
    const generic = [
      'Услышал вас',
      'Ок, учту',
      'Принято',
      'Интересно',
      'Записал мысленно',
      'Понял контекст',
      'Согласен наполовину',
      'Вернусь к теме позже',
      'Пока без контраргументов',
      'Продолжайте',
    ];
    scheduleReply(() => pick(generic), 420 + Math.random() * 400);
  }

  sendBtn?.addEventListener('click', sendMessage);
  composeInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  wireChipGroup(root, '[data-msg-tab]', (chip) => {
    const tab = chip.getAttribute('data-msg-tab');
    root.querySelectorAll('.guest-chat-row[data-msg-cat]').forEach((row) => {
      const cat = row.getAttribute('data-msg-cat');
      const show = tab === 'all' || cat === tab;
      row.hidden = !show;
    });
    syncTablistAria(root, '[data-msg-tab]', chip);
  });
  syncTablistAria(
    root,
    '[data-msg-tab]',
    root.querySelector('[data-msg-tab].guest-chip--on') || root.querySelector('[data-msg-tab]'),
  );
}

function initGroupsDemo(root) {
  ensureCommunitySubDelegation();
  syncAllCommunitySubButtons();
  syncGuestRequestButtons(root);

  root.querySelectorAll('.guest-group-cell[data-group-href]').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const h = cell.getAttribute('data-group-href');
      if (!h) return;
      import('../../router/router.js').then(({ navigate }) => navigate(h));
    });
    cell.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('a, button')) return;
      e.preventDefault();
      const h = cell.getAttribute('data-group-href');
      if (h) import('../../router/router.js').then(({ navigate }) => navigate(h));
    });
  });

  function applyGroupsCatalogFilter(chip) {
    const mode = chip.getAttribute('data-groups-chip') || 'pop';
    root.querySelectorAll('.guest-group-cell[data-groups-tags]').forEach((cell) => {
      const tags = (cell.getAttribute('data-groups-tags') || '').split(/\s+/).filter(Boolean);
      let show = true;
      if (mode === 'new') show = tags.includes('new');
      else if (mode === 'topics') show = tags.includes('topics');
      else show = tags.includes('pop');
      cell.hidden = !show;
    });
    syncTablistAria(root, '[data-groups-chip]', chip);
  }

  const groupChips = [...root.querySelectorAll('[data-groups-chip]')];
  groupChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      groupChips.forEach((c) => c.classList.remove('guest-chip--on'));
      chip.classList.add('guest-chip--on');
      applyGroupsCatalogFilter(chip);
    });
  });
  applyGroupsCatalogFilter(groupChips.find((c) => c.classList.contains('guest-chip--on')) || groupChips[0]);

  const modal = root.querySelector('#guest-group-auth-modal');
  const closeEls = modal?.querySelectorAll('[data-guest-modal-close]');
  const openBtn = root.querySelector('#guest-create-group-btn');
  const closeModal = () => {
    if (modal) modal.hidden = true;
  };
  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (modal) modal.hidden = false;
  });
  closeEls?.forEach((el) => el.addEventListener('click', closeModal));
}

function initFriendsDemo(root) {
  wireChipGroup(root, '[data-friends-chip]', () => {});
}

function initGamesDemo(root) {
  const grid = root.querySelector('.guest-games-grid');
  wireChipGroup(root, '[data-games-chip]', (chip) => {
    const v = chip.getAttribute('data-games-chip') || 'all';
    if (!grid) return;
    grid.querySelectorAll('.guest-vkplay-card').forEach((t) => {
      const cat = t.getAttribute('data-game-cat') || 'all';
      const dim = v !== 'all' && cat !== v;
      t.classList.toggle('guest-vkplay-card--dim', dim);
    });
  });
}

function initCommunityPageDemo(root) {
  ensureCommunitySubDelegation();
  syncAllCommunitySubButtons();
  syncGuestRequestButtons(root);
  const feed = root.querySelector('.guest-community-feed');
  if (feed) wirePostEngagement(feed);

  root.querySelectorAll('[data-c-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-c-tab');
      root.querySelectorAll('[data-c-tab]').forEach((t) => {
        const on = t === tab;
        t.classList.toggle('guest-chip--on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      root.querySelectorAll('[data-c-panel]').forEach((p) => {
        p.hidden = p.getAttribute('data-c-panel') !== id;
      });
    });
  });

  root.querySelector('.guest-community-composer__btn')?.addEventListener('click', () => {
    const inp = root.querySelector('.guest-community-composer__input');
    if (inp && 'value' in inp) inp.value = '';
  });
}

function initFriendPageDemo(root) {
  root.querySelectorAll('[data-f-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-f-tab');
      root.querySelectorAll('[data-f-tab]').forEach((t) => {
        const on = t === tab;
        t.classList.toggle('guest-chip--on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      root.querySelectorAll('[data-f-panel]').forEach((p) => {
        p.hidden = p.getAttribute('data-f-panel') !== id;
      });
    });
  });
  const feed = root.querySelector('.guest-community-feed');
  if (feed) wirePostEngagement(feed);
}

export function wireGuestDemo(root, opts = {}) {
  const segment = opts.segment ?? 'feed';
  const main = root.querySelector('#main-content');
  if (!main) return;
  ensureCommunitySubDelegation();
  syncAllCommunitySubButtons();
  syncGuestRequestButtons(root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.requestAnimationFrame(() => {
    switch (segment) {
      case 'feed':
        initFeedDemo(main, reducedMotion);
        break;
      case 'messages':
        initMessagesDemo(main);
        break;
      case 'groups':
        initGroupsDemo(main);
        break;
      case 'friends':
        initFriendsDemo(main);
        break;
      case 'games':
        initGamesDemo(main);
        break;
      case 'community':
        initCommunityPageDemo(main);
        break;
      case 'friend':
        initFriendPageDemo(main);
        break;
      case 'game':
        break;
      case 'settings':
        break;
      default:
        initFeedDemo(main, reducedMotion);
    }
  });
}
