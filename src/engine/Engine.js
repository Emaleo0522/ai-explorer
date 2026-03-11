import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class Engine {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.composer = null;
    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.animationId = null;
    this.onUpdateCallbacks = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  init(container) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.canvas = this.renderer.domElement;
    container.appendChild(this.canvas);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // Post-processing
    this.setupPostProcessing();

    // Resize handler
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    return this;
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.8,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(this.bloomPass);
  }

  setBloom(strength = 0.8, radius = 0.4, threshold = 0.85) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
      this.bloomPass.radius = radius;
      this.bloomPass.threshold = threshold;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
    return () => {
      const idx = this.onUpdateCallbacks.indexOf(callback);
      if (idx > -1) this.onUpdateCallbacks.splice(idx, 1);
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this.loop());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    for (const cb of this.onUpdateCallbacks) {
      cb(delta, elapsed);
    }

    this.composer.render();
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    this.composer.dispose();
    this.onUpdateCallbacks = [];
  }

  // Helper: clear scene except camera and lights
  clearScene() {
    const toRemove = [];
    this.scene.traverse((child) => {
      if (child !== this.scene && child !== this.camera) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
      this.scene.remove(obj);
    });
  }
}

// Singleton
const engine = new Engine();
export default engine;
