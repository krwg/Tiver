/** Локализация UI: ru | en. Подвал и настройки + общие строки гостя. */

const STORAGE = 'tiver_locale';

const STR = {
  ru: {
    'footer.pitch': 'Минимализм, скорость, удобство. Соцсеть в разработке — без обещаний «скоро всё».',
    'footer.col_site': 'Сайт',
    'footer.home': 'Главная',
    'footer.login': 'Вход',
    'footer.register': 'Регистрация',
    'footer.guest': 'Гость',
    'footer.col_archive': 'Архив',
    'footer.archive_link': 'HTML, 2021',
    'footer.col_legal': 'Юридическое',
    'footer.privacy': 'Конфиденциальность',
    'footer.about': 'О проекте',
    'footer.copy': '© Tiver 2021–2026',
    'footer.lang_en': 'English',
    'footer.lang_ru': 'Русский',
    'settings.hero_eyebrow': 'Гостевой режим',
    'settings.hero_title': 'Настройки',
    'settings.hero_lead': 'Тема и язык сохраняются в этом браузере и действуют на весь сайт — и в госте, и после входа.',
    'settings.hero_note': 'Пять цветов палитры темы — ниже, рядом с переключателем.',
    'settings.theme_title': 'Тема интерфейса',
    'settings.theme_lede': 'Выберите палитру. Активная тема задаёт пять акцентных «красок» для UI — они же показаны полоской ниже.',
    'settings.lang_title': 'Язык интерфейса',
    'settings.lang_lede': 'Переключение влияет на подписи в подвале и в настройках; часть гостевых экранов пока только на русском.',
    'settings.lang_ru': 'Русский',
    'settings.lang_en': 'English',
    'theme.dark': 'Тёмная',
    'theme.dark_hint': 'по умолчанию',
    'theme.light': 'Светлая',
    'theme.light_hint': 'высокий контраст',
    'theme.moon': 'Лунная',
    'theme.moon_hint': 'холодный синий',
    'theme.sakura': 'Сакура',
    'theme.sakura_hint': 'розовый акцент',
    'theme.onec': '1С',
    'theme.onec_hint': 'секретная тема после подписки',
    'guest.cta': 'Всё выше — клиентский театр: безопасно крутить на демо и перед коллегами, пока бэкенд не проснулся.',
    'guest.login': 'Войти',
    'guest.register': 'Регистрация',
    'community.back': '← К каталогу сообществ',
    'community.posts_locked': 'Чтобы видеть посты сообщества, войдите в аккаунт.',
    'community.posts_hint': 'В гостевом режиме лента скрыта — так и задумано.',
    'friend.wall_locked': 'Полная стена и лента друга — после входа в аккаунт.',
    'friend.photos_hint': 'Галерея и личные фото — только для авторизованных.',
    'game.modal.close': 'Закрыть',
    'game.spec.min': 'Минимум',
    'game.spec.rec': 'Рекомендуется',
  },
  en: {
    'footer.pitch': 'Minimal, fast, usable. Tiver is in active layout work — no “everything tomorrow” marketing.',
    'footer.col_site': 'Site',
    'footer.home': 'Home',
    'footer.login': 'Log in',
    'footer.register': 'Sign up',
    'footer.guest': 'Guest',
    'footer.col_archive': 'Archive',
    'footer.archive_link': 'HTML, 2021',
    'footer.col_legal': 'Legal',
    'footer.privacy': 'Privacy',
    'footer.about': 'About',
    'footer.copy': '© Tiver 2021–2026',
    'footer.lang_en': 'English',
    'footer.lang_ru': 'Русский',
    'settings.hero_eyebrow': 'Guest mode',
    'settings.hero_title': 'Settings',
    'settings.hero_lead': 'Theme and language are stored in this browser for the whole site — guest or signed-in.',
    'settings.hero_note': 'Five palette swatches below mirror the active theme.',
    'settings.theme_title': 'Interface theme',
    'settings.theme_lede': 'Pick a palette. The active theme drives five accent colors used across the UI.',
    'settings.lang_title': 'Interface language',
    'settings.lang_lede': 'Affects footer and settings labels; some guest screens are still RU-only for now.',
    'settings.lang_ru': 'Russian',
    'settings.lang_en': 'English',
    'theme.dark': 'Dark',
    'theme.dark_hint': 'default',
    'theme.light': 'Light',
    'theme.light_hint': 'high contrast',
    'theme.moon': 'Moon',
    'theme.moon_hint': 'cool blue',
    'theme.sakura': 'Sakura',
    'theme.sakura_hint': 'pink accent',
    'theme.onec': '1C',
    'theme.onec_hint': 'unlocked after subscribing',
    'guest.cta': 'What you see is front-end theatre: safe to demo while the API naps.',
    'guest.login': 'Log in',
    'guest.register': 'Sign up',
    'community.back': '← Back to communities',
    'community.posts_locked': 'Sign in to see community posts.',
    'community.posts_hint': 'Hidden in guest mode — intentional.',
    'friend.wall_locked': 'Full friend wall and feed — after you sign in.',
    'friend.photos_hint': 'Gallery and private photos — for signed-in users only.',
    'game.modal.close': 'Close',
    'game.spec.min': 'Minimum',
    'game.spec.rec': 'Recommended',
  },
};

export function getLocale() {
  try {
    const v = localStorage.getItem(STORAGE);
    return v === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

export function setLocale(lang) {
  const next = lang === 'en' ? 'en' : 'ru';
  try {
    localStorage.setItem(STORAGE, next);
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute('lang', next === 'en' ? 'en' : 'ru');
  applyI18n(document.body);
  window.dispatchEvent(new CustomEvent('tiver-locale'));
}

export function t(key) {
  const lang = getLocale();
  return STR[lang]?.[key] ?? STR.ru[key] ?? key;
}

export function applyI18n(root) {
  const scope = root || document.body;
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && 'placeholder' in el) el.placeholder = t(key);
  });
}

export function wireFooterLocale(footer) {
  applyI18n(footer);
  footer.querySelectorAll('[data-set-locale]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLocale(btn.getAttribute('data-set-locale') || 'ru');
    });
  });
}
