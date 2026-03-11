import gsap from 'gsap';

export default class SceneLabel {
  constructor() {
    this.container = null;
    this.style = null;
  }

  create(title, subtitle = '') {
    const overlay = document.getElementById('ui-overlay');

    this.container = document.createElement('div');
    this.container.className = 'scene-label';
    this.container.innerHTML = `
      <h2 class="scene-label-title">${title}</h2>
      ${subtitle ? `<p class="scene-label-subtitle">${subtitle}</p>` : ''}
    `;
    overlay.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      .scene-label {
        position: fixed;
        bottom: var(--space-8);
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        z-index: var(--z-hud);
        pointer-events: none;
      }
      .scene-label-title {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--accent-primary);
        letter-spacing: var(--tracking-wider);
        text-shadow: 0 0 20px rgba(var(--color-cyan-rgb), 0.3);
        margin-bottom: var(--space-1);
      }
      .scene-label-subtitle {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        color: var(--text-muted);
        letter-spacing: var(--tracking-wide);
      }
    `;
    document.head.appendChild(this.style);

    gsap.from(this.container, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'power3.out',
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
