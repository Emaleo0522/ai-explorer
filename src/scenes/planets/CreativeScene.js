import * as THREE from 'three';
import BaseScene from '../BaseScene.js';
import BackButton from '../../components/ui/BackButton.js';
import SceneLabel from '../../components/ui/SceneLabel.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class CreativeScene extends BaseScene {
  constructor() {
    super('creative');
    this.artObjects = [];
    this.backBtn = null;
    this.label = null;
    this.controls = null;
    this.group = new THREE.Group();
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x0a0010);
    engine.setBloom(1.2, 0.6, 0.6);

    engine.camera.position.set(0, 3, 10);
    engine.camera.lookAt(0, 0, 0);

    // Orbit controls
    this.controls = new OrbitControls(engine.camera, engine.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;
    this.controls.maxDistance = 20;
    this.controls.minDistance = 4;

    // Lights
    const ambient = new THREE.AmbientLight(0x220033, 0.5);
    engine.scene.add(ambient);
    const light1 = new THREE.PointLight(0xff00e5, 2, 20);
    light1.position.set(5, 5, 5);
    engine.scene.add(light1);
    const light2 = new THREE.PointLight(0x8b5cf6, 1.5, 20);
    light2.position.set(-5, -3, -5);
    engine.scene.add(light2);

    engine.scene.add(this.group);
    this.generateArt();

    // Click to regenerate
    this._onClick = () => this.generateArt();
    window.addEventListener('click', this._onClick);

    // UI
    this.backBtn = new BackButton();
    this.backBtn.create();
    this.label = new SceneLabel();
    this.label.create('CREATIVE AI', 'Click anywhere to generate new art');
  }

  generateArt() {
    // Clear existing
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.group.remove(child);
    }

    const geometries = [
      () => new THREE.TorusGeometry(1 + Math.random() * 2, 0.2 + Math.random() * 0.5, 16, 64),
      () => new THREE.TorusKnotGeometry(1 + Math.random(), 0.3 + Math.random() * 0.3, 128, 16, Math.floor(Math.random() * 4) + 2, Math.floor(Math.random() * 6) + 1),
      () => new THREE.IcosahedronGeometry(1 + Math.random() * 1.5, Math.floor(Math.random() * 3)),
      () => new THREE.OctahedronGeometry(1 + Math.random() * 1.5, 0),
      () => new THREE.DodecahedronGeometry(1 + Math.random(), Math.floor(Math.random() * 2)),
    ];

    const colors = [0xff00e5, 0x8b5cf6, 0xff69b4, 0xc026d3, 0xa855f7, 0xe879f9];
    const count = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const geomFactory = geometries[Math.floor(Math.random() * geometries.length)];
      const geometry = geomFactory();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isWireframe = Math.random() > 0.4;

      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        wireframe: isWireframe,
        roughness: 0.3,
        metalness: 0.6,
        transparent: !isWireframe,
        opacity: isWireframe ? 1 : 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData.rotSpeed = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.3,
      };

      this.group.add(mesh);
    }
  }

  update(delta, elapsed) {
    if (this.controls) this.controls.update();

    for (const child of this.group.children) {
      if (child.userData.rotSpeed) {
        child.rotation.x += child.userData.rotSpeed.x * delta;
        child.rotation.y += child.userData.rotSpeed.y * delta;
        child.rotation.z += child.userData.rotSpeed.z * delta;
      }
      // Gentle breathing scale
      const s = 1 + Math.sin(elapsed * 0.5 + child.position.x) * 0.05;
      child.scale.setScalar(s);
    }
  }

  dispose() {
    if (this._onClick) window.removeEventListener('click', this._onClick);
    if (this.controls) this.controls.dispose();
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.group.remove(child);
    }
    if (this.backBtn) this.backBtn.dispose();
    if (this.label) this.label.dispose();
    super.dispose();
  }
}
