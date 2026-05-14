import { createAppShell } from '../components/appShell.js';

export function mountApp() {
  const root = document.getElementById('app');
  if (!root) return;
  root.replaceChildren(createAppShell());
}
