import * as THREE from 'three';
import gsap from 'gsap';
import BaseScene from './BaseScene.js';
import ParticleField from '../components/ParticleField.js';
import LandingOverlay from '../components/ui/LandingOverlay.js';

export default class LandingScene extends BaseScene {
  constructor() {
    super('landing');
    this.particles = null;
    this.overlay = null;
    this.cameraTimeline = null;
  }

  async init(engine) {
    await super.init(engine);

    // Set dark background
    engine.scene.background = new THREE.Color(0x030712);

    // Bloom settings for landing
    engine.setBloom(1.2, 0.5, 0.7);

    // Camera start position (far away)
    engine.camera.position.set(0, 15, 60);
    engine.camera.lookAt(0, 0, 0);

    // Create galaxy particle field
    this.particles = new ParticleField({
      count: 6000,
      radius: 40,
      spiralArms: 4,
      spiralTightness: 0.6,
      colors: [
        new THREE.Color(0x00f0ff),
        new THREE.Color(0xff00e5),
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0x00ff88),
        new THREE.Color(0x3b82f6),
      ],
    });
    engine.scene.add(this.particles.create());

    // Ambient light for subtle illumination
    const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    engine.scene.add(ambientLight);

    // Central glow point
    const centerLight = new THREE.PointLight(0x00f0ff, 2, 30);
    centerLight.position.set(0, 0, 0);
    engine.scene.add(centerLight);

    // Camera dolly-in animation
    this.cameraTimeline = gsap.timeline();
    this.cameraTimeline.to(engine.camera.position, {
      x: 0,
      y: 5,
      z: 25,
      duration: 4,
      ease: 'power2.inOut',
    });

    // Show UI overlay after camera settles
    this.overlay = new LandingOverlay();
    this.overlay.create();
    this.overlay.show(1.5); // delay before showing
  }

  update(delta, elapsed) {
    if (this.particles) {
      this.particles.update(elapsed);
    }

    // Gentle camera sway
    if (this.engine) {
      this.engine.camera.position.x += Math.sin(elapsed * 0.1) * 0.002;
      this.engine.camera.position.y += Math.cos(elapsed * 0.15) * 0.001;
    }
  }

  dispose() {
    if (this.particles) this.particles.dispose();
    if (this.overlay) this.overlay.dispose();
    if (this.cameraTimeline) this.cameraTimeline.kill();
    super.dispose();
  }
}
