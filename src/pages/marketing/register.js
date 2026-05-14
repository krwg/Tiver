import { setDocumentTitle } from '../../lib/documentTitle.js';
import { siteFooter } from '../../components/siteFooter.js';
import { marketingSiteHeader } from '../../layout/marketingHeader.js';
import { api } from '../../lib/api.js';
import { setSession } from '../../session/sessionStore.js';

export function renderRegister() {
  setDocumentTitle('Регистрация');

  const root = document.createElement('div');
  root.className = 'page page--marketing';
  root.innerHTML = `
    ${marketingSiteHeader()}

    <main class="stack stack--md narrow-form" id="main-content" role="main">
      <section class="hero hero--compact" aria-labelledby="register-title">
        <h1 class="hero__title" id="register-title">Регистрация</h1>
        <p class="hero__subtitle text-muted">Реальная регистрация появится вместе с продакшен-API. Пока форма готова к подключению бэкенда: заведите аккаунт, когда сервер будет в сети.</p>
      </section>

      <form class="card card--pad-md stack stack--sm auth-form" id="register-form" aria-labelledby="register-title">
        <p class="text-muted text-sm" id="register-error" role="alert" hidden></p>
        <label class="field">
          <span class="field__label">Имя и фамилия</span>
          <input class="input" type="text" name="name" autocomplete="name" required placeholder="Как к вам обращаться" />
        </label>
        <label class="field">
          <span class="field__label">Эл. почта</span>
          <input class="input" type="email" name="email" autocomplete="email" required placeholder="name@email.com" />
        </label>
        <label class="field">
          <span class="field__label">Пароль</span>
          <input class="input" type="password" name="password" autocomplete="new-password" required placeholder="Не менее 8 символов" minlength="8" />
        </label>
        <label class="choice">
          <input type="checkbox" name="terms" required />
          <span>Я принимаю <a href="/privacy" class="t-inline-link">политику конфиденциальности</a></span>
        </label>
        <button class="btn btn--primary btn--block" type="submit">Создать аккаунт</button>
        <div class="actions-row actions-row--start actions-row--tight">
          <a class="btn btn--ghost btn--sm" href="/welcome">Назад</a>
          <a class="btn btn--secondary btn--sm" href="/login">Уже есть аккаунт</a>
        </div>
      </form>
    </main>
  `;

  const form = root.querySelector('#register-form');
  const errEl = root.querySelector('#register-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    const fd = new FormData(form);
    try {
      const { token, user } = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: fd.get('email'),
          password: fd.get('password'),
          displayName: fd.get('name'),
        }),
      });
      localStorage.setItem('tiver_token', token);
      setSession({ mode: 'user', user, token });
      const { navigate } = await import('../../router/router.js');
      navigate('/app/profile');
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          err.data?.error === 'email_taken'
            ? 'Эта почта уже зарегистрирована.'
            : err.message === 'Failed to fetch'
              ? 'API недоступен. Попробуйте позже или проверьте, что бэкенд запущен локально.'
              : err.data?.error || err.message || 'Ошибка регистрации';
      }
    }
  });

  root.appendChild(siteFooter());
  return root;
}
