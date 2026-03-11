import audioManager from '../../engine/AudioManager.js';

export default class AudioToggle {
  constructor() {
    this.container = null;
    this.style = null;
    this.isMuted = false;
  }

  create() {
    const overlay = document.getElementById('ui-overlay');

    this.container = document.createElement('button');
    this.container.id = 'audio-toggle';
    this.container.className = 'ui-toggle-btn';
    this.container.title = 'Toggle Audio';
    this.updateIcon();
    overlay.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      .ui-toggle-btn {
        position: fixed;
        width: 36px;
        height: 36px;
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--duration-fast) ease;
        z-index: var(--z-hud);
        pointer-events: auto;
      }
      .ui-toggle-btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      #audio-toggle {
        top: var(--space-6);
        right: var(--space-6);
      }
    `;
    document.head.appendChild(this.style);

    this.container.addEventListener('click', () => {
      this.isMuted = audioManager.toggleMute();
      this.updateIcon();
    });
  }

  updateIcon() {
    if (!this.container) return;
    this.container.innerHTML = this.isMuted
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>';
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
