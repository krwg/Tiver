import { setDocumentTitle } from '../../lib/documentTitle.js';
import privacyBody from '../../content/legal/privacy-body.html?raw';
import { siteFooter } from '../../components/siteFooter.js';
import { marketingSiteHeader } from '../../layout/marketingHeader.js';

export function renderPrivacy() {
  setDocumentTitle('Политика конфиденциальности');

  const root = document.createElement('div');
  root.className = 'page page--marketing';
  root.innerHTML = `
    ${marketingSiteHeader()}

    <main class="stack stack--md legal" id="main-content" role="main">
      <header class="hero hero--compact legal__header">
        <h1 class="hero__title">Политика конфиденциальности</h1>
        <p class="hero__subtitle text-muted">
          Документ сохраняет юридическую базу проекта. В продукте Tiver вы получаете предсказуемые настройки приватности — без «тёмных паттернов», к которым приучили крупные сети.
        </p>
        <div class="actions-row actions-row--start">
          <a class="btn btn--ghost btn--sm" href="/welcome">Назад</a>
        </div>
      </header>

      <article class="card card--pad-md legal__article" aria-label="Полный текст политики">
        <div class="legal__body">
          ${privacyBody}
        </div>
      </article>
    </main>
  `;

  root.appendChild(siteFooter());
  return root;
}
