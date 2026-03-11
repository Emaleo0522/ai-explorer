import * as THREE from 'three';
import BaseScene from '../BaseScene.js';
import BackButton from '../../components/ui/BackButton.js';
import SceneLabel from '../../components/ui/SceneLabel.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class MLScene extends BaseScene {
  constructor() {
    super('ml');
    this.nodes = [];
    this.connections = [];
    this.backBtn = null;
    this.label = null;
    this.controls = null;
    this.propagationPhase = 0;
    this.layers = [];
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x030712);
    engine.setBloom(1.0, 0.5, 0.7);

    engine.camera.position.set(0, 2, 12);
    engine.camera.lookAt(0, 0, 0);

    // Orbit controls
    this.controls = new OrbitControls(engine.camera, engine.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 5;

    // Lights
    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    engine.scene.add(ambient);
    const pointLight = new THREE.PointLight(0x3b82f6, 2, 30);
    pointLight.position.set(5, 5, 5);
    engine.scene.add(pointLight);

    // Create neural network
    this.createNetwork(engine);

    // UI
    this.backBtn = new BackButton();
    this.backBtn.create();
    this.label = new SceneLabel();
    this.label.create('MACHINE LEARNING', 'Neural network forward propagation');
  }

  createNetwork(engine) {
    const layerSizes = [4, 6, 8, 6, 3];
    const layerSpacing = 3;
    const nodeSpacing = 1.5;
    const startX = -((layerSizes.length - 1) * layerSpacing) / 2;

    // Create nodes per layer
    for (let l = 0; l < layerSizes.length; l++) {
      const layerNodes = [];
      const count = layerSizes[l];
      const startY = -((count - 1) * nodeSpacing) / 2;

      for (let n = 0; n < count; n++) {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.3,
          roughness: 0.3,
          metalness: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(startX + l * layerSpacing, startY + n * nodeSpacing, 0);
        engine.scene.add(mesh);
        layerNodes.push(mesh);
        this.nodes.push(mesh);
      }
      this.layers.push(layerNodes);
    }

    // Create connections between adjacent layers
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    for (let l = 0; l < this.layers.length - 1; l++) {
      for (const nodeA of this.layers[l]) {
        for (const nodeB of this.layers[l + 1]) {
          const points = [nodeA.position.clone(), nodeB.position.clone()];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geometry, connectionMaterial.clone());
          line.userData.layerIndex = l;
          engine.scene.add(line);
          this.connections.push(line);
        }
      }
    }
  }

  update(delta, elapsed) {
    if (this.controls) this.controls.update();

    // Forward propagation animation
    this.propagationPhase = (elapsed * 0.5) % (this.layers.length + 1);
    const activeLayer = Math.floor(this.propagationPhase);

    // Pulse nodes in active layer
    for (let l = 0; l < this.layers.length; l++) {
      const isActive = l === activeLayer;
      const intensity = isActive ? 0.8 + Math.sin(elapsed * 8) * 0.2 : 0.2;
      for (const node of this.layers[l]) {
        node.material.emissiveIntensity = intensity;
        const scale = isActive ? 1.2 : 1.0;
        node.scale.setScalar(scale);
      }
    }

    // Light up connections for active layer
    for (const conn of this.connections) {
      const isActive = conn.userData.layerIndex === activeLayer - 1 ||
                       conn.userData.layerIndex === activeLayer;
      conn.material.opacity = isActive ? 0.5 : 0.08;
    }
  }

  dispose() {
    if (this.controls) this.controls.dispose();
    for (const node of this.nodes) {
      node.geometry.dispose();
      node.material.dispose();
    }
    for (const conn of this.connections) {
      conn.geometry.dispose();
      conn.material.dispose();
    }
    if (this.backBtn) this.backBtn.dispose();
    if (this.label) this.label.dispose();
    super.dispose();
  }
}
