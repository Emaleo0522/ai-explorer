import gsap from 'gsap';
import engine from './Engine.js';

class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneName = null;
    this.isTransitioning = false;
    this.transitionOverlay = null;
    this.history = [];
  }

  init() {
    // Create transition overlay
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'scene-transition';
    document.body.appendChild(this.transitionOverlay);
  }

  register(name, sceneInstance) {
    this.scenes.set(name, sceneInstance);
  }

  async goTo(name, options = {}) {
    if (this.isTransitioning) return;
    if (this.currentSceneName === name) return;

    const nextScene = this.scenes.get(name);
    if (!nextScene) {
      console.error(`Scene "${name}" not registered`);
      return;
    }

    this.isTransitioning = true;
    const duration = options.duration || 0.6;

    // Push to history for back navigation
    if (this.currentSceneName && !options.skipHistory) {
      this.history.push(this.currentSceneName);
    }

    // Fade out
    await gsap.to(this.transitionOverlay, {
      opacity: 1,
      duration: duration / 2,
      ease: 'power2.inOut',
    });

    // Dispose current scene
    if (this.currentScene) {
      this.currentScene.dispose();
    }

    // Clear Three.js scene
    engine.clearScene();
    engine.onUpdateCallbacks = [];

    // Init next scene
    this.currentScene = nextScene;
    this.currentSceneName = name;
    await nextScene.init(engine);

    // Fade in
    await gsap.to(this.transitionOverlay, {
      opacity: 0,
      duration: duration / 2,
      ease: 'power2.inOut',
    });

    this.isTransitioning = false;
  }

  async goBack() {
    if (this.history.length === 0) return;
    const prev = this.history.pop();
    await this.goTo(prev, { skipHistory: true });
  }

  canGoBack() {
    return this.history.length > 0;
  }

  getCurrentSceneName() {
    return this.currentSceneName;
  }
}

const sceneManager = new SceneManager();
export default sceneManager;
