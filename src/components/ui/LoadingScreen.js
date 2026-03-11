import gsap from 'gsap';

export default class LoadingScreen {
  constructor() {
    this.container = null;
    this.style = null;
    this.progressBar = null;
  }

  create() {
    this.container = document.createElement('div');
    this.container.id = 'loading-screen';
    this.container.innerHTML = `
      <div class="loading-content">
        <div class="loading-tag">[SYSTEM]</div>
        <h2 class="loading-title">INITIALIZING</h2>
        <div class="loading-bar-container">
          <div class="loading-bar" id="loading-bar"></div>
        </div>
        <div class="loading-status" id="loading-status">Loading modules...</div>
      </div>
    `;
    document.body.appendChild(this.container);

    this.style = document.createElement('style');
    this.style.textContent = `
      #loading-screen {
        position: fixed;
        inset: 0;
        background: #030712;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .loading-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .loading-tag {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #00ff88;
        letter-spacing: 3px;
      }
      .loading-title {
        font-family: 'Courier New', monospace;
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 8px;
      }
      .loading-bar-container {
        width: 200px;
        height: 2px;
        background: rgba(0, 240, 255, 0.15);
        border-radius: 2px;
        overflow: hidden;
      }
      .loading-bar {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #00f0ff, #ff00e5);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      .loading-status {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #64748b;
        letter-spacing: 1px;
      }
    `;
    document.head.appendChild(this.style);

    this.progressBar = document.getElementById('loading-bar');
  }

  setProgress(pct, statusText) {
    if (this.progressBar) {
      this.progressBar.style.width = `${pct}%`;
    }
    const statusEl = document.getElementById('loading-status');
    if (statusEl && statusText) {
      statusEl.textContent = statusText;
    }
  }

  async hide() {
    return new Promise((resolve) => {
      gsap.to(this.container, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
          resolve();
        },
      });
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
