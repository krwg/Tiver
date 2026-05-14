/**
 * Собирает public/archive/*.html из E:\Tiver\archive\ — оригинальные стили страниц,
 * без «современного» слоя. Плашка «2026» — только public/archive/chrome.css
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'archive');
const destDir = path.join(root, 'public', 'archive');
const styleSrc = path.join(srcDir, 'style');
const styleDest = path.join(destDir, 'style');

const PAGES = [
  ['welc.html', 'welc.css'],
  ['vhod.html', 'vhod.css'],
  ['privace.html', 'privace.css'],
  ['guestfeed.html', 'guestfeed.css'],
  ['guestmessange.html', 'guestmessange.css'],
  ['guestgroups.html', 'guestgroups.css'],
  ['guestgames.html', 'guestgames.css'],
  ['guestfriend.html', 'guestfriend.css'],
];

function absolutize(html) {
  let s = html;
  s = s.replace(/href=(["'])style\//g, 'href=$1/archive/style/');
  s = s.replace(/href=(["'])img\//g, 'href=$1/img/');
  s = s.replace(/action=(["'])([a-z0-9_-]+\.html)\1/gi, (_, q, file) => `action=${q}/archive/${file}${q}`);
  s = s.replace(/href=(["'])([a-z0-9_-]+\.html)\1/gi, (m, q, file) => {
    if (file.startsWith('http') || file.startsWith('#')) return m;
    return `href=${q}/archive/${file}${q}`;
  });
  return s;
}

function injectChrome(html) {
  const chromeLink = '<link rel="stylesheet" href="/archive/chrome.css">\n';
  const robots = '<meta name="robots" content="noindex">\n';
  const returnDiv =
    '<div class="archive-return-2026" title="Актуальный сайт Tiver"><a href="/" class="archive-return-2026__btn" aria-label="Вернуться в версию 2026">2026</a></div>\n';

  let s = html;
  if (!/<meta\s+name="robots"/i.test(s)) {
    s = s.replace(/<head([^>]*)>/i, `<head$1>\n${robots}`);
  }
  if (!/\/archive\/chrome\.css/.test(s)) {
    s = s.replace(/<\/head>/i, `${chromeLink}</head>`);
  }
  if (!/class="archive-return-2026"/.test(s)) {
    s = s.replace(/<body([^>]*)>/i, `<body$1>\n${returnDiv}`);
  }
  return s;
}

function ensurePageCss(html, cssName) {
  if (!cssName) return html;
  if (html.includes(`/archive/style/${cssName}`)) return html;
  const link = `<link rel="stylesheet" href="/archive/style/${cssName}">\n`;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${link}`);
}

fs.mkdirSync(styleDest, { recursive: true });
fs.cpSync(styleSrc, styleDest, { recursive: true });

const chromeSrc = path.join(destDir, 'chrome.css');
const chromeMinimal = `/* Только кнопка «2026» — не трогаем вёрстку архива */
*,
*::before,
*::after { box-sizing: border-box; }

.archive-return-2026 {
  position: fixed;
  z-index: 99999;
  bottom: max(10px, env(safe-area-inset-bottom, 0px));
  right: max(10px, env(safe-area-inset-right, 0px));
  font-family: 'Press Start 2P', monospace;
}
.archive-return-2026__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.25rem;
  min-height: 2.25rem;
  padding: 0.35rem 0.5rem;
  font-size: 8px;
  line-height: 1.2;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #1a1a1a;
  background: #c6c6c6;
  border: 2px solid #1a1a1a;
  box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #5a5a5a;
}
.archive-return-2026__btn:hover { filter: brightness(1.06); }
.archive-return-2026__btn:active {
  transform: translateY(1px);
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #5a5a5a;
}
`;
fs.writeFileSync(chromeSrc, chromeMinimal, 'utf8');

const fontPre = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
`;

for (const [file, css] of PAGES) {
  const from = path.join(srcDir, file);
  if (!fs.existsSync(from)) {
    console.warn('skip missing', file);
    continue;
  }
  let raw = fs.readFileSync(from, 'utf8');
  raw = raw.replace(/lang="en"/i, 'lang="ru"');
  if (!/Press\+Start\+2P|press-start-2p/i.test(raw)) {
    raw = raw.replace(/<head([^>]*)>/i, `<head$1>\n${fontPre}`);
  }
  raw = absolutize(raw);
  raw = raw.replace(/class="active"\s*href=/g, 'class="active" href=');
  raw = ensurePageCss(raw, css);
  raw = injectChrome(raw);
  if (!raw.includes('viewport-fit')) {
    raw = raw.replace(
      /<meta\s+name="viewport"[^>]*>/i,
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    );
  }
  fs.writeFileSync(path.join(destDir, file), raw, 'utf8');
  console.log('wrote', file);
}

/* reg.html в исходнике пустой — минимальная заглушка */
const regPath = path.join(srcDir, 'reg.html');
if (fs.existsSync(regPath)) {
  const regOut = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
${fontPre}<title>Регистрация · архив</title>
<link rel="icon" href="/img/fav1.ico">
<link rel="stylesheet" href="/archive/chrome.css">
<style>
  body { margin:0; min-height:100vh; background:#000; color:#fff; font-family: Arial, Helvetica, sans-serif;
    display:flex; align-items:center; justify-content:center; padding:1rem; text-align:center; }
  a { color:#4973ff; }
</style>
</head>
<body>
<div class="archive-return-2026" title="Актуальный сайт Tiver"><a href="/" class="archive-return-2026__btn" aria-label="Вернуться в версию 2026">2026</a></div>
<p>Заглушка из архива (пустая страница). <a href="/archive/welc.html">На главную архива</a> · <a href="/">На сайт 2026</a></p>
</body>
</html>`;
  fs.writeFileSync(path.join(destDir, 'reg.html'), regOut, 'utf8');
  console.log('wrote reg.html (stub)');
}

/* site.css — только re-export chrome для старых ссылок */
fs.writeFileSync(
  path.join(destDir, 'site.css'),
  `/* Устарело: используйте chrome.css. Оставлено для совместимости. */\n@import url("./chrome.css");\n`,
  'utf8',
);

console.log('sync archive done');
