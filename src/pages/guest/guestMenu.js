let guestMenuDocAbort;

export function wireGuestUserMenu(root) {
  const trigger = root.querySelector('[data-user-menu-trigger]');
  const panel = root.querySelector('[data-user-menu-panel]');
  if (!trigger || !panel) return;

  guestMenuDocAbort?.abort();
  guestMenuDocAbort = new AbortController();
  const { signal } = guestMenuDocAbort;

  const close = () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    root.classList.remove('guest-user-menu--open');
  };

  const open = () => {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.classList.add('guest-user-menu--open');
  };

  const toggle = () => {
    if (panel.hidden) open();
    else close();
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener(
    'click',
    (e) => {
      if (!root.contains(e.target)) close();
    },
    { capture: true, signal },
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') close();
    },
    { signal },
  );
}
