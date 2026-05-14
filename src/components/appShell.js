export function createAppShell() {
  const shell = document.createElement('div');
  shell.className = 'app-shell';
  shell.innerHTML = `
    <div id="router-outlet" class="router-outlet" aria-live="polite"></div>
  `;
  return shell;
}
