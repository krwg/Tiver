import { setDocumentTitle } from '../../lib/documentTitle.js';
import { siteFooter } from '../../components/siteFooter.js';
import { marketingSiteHeader } from '../../layout/marketingHeader.js';
import { api } from '../../lib/api.js';
import { setSession } from '../../session/sessionStore.js';

export function renderLogin() {
  setDocumentTitle('Вход');

  const root = document.createElement('div');
  root.className = 'page page--marketing';
  root.innerHTML = `
    ${marketingSiteHeader()}

    <main class="stack stack--md narrow-form" id="main-content" role="main">
      <section class="hero hero--compact" aria-labelledby="login-title">
        <h1 class="hero__title" id="login-title">Вход</h1>
        <p class="hero__subtitle text-muted">Вход по API: нужен доступный <code class="text-secondary">/api</code> (локально через Vite proxy или свой хост). Без ответа сервера сессия не создаётся — зато честно.</p>
      </section>

      <form class="card card--pad-md stack stack--sm auth-form" id="login-form" aria-labelledby="login-title">
        <p class="text-muted text-sm" id="login-error" role="alert" hidden></p>
        <label class="field">
          <span class="field__label">Эл. почта</span>
          <input class="input" type="email" name="email" autocomplete="username" required placeholder="name@email.com" />
        </label>
        <label class="field">
          <span class="field__label">Пароль</span>
          <input class="input" type="password" name="password" autocomplete="current-password" required placeholder="Пароль" />
        </label>
        <label class="choice">
          <input type="checkbox" name="remember" />
          <span>Запомнить меня</span>
        </label>
        <button class="btn btn--primary btn--block" type="submit">Войти</button>
      </form>
    </main>
  `;

  const form = root.querySelector('#login-form');
  const errEl = root.querySelector('#login-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    const fd = new FormData(form);
    try {
      const { token, user } = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: fd.get('email'),
          password: fd.get('password'),
        }),
      });
      localStorage.setItem('tiver_token', token);
      setSession({ mode: 'user', user, token });
      const { navigate } = await import('../../router/router.js');
      navigate('/app/feed');
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          err.data?.error === 'invalid_credentials'
            ? 'Неверная почта или пароль.'
            : err.message === 'Failed to fetch'
              ? 'Сеть до API не дошла. Поднимите бэкенд или проверьте URL в VITE_API_URL.'
              : err.data?.error || err.message || 'Ошибка входа';
      }
    }
  });

  root.appendChild(siteFooter());
  return root;
}
