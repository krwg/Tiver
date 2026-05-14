import '@fontsource/press-start-2p/400.css';
import './styles/main.css';
import { applyTheme, getTheme, reconcileThemeAfterStorage } from './lib/theme.js';
import { getLocale } from './lib/locale.js';
import { mountApp } from './app/mountApp.js';
import { bootstrapAuth } from './auth/bootstrapAuth.js';
import { initRouter } from './router/router.js';
import { initLinkInterceptor } from './router/linkInterceptor.js';

document.documentElement.setAttribute('lang', getLocale() === 'en' ? 'en' : 'ru');
applyTheme(getTheme());
reconcileThemeAfterStorage();
mountApp();
bootstrapAuth().then(() => {
  initRouter();
  initLinkInterceptor();
});
