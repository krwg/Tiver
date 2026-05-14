import {
  renderWelcome,
  renderLogin,
  renderRegister,
  renderPrivacy,
  renderGuestShell,
  renderAppShell,
  renderNotFound,
} from '../pages/index.js';

const GUEST_SEGMENTS = ['feed', 'messages', 'groups', 'friends', 'games', 'settings'];

const guestRoutes = Object.fromEntries(
  GUEST_SEGMENTS.map((segment) => [
    `/guest/${segment}`,
    { view: (ctx) => renderGuestShell({ ...ctx, segment }) },
  ]),
);

const APP_SECTIONS = ['feed', 'messages', 'groups', 'friends', 'games', 'profile'];

const appRoutes = Object.fromEntries(
  APP_SECTIONS.map((section) => [`/app/${section}`, { view: (ctx) => renderAppShell({ ...ctx, section }) }]),
);

export const routes = {
  '/welcome': { view: renderWelcome },
  '/login': { view: renderLogin },
  '/register': { view: renderRegister },
  '/privacy': { view: renderPrivacy },
  ...guestRoutes,
  ...appRoutes,
  '/404': { view: renderNotFound },
};
