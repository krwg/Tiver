/** Подписки на сообщества в гостевом режиме (localStorage). */

export const STORAGE_SUBS = 'tiver_guest_community_subs';
const LEGACY_1C = 'tiver_guest_sub_1c';

export function readSubs() {
  try {
    const j = localStorage.getItem(STORAGE_SUBS);
    if (j) {
      const o = JSON.parse(j);
      return o && typeof o === 'object' ? o : {};
    }
  } catch {
    /* ignore */
  }
  const o = {};
  try {
    if (localStorage.getItem(LEGACY_1C) === '1') o.prodsoft = true;
  } catch {
    /* ignore */
  }
  return o;
}

export function writeSubs(map) {
  try {
    localStorage.setItem(STORAGE_SUBS, JSON.stringify(map));
    localStorage.removeItem(LEGACY_1C);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('tiver-community-subs'));
}

export function isCommunitySubbed(slug) {
  return Boolean(slug && readSubs()[slug]);
}

export function setCommunitySub(slug, subscribed) {
  if (!slug) return;
  const m = { ...readSubs() };
  if (subscribed) m[slug] = true;
  else delete m[slug];
  writeSubs(m);
}

export function isProdsoftSubbed() {
  return isCommunitySubbed('prodsoft');
}
