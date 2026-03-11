import * as THREE from 'three';
import BaseScene from '../BaseScene.js';
import BackButton from '../../components/ui/BackButton.js';
import SceneLabel from '../../components/ui/SceneLabel.js';

export default class CollectiveScene extends BaseScene {
  constructor() {
    super('collective');
    this.points = null;
    this.positions = null;
    this.targets = null;
    this.velocities = null;
    this.count = 2500;
    this.backBtn = null;
    this.label = null;
    this.mouse3D = new THREE.Vector3(0, 0, 0);
    this.currentShape = 0;
    this.shapeTimer = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouseNDC = new THREE.Vector2();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x020810);
    engine.setBloom(1.0, 0.5, 0.65);

    engine.camera.position.set(0, 0, 15);
    engine.camera.lookAt(0, 0, 0);

    // Light
    const ambient = new THREE.AmbientLight(0x001122, 0.5);
    engine.scene.add(ambient);

    // Create particle system
    this.createParticles(engine);

    // Generate first shape targets
    this.generateShapeTargets('sphere');

    // Mouse tracking
    this._onMouseMove = (e) => {
      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseNDC, engine.camera);
      const intersectPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.plane, intersectPoint);
      if (intersectPoint) this.mouse3D.copy(intersectPoint);
    };
    window.addEventListener('mousemove', this._onMouseMove);

    // UI
    this.backBtn = new BackButton();
    this.backBtn.create();
    this.label = new SceneLabel();
    this.label.create('COLLECTIVE INTELLIGENCE', 'Emergent patterns from particle swarms');
  }

  createParticles(engine) {
    this.positions = new Float32Array(this.count * 3);
    this.targets = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    const baseColor = new THREE.Color(0x00f0ff);
    const altColor = new THREE.Color(0x00ccdd);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      // Random starting positions
      this.positions[i3] = (Math.random() - 0.5) * 20;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 20;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 5;

      this.velocities[i3] = 0;
      this.velocities[i3 + 1] = 0;
      this.velocities[i3 + 2] = 0;

      const c = Math.random() > 0.5 ? baseColor : altColor;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);
          vAlpha = size / 2.0;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, dist) * vAlpha;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    engine.scene.add(this.points);
  }

  generateShapeTargets(shape) {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      let x, y, z;

      switch (shape) {
        case 'sphere': {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 5;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
          break;
        }
        case 'cube': {
          x = (Math.random() - 0.5) * 8;
          y = (Math.random() - 0.5) * 8;
          z = (Math.random() - 0.5) * 4;
          // Project to surface
          const face = Math.floor(Math.random() * 6);
          if (face === 0) x = 4;
          else if (face === 1) x = -4;
          else if (face === 2) y = 4;
          else if (face === 3) y = -4;
          else if (face === 4) z = 2;
          else z = -2;
          break;
        }
        case 'spiral': {
          const t = i / this.count;
          const angle = t * Math.PI * 8;
          const r2 = t * 6;
          x = Math.cos(angle) * r2;
          y = Math.sin(angle) * r2;
          z = (t - 0.5) * 4;
          break;
        }
        case 'torus': {
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * Math.PI * 2;
          const R = 4, rr = 1.5;
          x = (R + rr * Math.cos(v)) * Math.cos(u);
          y = (R + rr * Math.cos(v)) * Math.sin(u);
          z = rr * Math.sin(v);
          break;
        }
        default: {
          x = (Math.random() - 0.5) * 10;
          y = (Math.random() - 0.5) * 10;
          z = (Math.random() - 0.5) * 5;
        }
      }

      this.targets[i3] = x;
      this.targets[i3 + 1] = y;
      this.targets[i3 + 2] = z;
    }
  }

  update(delta, elapsed) {
    if (!this.positions || !this.points) return;
    const dt = Math.min(delta, 0.05);

    // Switch shapes every 5 seconds
    this.shapeTimer += dt;
    if (this.shapeTimer > 5) {
      this.shapeTimer = 0;
      const shapes = ['sphere', 'cube', 'spiral', 'torus'];
      this.currentShape = (this.currentShape + 1) % shapes.length;
      this.generateShapeTargets(shapes[this.currentShape]);
    }

    // Update particles toward targets with mouse attraction
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Move toward target
      const dx = this.targets[i3] - this.positions[i3];
      const dy = this.targets[i3 + 1] - this.positions[i3 + 1];
      const dz = this.targets[i3 + 2] - this.positions[i3 + 2];

      // Mouse attraction
      const mx = this.mouse3D.x - this.positions[i3];
      const my = this.mouse3D.y - this.positions[i3 + 1];
      const mDist = Math.sqrt(mx * mx + my * my);
      const mouseForce = mDist < 5 ? 2.0 / (mDist + 0.5) : 0;

      this.velocities[i3] += (dx * 1.5 + mx * mouseForce) * dt;
      this.velocities[i3 + 1] += (dy * 1.5 + my * mouseForce) * dt;
      this.velocities[i3 + 2] += dz * 1.5 * dt;

      // Damping
      this.velocities[i3] *= 0.92;
      this.velocities[i3 + 1] *= 0.92;
      this.velocities[i3 + 2] *= 0.92;

      this.positions[i3] += this.velocities[i3] * dt;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this.points) {
      this.points.geometry.dispose();
      this.points.material.dispose();
    }
    if (this.backBtn) this.backBtn.dispose();
    if (this.label) this.label.dispose();
    super.dispose();
  }
}
