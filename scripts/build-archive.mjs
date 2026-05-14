/**
 * Устаревший пайплайн (HTML из корня репозитория).
 * Для копии 2021 из папки `archive/` с оригинальными CSS используйте: `npm run sync-archive`
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const archiveDir = path.join(root, 'public', 'archive');
const files = [
  'welc.html',
  'vhod.html',
  'reg.html',
  'privace.html',
  'guestfeed.html',
  'guestfriend.html',
  'guestgames.html',
  'guestgroups.html',
  'guestmessange.html',
];

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&subset=cyrillic,cyrillic-ext,latin&display=swap" rel="stylesheet">`;

const RETURN_2026 = `<div class="archive-return-2026" title="Текущий сайт Tiver"><a href="/" class="archive-return-2026__btn" aria-label="Вернуться в версию 2026">2026</a></div>`;

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1].trim() : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : 'Tiver — архив';
}

function absolutizeArchiveLinks(html) {
  let s = html;
  const names = files.map((f) => f.replace(/\.html$/i, ''));
  for (const base of names) {
    const re = new RegExp(`(href|action)=(["'])${base}\\.html\\2`, 'gi');
    s = s.replace(re, `$1=$2/archive/${base}.html$2`);
  }
  s = s.replace(/action=(["'])feed\.html\1/gi, 'action=$1/archive/guestfeed.html$1');
  return s;
}

fs.mkdirSync(archiveDir, { recursive: true });

for (const name of files) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) {
    console.warn('skip missing', name);
    continue;
  }
  const raw = fs.readFileSync(src, 'utf8');
  const title = extractTitle(raw);
  const body = absolutizeArchiveLinks(extractBody(raw));

  const out = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${FONT_LINKS}
<meta name="robots" content="noindex">
<title>${title} · архив</title>
<link rel="icon" href="/img/fav1.ico">
<link rel="stylesheet" href="/archive/site.css">
</head>
<body>
${RETURN_2026}
${body}
</body>
</html>
`;
  fs.writeFileSync(path.join(archiveDir, name), out, 'utf8');
  fs.unlinkSync(src);
  console.log('archived', name);
}

/* Стили архива правьте вручную в public/archive/site.css (скрипт их не перезаписывает). */
const legacyPath = path.join(root, 'style', 'legacy-overlay.css');
const legacy = fs.existsSync(legacyPath) ? fs.readFileSync(legacyPath, 'utf8') : '';
if (legacy) {
  const siteCssPath = path.join(archiveDir, 'site.css');
  const cur = fs.existsSync(siteCssPath) ? fs.readFileSync(siteCssPath, 'utf8') : '';
  if (!cur.includes('/* injected from style/legacy-overlay.css */')) {
    fs.appendFileSync(siteCssPath, `\n/* injected from style/legacy-overlay.css */\n${legacy}\n`);
    console.log('appended legacy-overlay to site.css');
  }
}

const styleDir = path.join(root, 'style');
if (fs.existsSync(styleDir)) {
  fs.rmSync(styleDir, { recursive: true, force: true });
  console.log('removed style/');
}

console.log('done');
