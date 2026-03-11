import * as THREE from 'three';
import gsap from 'gsap';
import BaseScene from './BaseScene.js';
import Planet from '../components/Planet.js';
import Sun from '../components/Sun.js';
import OrbitRing from '../components/OrbitRing.js';
import StarField from '../components/StarField.js';
import interaction from '../engine/Interaction.js';
import PlanetTooltip from '../components/ui/PlanetTooltip.js';
import SolarHUD from '../components/ui/SolarHUD.js';
import sceneManager from '../engine/SceneManager.js';

const PLANET_CONFIG = [
  {
    name: 'ml',
    label: 'Machine Learning',
    color: 0x3b82f6,
    radius: 0.8,
    orbitRadius: 8,
    orbitSpeed: 0.3,
    orbitOffset: 0,
    description: 'Neural networks learning from data to make predictions and decisions.',
    sceneName: 'ml',
  },
  {
    name: 'agents',
    label: 'Autonomous Agents',
    color: 0x00ff88,
    radius: 0.7,
    orbitRadius: 12,
    orbitSpeed: 0.22,
    orbitOffset: Math.PI * 0.4,
    description: 'Self-directed entities that perceive, decide, and act in their environment.',
    sceneName: 'agents',
  },
  {
    name: 'creative',
    label: 'Creative AI',
    color: 0xff00e5,
    radius: 0.9,
    orbitRadius: 16,
    orbitSpeed: 0.17,
    orbitOffset: Math.PI * 0.8,
    description: 'Generative systems that produce art, music, and novel designs.',
    sceneName: 'creative',
  },
  {
    name: 'robotics',
    label: 'Robotics',
    color: 0xff8a00,
    radius: 0.75,
    orbitRadius: 20,
    orbitSpeed: 0.13,
    orbitOffset: Math.PI * 1.2,
    description: 'Physical intelligence — machines that move, sense, and manipulate.',
    sceneName: 'robotics',
  },
  {
    name: 'collective',
    label: 'Collective Intelligence',
    color: 0x00f0ff,
    radius: 0.85,
    orbitRadius: 24,
    orbitSpeed: 0.1,
    orbitOffset: Math.PI * 1.6,
    description: 'Emergent wisdom from swarms, networks, and distributed systems.',
    sceneName: 'collective',
  },
];

export default class SolarSystemScene extends BaseScene {
  constructor() {
    super('solarSystem');
    this.sun = null;
    this.planets = [];
    this.orbitRings = [];
    this.starField = null;
    this.tooltip = null;
    this.hud = null;
    this._unsubHover = null;
    this._unsubClick = null;
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x030712);
    engine.setBloom(0.9, 0.4, 0.8);

    // Camera position for solar system view
    engine.camera.position.set(0, 18, 30);
    engine.camera.lookAt(0, 0, 0);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    engine.scene.add(ambientLight);

    // Stars background
    this.starField = new StarField(3000, 300);
    engine.scene.add(this.starField.create());

    // Sun
    this.sun = new Sun(2.5);
    engine.scene.add(this.sun.create());

    // Planets + orbit rings
    for (const config of PLANET_CONFIG) {
      const planet = new Planet(config);
      engine.scene.add(planet.create());
      this.planets.push(planet);

      const ring = new OrbitRing(config.orbitRadius, config.color);
      engine.scene.add(ring.create());
      this.orbitRings.push(ring);
    }

    // Tooltip
    this.tooltip = new PlanetTooltip();
    this.tooltip.create();

    // HUD
    this.hud = new SolarHUD(PLANET_CONFIG);
    this.hud.create();

    // Interaction
    interaction.enable();

    this._unsubHover = interaction.onHover((hovered, unhovered) => {
      // Unhover all planets first
      for (const p of this.planets) {
        p.setHovered(false);
      }

      if (hovered) {
        const planetObj = this.planets.find(p => p.name === hovered.userData.name);
        if (planetObj) {
          planetObj.setHovered(true);
          this.tooltip.show(hovered.userData, planetObj.getWorldPosition());
          this.hud.setHighlighted(planetObj.name);
        }
      } else {
        this.tooltip.hide();
        this.hud.setHighlighted(null);
      }
    });

    this._unsubClick = interaction.onClick((clicked) => {
      const sceneName = clicked.userData.sceneName;
      if (sceneName) {
        const planetObj = this.planets.find(p => p.name === clicked.userData.name);
        if (planetObj) {
          this.zoomToPlanet(planetObj, sceneName);
        }
      }
    });

    // Entry animation
    gsap.from(engine.camera.position, {
      y: 40,
      z: 50,
      duration: 2,
      ease: 'power3.out',
    });
  }

  zoomToPlanet(planet, sceneName) {
    interaction.disable();
    this.tooltip.hide();

    const targetPos = planet.getWorldPosition();
    gsap.to(this.engine.camera.position, {
      x: targetPos.x,
      y: targetPos.y + 2,
      z: targetPos.z + 3,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        sceneManager.goTo(sceneName);
      },
    });
  }

  update(delta, elapsed) {
    if (this.sun) this.sun.update(elapsed);
    for (const planet of this.planets) {
      planet.update(elapsed);
    }
    if (this.tooltip) this.tooltip.update();
    if (this.starField && this.starField.mesh) {
      this.starField.mesh.rotation.y = elapsed * 0.005;
    }
  }

  dispose() {
    if (this._unsubHover) this._unsubHover();
    if (this._unsubClick) this._unsubClick();
    interaction.disable();
    if (this.sun) this.sun.dispose();
    for (const planet of this.planets) planet.dispose();
    for (const ring of this.orbitRings) ring.dispose();
    if (this.starField) this.starField.dispose();
    if (this.tooltip) this.tooltip.dispose();
    if (this.hud) this.hud.dispose();
    super.dispose();
  }
}
