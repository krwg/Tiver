import { api } from '../../lib/api.js';
import { getSession, setSession } from '../../session/sessionStore.js';

export function wireAppProfile(root) {
  const form = root.querySelector('#app-profile-form');
  const status = root.querySelector('#app-profile-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) status.textContent = 'Сохранение…';
    const fd = new FormData(form);
    try {
      const user = await api('/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: fd.get('displayName'),
          bio: fd.get('bio'),
        }),
      });
      setSession({ ...getSession(), user });
      if (status) status.textContent = 'Сохранено.';
    } catch (err) {
      if (status) status.textContent = err.data?.error || err.message || 'Ошибка';
    }
  });
}
