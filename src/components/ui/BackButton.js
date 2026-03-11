import sceneManager from '../../engine/SceneManager.js';

export default class BackButton {
  constructor() {
    this.container = null;
    this.style = null;
  }

  create(label = 'BACK TO SYSTEM') {
    const overlay = document.getElementById('ui-overlay');

    this.container = document.createElement('button');
    this.container.className = 'scene-back-btn';
    this.container.innerHTML = `<span class="back-arrow">&#8592;</span> ${label}`;
    overlay.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      .scene-back-btn {
        position: fixed;
        top: var(--space-6);
        left: var(--space-6);
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--duration-fast) ease;
        letter-spacing: var(--tracking-wide);
        z-index: var(--z-hud);
        pointer-events: auto;
      }
      .scene-back-btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        box-shadow: 0 0 10px rgba(var(--color-cyan-rgb), 0.2);
      }
      .scene-back-btn .back-arrow {
        margin-right: var(--space-1);
      }
    `;
    document.head.appendChild(this.style);

    this.container.addEventListener('click', () => {
      sceneManager.goBack();
    });
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
