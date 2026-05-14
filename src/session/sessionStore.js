// Состояние клиентской сессии (гость / пользователь + JWT для API).
let state = {
  mode: 'guest',
  user: null,
  token: null,
};

const listeners = new Set();

export function getSession() {
  return { ...state };
}

export function subscribeSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSession(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(getSession()));
}

export function clearAuth() {
  localStorage.removeItem('tiver_token');
  state = { mode: 'guest', user: null, token: null };
  listeners.forEach((fn) => fn(getSession()));
}
