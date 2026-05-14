import { wireFooterLocale } from '../lib/locale.js';

export function siteFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer site-footer--app';
  footer.innerHTML = `
    <div class="site-footer__wrap">
      <div class="site-footer__brand-col">
        <a href="/welcome" class="site-footer__wordmark">Tiver</a>
        <p class="site-footer__pitch" data-i18n="footer.pitch">
          Минимализм, скорость, удобство. Соцсеть в разработке — без обещаний «скоро всё».
        </p>
      </div>
      <div class="site-footer__cols" role="navigation" aria-label="Разделы подвала">
        <div class="site-footer__col">
          <span class="site-footer__col-title" data-i18n="footer.col_site">Сайт</span>
          <a href="/welcome" class="site-footer__link" data-i18n="footer.home">Главная</a>
          <a href="/login" class="site-footer__link" data-i18n="footer.login">Вход</a>
          <a href="/register" class="site-footer__link" data-i18n="footer.register">Регистрация</a>
          <a href="/guest/feed" class="site-footer__link" data-i18n="footer.guest">Гость</a>
        </div>
        <div class="site-footer__col">
          <span class="site-footer__col-title" data-i18n="footer.col_archive">Архив</span>
          <a href="/archive/welc.html" class="site-footer__link" data-i18n="footer.archive_link">HTML, 2021</a>
        </div>
        <div class="site-footer__col">
          <span class="site-footer__col-title" data-i18n="footer.col_legal">Юридическое</span>
          <a href="/privacy" class="site-footer__link" data-i18n="footer.privacy">Конфиденциальность</a>
          <a href="#" rel="external" class="site-footer__link" data-i18n="footer.about">О проекте</a>
        </div>
      </div>
      <div class="site-footer__bottom">
        <span class="site-footer__copy text-muted text-sm" data-i18n="footer.copy">© Tiver 2021–2026</span>
        <div class="site-footer__meta text-sm">
          <a href="#" class="footer-link" data-set-locale="en" data-i18n="footer.lang_en">English</a>
          <span class="footer-sep" aria-hidden="true">·</span>
          <a href="#" class="footer-link text-muted" data-set-locale="ru" data-i18n="footer.lang_ru">Русский</a>
        </div>
      </div>
    </div>
  `;
  wireFooterLocale(footer);
  return footer;
}
