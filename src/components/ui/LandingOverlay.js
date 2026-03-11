import gsap from 'gsap';
import sceneManager from '../../engine/SceneManager.js';

export default class LandingOverlay {
  constructor() {
    this.container = null;
    this.timeline = null;
  }

  create() {
    const overlay = document.getElementById('ui-overlay');

    this.container = document.createElement('div');
    this.container.id = 'landing-overlay';
    this.container.innerHTML = `
      <div class="landing-content">
        <div class="landing-tag">
          <span class="tag-bracket">[</span>
          <span class="tag-text">SYSTEM ONLINE</span>
          <span class="tag-bracket">]</span>
        </div>
        <h1 class="landing-title">
          <span class="title-line">AI FUTURE</span>
          <span class="title-line title-accent">EXPLORER</span>
        </h1>
        <p class="landing-subtitle">Navigate the frontiers of artificial intelligence</p>
        <div class="landing-divider"></div>
        <button class="btn-neon landing-cta" id="btn-explore">
          <span class="btn-icon">&#9654;</span>
          EXPLORE
        </button>
      </div>
    `;
    overlay.appendChild(this.container);

    // Inject scoped styles
    this.style = document.createElement('style');
    this.style.textContent = `
      #landing-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-hud);
        pointer-events: none;
      }
      .landing-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        pointer-events: auto;
      }
      .landing-tag {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-green);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        opacity: 0;
      }
      .tag-bracket {
        color: var(--color-gray-500);
      }
      .landing-title {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin: var(--space-2) 0;
      }
      .title-line {
        font-family: var(--font-display);
        font-size: var(--text-4xl);
        font-weight: 900;
        letter-spacing: var(--tracking-wider);
        color: var(--text-primary);
        opacity: 0;
        line-height: 1.0;
      }
      .title-accent {
        color: var(--accent-primary);
        text-shadow: 0 0 20px rgba(var(--color-cyan-rgb), 0.5),
                     0 0 40px rgba(var(--color-cyan-rgb), 0.2);
      }
      .landing-subtitle {
        font-family: var(--font-sans);
        font-size: var(--text-lg);
        color: var(--text-secondary);
        letter-spacing: var(--tracking-wide);
        opacity: 0;
        max-width: 500px;
      }
      .landing-divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
        opacity: 0;
      }
      .landing-cta {
        font-size: var(--text-base);
        padding: var(--space-4) var(--space-10);
        opacity: 0;
        margin-top: var(--space-4);
      }
      .btn-icon {
        font-size: 0.7em;
        margin-right: var(--space-1);
      }
      @media (max-width: 480px) {
        .title-line { font-size: var(--text-3xl); }
        .landing-subtitle { font-size: var(--text-base); padding: 0 var(--space-4); }
      }
    `;
    document.head.appendChild(this.style);

    // Button click handler
    document.getElementById('btn-explore').addEventListener('click', () => {
      this.hide().then(() => {
        sceneManager.goTo('solarSystem');
      });
    });
  }

  show(delay = 0) {
    const elements = this.container.querySelectorAll('.landing-tag, .title-line, .landing-subtitle, .landing-divider, .landing-cta');

    this.timeline = gsap.timeline({ delay });
    this.timeline
      .to(this.container.querySelector('.landing-tag'), {
        opacity: 1, duration: 0.8, ease: 'power2.out',
      })
      .to(this.container.querySelectorAll('.title-line'), {
        opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
        onStart: () => {
          this.container.querySelectorAll('.title-line').forEach(el => {
            gsap.set(el, { y: 30 });
          });
        },
      }, '-=0.3')
      .to(this.container.querySelector('.landing-subtitle'), {
        opacity: 1, duration: 0.8, ease: 'power2.out',
      }, '-=0.5')
      .to(this.container.querySelector('.landing-divider'), {
        opacity: 0.5, width: 120, duration: 0.6, ease: 'power2.out',
      }, '-=0.3')
      .to(this.container.querySelector('.landing-cta'), {
        opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)',
        onStart: () => gsap.set(this.container.querySelector('.landing-cta'), { scale: 0.9 }),
      }, '-=0.2');
  }

  async hide() {
    return new Promise((resolve) => {
      gsap.to(this.container, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: resolve,
      });
    });
  }

  dispose() {
    if (this.timeline) this.timeline.kill();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.style && this.style.parentNode) {
      this.style.parentNode.removeChild(this.style);
    }
  }
}
