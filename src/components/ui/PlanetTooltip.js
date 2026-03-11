import engine from '../../engine/Engine.js';
import * as THREE from 'three';

export default class PlanetTooltip {
  constructor() {
    this.container = null;
    this.style = null;
    this.visible = false;
    this.currentPlanet = null;
  }

  create() {
    this.container = document.createElement('div');
    this.container.id = 'planet-tooltip';
    this.container.innerHTML = `
      <div class="tooltip-name"></div>
      <div class="tooltip-desc"></div>
      <div class="tooltip-hint">CLICK TO EXPLORE</div>
    `;
    document.getElementById('ui-overlay').appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      #planet-tooltip {
        position: fixed;
        pointer-events: none;
        z-index: var(--z-tooltip);
        padding: var(--space-3) var(--space-4);
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        opacity: 0;
        transform: translateY(5px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        max-width: 220px;
      }
      #planet-tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .tooltip-name {
        font-family: var(--font-display);
        font-size: var(--text-sm);
        font-weight: 700;
        color: var(--accent-primary);
        letter-spacing: var(--tracking-wide);
        text-transform: uppercase;
        margin-bottom: var(--space-1);
      }
      .tooltip-desc {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: 1.4;
        margin-bottom: var(--space-2);
      }
      .tooltip-hint {
        font-family: var(--font-mono);
        font-size: 0.6rem;
        color: var(--color-gray-500);
        letter-spacing: var(--tracking-widest);
      }
    `;
    document.head.appendChild(this.style);
  }

  show(planetData, worldPosition) {
    if (!this.container) return;
    this.visible = true;
    this.currentPlanet = { data: planetData, worldPos: worldPosition };

    this.container.querySelector('.tooltip-name').textContent = planetData.label;
    this.container.querySelector('.tooltip-desc').textContent = planetData.description;
    this.container.classList.add('visible');

    this.updatePosition(worldPosition);
  }

  hide() {
    if (!this.container) return;
    this.visible = false;
    this.currentPlanet = null;
    this.container.classList.remove('visible');
  }

  updatePosition(worldPos) {
    if (!this.container || !worldPos) return;

    // Project 3D position to screen
    const pos = worldPos.clone();
    pos.project(engine.camera);

    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    this.container.style.left = `${x + 20}px`;
    this.container.style.top = `${y - 30}px`;
  }

  update() {
    if (this.visible && this.currentPlanet) {
      this.updatePosition(this.currentPlanet.worldPos);
    }
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
