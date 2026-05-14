import { getTheme, setTheme, reconcileThemeAfterStorage } from '../../lib/theme.js';
import { getLocale, setLocale, applyI18n } from '../../lib/locale.js';
import { isProdsoftSubbed } from '../../lib/guestSubs.js';

function injectOneCThemeTile(slot) {
  if (!slot || slot.querySelector('input[value="onec"]')) return;
  slot.innerHTML = `
    <label class="theme-tile">
      <input type="radio" name="tiver-theme" value="onec" />
      <span class="theme-tile__body">
        <span class="theme-tile__name" data-i18n="theme.onec">1С</span>
        <span class="theme-tile__hint" data-i18n="theme.onec_hint">секретная тема после подписки</span>
      </span>
    </label>
  `;
  applyI18n(slot);
}

function syncOneCThemeTile(slot) {
  if (!slot) return;
  if (isProdsoftSubbed()) injectOneCThemeTile(slot);
  else slot.innerHTML = '';
}

export function wireGuestSettings(root) {
  reconcileThemeAfterStorage();

  const localeGroup = root.querySelector('[data-locale-group]');
  localeGroup?.addEventListener('change', (e) => {
    const el = e.target;
    if (el instanceof HTMLInputElement && el.name === 'tiver-locale' && el.checked) setLocale(el.value);
  });
  localeGroup?.querySelectorAll('input[name="tiver-locale"]').forEach((inp) => {
    if (inp instanceof HTMLInputElement) inp.checked = inp.value === getLocale();
  });

  const themeGroup = root.querySelector('[data-theme-group]');
  const onecSlot = root.querySelector('[data-onec-theme-slot]');

  function syncThemeChecked() {
    const cur = getTheme();
    themeGroup?.querySelectorAll('input[name="tiver-theme"]').forEach((inp) => {
      if (inp instanceof HTMLInputElement) inp.checked = inp.value === cur;
    });
  }

  themeGroup?.addEventListener('change', (e) => {
    const el = e.target;
    if (el instanceof HTMLInputElement && el.name === 'tiver-theme' && el.checked) setTheme(el.value);
  });

  syncThemeChecked();
  syncOneCThemeTile(onecSlot);
  syncThemeChecked();

  window.addEventListener('tiver-community-subs', () => {
    syncOneCThemeTile(onecSlot);
    reconcileThemeAfterStorage();
    syncThemeChecked();
  });

  window.addEventListener('tiver-locale', () => {
    applyI18n(root);
    syncThemeChecked();
    localeGroup?.querySelectorAll('input[name="tiver-locale"]').forEach((inp) => {
      if (inp instanceof HTMLInputElement) inp.checked = inp.value === getLocale();
    });
  });

  const UNIVERSE_LINES = [
    'Ноль — вы монолит. Редкость.',
    'Одна — классика, без мультивселенской суеты.',
    'Две — работа и «та, где вы отдыхаете».',
    'Три — уже нужен блокнот.',
    'Четыре — параллельно держите дедлайны и мемы.',
    'Пять — вы как табы в браузере перед spring clean.',
    'Шесть — коллеги иногда путают, в какой вы сейчас.',
    'Семь — рекомендуем чай и таймер Pomodoro.',
    'Восемь — почти оркестр. Дирижёрская палочка не помешает.',
    'Девять — квантовый уровень бытовой магии.',
    'Десять — легендарный слот. Сохраните конфиг.',
    'Одиннадцать — официально «много». Мы вас уважаем.',
  ];
  const STORAGE_UNIVERSE = 'tiver-guest-universes';
  const STORAGE_CUP = 'tiver-guest-cup-approve';

  const uSlider = root.querySelector('[data-guest-universe-slider]');
  const uVal = root.querySelector('[data-guest-universe-value]');
  const uCap = root.querySelector('[data-guest-universe-caption]');
  const ramBtn = root.querySelector('[data-guest-ram-scratch]');
  const ramHint = root.querySelector('[data-guest-ram-hint]');
  const cupInp = root.querySelector('[data-guest-cup-toggle]');
  const cupMsg = root.querySelector('[data-guest-cup-msg]');

  function syncUniverseUi(v) {
    const n = Math.max(0, Math.min(11, Number(v) || 0));
    if (uSlider instanceof HTMLInputElement) uSlider.value = String(n);
    if (uVal) uVal.textContent = String(n);
    if (uCap) uCap.textContent = UNIVERSE_LINES[n] ?? '';
  }

  if (uSlider instanceof HTMLInputElement) {
    const saved = localStorage.getItem(STORAGE_UNIVERSE);
    if (saved !== null) syncUniverseUi(saved);
    else syncUniverseUi(uSlider.value);
    uSlider.addEventListener('input', () => {
      syncUniverseUi(uSlider.value);
      localStorage.setItem(STORAGE_UNIVERSE, String(uSlider.value));
    });
  }

  let ramTimer = 0;
  ramBtn?.addEventListener('click', () => {
    if (ramHint) {
      ramHint.hidden = false;
      window.clearTimeout(ramTimer);
      ramTimer = window.setTimeout(() => {
        ramHint.hidden = true;
      }, 3200);
    }
  });

  if (cupInp instanceof HTMLInputElement) {
    cupInp.checked = localStorage.getItem(STORAGE_CUP) === '1';
    if (cupMsg) cupMsg.hidden = !cupInp.checked;
    cupInp.addEventListener('change', () => {
      localStorage.setItem(STORAGE_CUP, cupInp.checked ? '1' : '0');
      if (cupMsg) cupMsg.hidden = !cupInp.checked;
    });
  }
}
