export default class ThemeToggle {
  constructor() {
    this.container = null;
    this.style = null;
    this.isDark = true;
  }

  create() {
    const overlay = document.getElementById('ui-overlay');

    // Read saved preference
    const saved = localStorage.getItem('ai-explorer-theme');
    if (saved === 'light') {
      this.isDark = false;
      document.documentElement.setAttribute('data-theme', 'light');
    }

    this.container = document.createElement('button');
    this.container.id = 'theme-toggle';
    this.container.className = 'ui-toggle-btn';
    this.container.title = 'Toggle Theme';
    this.updateIcon();
    overlay.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      #theme-toggle {
        top: var(--space-6);
        right: calc(var(--space-6) + 44px);
      }
    `;
    document.head.appendChild(this.style);

    this.container.addEventListener('click', () => {
      this.isDark = !this.isDark;
      const theme = this.isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ai-explorer-theme', theme);
      this.updateIcon();

      // Dispatch event for Three.js scenes to react
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    });
  }

  updateIcon() {
    if (!this.container) return;
    this.container.innerHTML = this.isDark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  }

  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.style && this.style.parentNode) {
      this.style.parentNode.removeChild(this.style);
    }
  }
}
