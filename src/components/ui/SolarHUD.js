import gsap from 'gsap';
import sceneManager from '../../engine/SceneManager.js';

export default class SolarHUD {
  constructor(planetConfigs) {
    this.planetConfigs = planetConfigs;
    this.container = null;
    this.style = null;
    this.highlighted = null;
  }

  create() {
    const overlay = document.getElementById('ui-overlay');

    this.container = document.createElement('div');
    this.container.id = 'solar-hud';
    this.container.innerHTML = `
      <div class="hud-header">
        <button class="hud-back-btn" id="hud-back">
          <span class="back-arrow">&#8592;</span> BACK
        </button>
        <div class="hud-title-group">
          <span class="hud-label">NAVIGATION</span>
          <span class="hud-system-name">AI FRONTIER</span>
        </div>
      </div>
      <div class="hud-divider"></div>
      <ul class="planet-list">
        ${this.planetConfigs.map(p => `
          <li class="planet-item" data-planet="${p.name}">
            <span class="planet-dot" style="background: ${this.colorToHex(p.color)}; box-shadow: 0 0 8px ${this.colorToHex(p.color)};"></span>
            <span class="planet-name">${p.label}</span>
          </li>
        `).join('')}
      </ul>
    `;
    overlay.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      #solar-hud {
        position: fixed;
        top: var(--space-6);
        left: var(--space-6);
        width: 220px;
        padding: var(--space-4);
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        z-index: var(--z-hud);
        pointer-events: auto;
      }
      .hud-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-3);
      }
      .hud-back-btn {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--duration-fast) ease;
        letter-spacing: var(--tracking-wide);
      }
      .hud-back-btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .back-arrow { margin-right: 2px; }
      .hud-title-group {
        display: flex;
        flex-direction: column;
      }
      .hud-label {
        font-family: var(--font-mono);
        font-size: 0.55rem;
        color: var(--text-muted);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
      }
      .hud-system-name {
        font-family: var(--font-display);
        font-size: var(--text-sm);
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: var(--tracking-wide);
      }
      .hud-divider {
        height: 1px;
        background: linear-gradient(90deg, var(--accent-primary), transparent);
        opacity: 0.3;
        margin-bottom: var(--space-3);
      }
      .planet-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .planet-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-2);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--duration-fast) ease;
      }
      .planet-item:hover,
      .planet-item.active {
        background: rgba(var(--color-cyan-rgb), 0.08);
      }
      .planet-item.active .planet-name {
        color: var(--accent-primary);
      }
      .planet-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .planet-name {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        color: var(--text-secondary);
        letter-spacing: var(--tracking-wide);
        transition: color var(--duration-fast) ease;
      }
      @media (max-width: 768px) {
        #solar-hud {
          top: auto;
          bottom: var(--space-4);
          left: var(--space-4);
          right: var(--space-4);
          width: auto;
          padding: var(--space-3);
        }
        .planet-list {
          flex-direction: row;
          flex-wrap: wrap;
          gap: var(--space-1);
        }
        .planet-name { display: none; }
        .planet-dot { width: 12px; height: 12px; }
      }
    `;
    document.head.appendChild(this.style);

    // Back button
    document.getElementById('hud-back').addEventListener('click', () => {
      sceneManager.goBack();
    });

    // Planet list clicks
    this.container.querySelectorAll('.planet-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.dataset.planet;
        sceneManager.goTo(name);
      });
    });

    // Entry animation
    gsap.from(this.container, {
      x: -50,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
      ease: 'power3.out',
    });
  }

  setHighlighted(planetName) {
    this.container.querySelectorAll('.planet-item').forEach(item => {
      item.classList.toggle('active', item.dataset.planet === planetName);
    });
  }

  colorToHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
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
