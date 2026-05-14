import { isProdsoftSubbed } from './guestSubs.js';

const STORAGE_KEY = 'tiver_theme';

export const THEMES = ['dark', 'light', 'moon', 'sakura', 'onec'];

function is1cUnlocked() {
  return isProdsoftSubbed();
}

export function getTheme() {
  const v = localStorage.getItem(STORAGE_KEY);
  if (!THEMES.includes(v)) return 'dark';
  if (v === 'onec' && !is1cUnlocked()) return 'dark';
  return v;
}

export function setTheme(id) {
  if (!THEMES.includes(id)) return;
  if (id === 'onec' && !is1cUnlocked()) return;
  localStorage.setItem(STORAGE_KEY, id);
  applyTheme(id);
}

export function applyTheme(id) {
  const html = document.documentElement;
  const effective = id === 'onec' && !is1cUnlocked() ? 'dark' : id;
  if (effective === 'dark') html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', effective);
}

export function reconcileThemeAfterStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'onec' && !is1cUnlocked()) {
    localStorage.setItem(STORAGE_KEY, 'dark');
    applyTheme('dark');
  }
}
