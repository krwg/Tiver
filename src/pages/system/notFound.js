import { setDocumentTitle } from '../../lib/documentTitle.js';

export function renderNotFound() {
  setDocumentTitle('Страница не найдена');

  const root = document.createElement('div');
  root.className = 'page page--center';
  root.innerHTML = `
    <main class="not-found" id="main-content" role="main">
      <section class="card card--pad-lg not-found__card" aria-labelledby="not-found-code">
        <h1 class="not-found__code" id="not-found-code">404</h1>
        <p class="not-found__message text-muted">Страница не существует или была перенесена.</p>
        <div class="actions-row not-found__actions">
          <a class="btn btn--primary" href="/welcome">На главную</a>
        </div>
      </section>
    </main>
  `;
  return root;
}
