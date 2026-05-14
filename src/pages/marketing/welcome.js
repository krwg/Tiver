import { setDocumentTitle } from '../../lib/documentTitle.js';
import { siteFooter } from '../../components/siteFooter.js';
import { marketingSiteHeader } from '../../layout/marketingHeader.js';

export function renderWelcome() {
  setDocumentTitle('Tiver');

  const root = document.createElement('div');
  root.className = 'page page--marketing';
  root.innerHTML = `
    ${marketingSiteHeader()}

    <main class="stack stack--lg" id="main-content" role="main">
      <section class="hero hero--home" aria-labelledby="welcome-hero-title">
        <p class="hero__eyebrow">Соцсеть без лишнего</p>
        <h1 class="hero__title" id="welcome-hero-title">Минимализм, скорость, нормальный интерфейс</h1>
        <p class="hero__subtitle text-secondary">
          Tiver — это попытка сделать ленту, сообщения и сообщества спокойнее: меньше визуального шума, шире рабочая область на обычном мониторе, без миссии «спасти интернет за выходные».
        </p>
      </section>

      <section class="value-grid" aria-label="Три опоры">
        <article class="value-card card card--pad-md">
          <h2 class="value-card__title">Лента</h2>
          <p class="value-card__text text-muted">Хронология и подписки. Без обещания «идеального алгоритма» — просто порядок.</p>
        </article>
        <article class="value-card card card--pad-md">
          <h2 class="value-card__title">Комфорт</h2>
          <p class="value-card__text text-muted">Крупная зона контента, читаемая типографика. Не «как в приложении 2014 года на 320 px».</p>
        </article>
        <article class="value-card card card--pad-md">
          <h2 class="value-card__title">Данные</h2>
          <p class="value-card__text text-muted">Настройки приватности без театра. Чем меньше собираем — тем меньше объяснять.</p>
        </article>
      </section>

      <section class="card card--pad-lg" aria-label="Действия">
        <div class="actions-row actions-row--stretch actions-row--start">
          <a class="btn btn--primary btn--lg" href="/login">Войти</a>
          <a class="btn btn--secondary btn--lg" href="/register">Регистрация</a>
        </div>
      </section>

      <hr class="divider" aria-hidden="true" />

      <section class="card card--pad-lg card--tight-top" aria-labelledby="guest-mode-title">
        <h2 class="sr-only" id="guest-mode-title">Гостевой режим</h2>
        <div class="copy-block">
          <p class="copy-lead">Гость — без пароля.</p>
          <p class="text-secondary">Откроются макеты экранов: как будет выглядеть лента, чаты и т.д. Живых данных нет — зато можно потыкать навигацию.</p>
          <p class="text-muted">Сообщения, друзья и свой профиль после входа. Очевидно, но мы всё равно написали.</p>
        </div>
        <div class="actions-row actions-row--start actions-row--hero-gap">
          <a class="btn btn--ghost btn--lg" href="/guest/feed">Войти как гость</a>
        </div>
      </section>

      <hr class="divider" aria-hidden="true" />

      <section class="stack stack--md" aria-labelledby="about-title">
        <h2 class="section-title" id="about-title">Откуда это</h2>
        <div class="welcome-era" id="welcome-era" aria-live="polite">
          <button type="button" class="welcome-era__skip" id="welcome-era-skip">Остановить смену</button>
          <div class="welcome-era__layer welcome-era__legacy card card--pad-lg copy-block welcome-original">
            <span class="welcome-era__stamp">2021 · оригинал</span>
            <h2 class="sr-only" id="about-original-title">О проекте, оригинальный текст</h2>
            <p class="copy-lead">Tiver - проект новой социальной сети.</p>
            <p class="text-secondary">Идея проекта создать максимально комфортную, стильную, удобную и безопасную бесплатную социальную сеть.</p>
            <p class="text-secondary">Проект был создан в феврале 2021 года и с этого дня ведутся работы над ним.</p>
            <p class="text-secondary">Над проектом, не покладая рук, работают два человека.</p>
            <p class="text-secondary welcome-original__footer">
              Более подробную информацию смотрите <a href="#" rel="external" class="t-inline-link">О Tiver</a>.
            </p>
          </div>
          <div class="welcome-era__layer welcome-era__modern card card--pad-lg copy-block">
            <span class="welcome-era__stamp">Сейчас</span>
            <p class="copy-lead">Тот же Tiver, но в 2026-м: Vite, гостевой режим с макетами, темы и локализация.</p>
            <p class="text-secondary">
              Мы по-прежнему не обещаем «спасти интернет за выходные»: делаем спокойную ленту, сообщения и сообщества на
              клиенте, а бэкенд подключается, когда будет готов.
            </p>
            <p class="text-secondary">
              HTML-архив первой версии по-прежнему в подвале — как якорь, от которого приятно отталкиваться.
            </p>
            <p class="text-muted text-sm">Карточка переключается каждые 5 секунд — можно читать оба текста без клика.</p>
          </div>
        </div>
      </section>

      <hr class="divider" aria-hidden="true" />
    </main>
  `;

  root.appendChild(siteFooter());
  wireWelcomeEra(root);
  return root;
}

function wireWelcomeEra(root) {
  const era = root.querySelector('#welcome-era');
  const skip = root.querySelector('#welcome-era-skip');
  if (!era) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    era.classList.add('welcome-era--done');
    return;
  }

  let showModern = false;
  const tick = () => {
    showModern = !showModern;
    era.classList.toggle('welcome-era--done', showModern);
  };

  const intervalId = window.setInterval(tick, 5000);

  skip?.addEventListener('click', () => {
    window.clearInterval(intervalId);
    era.classList.add('welcome-era--done', 'welcome-era--paused');
  });
}
