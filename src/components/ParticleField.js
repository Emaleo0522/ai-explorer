import * as THREE from 'three';

export default class ParticleField {
  constructor(options = {}) {
    this.count = options.count || 5000;
    this.radius = options.radius || 50;
    this.colors = options.colors || [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xff00e5),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x00ff88),
    ];
    this.spiralArms = options.spiralArms || 3;
    this.spiralTightness = options.spiralTightness || 0.5;
    this.mesh = null;
  }

  create() {
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const randoms = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Spiral galaxy distribution
      const arm = Math.floor(Math.random() * this.spiralArms);
      const armAngle = (arm / this.spiralArms) * Math.PI * 2;
      const distance = Math.pow(Math.random(), 0.5) * this.radius;
      const angle = armAngle + distance * this.spiralTightness + (Math.random() - 0.5) * 0.5;

      // Spread factor increases with distance
      const spread = distance * 0.15;

      positions[i3] = Math.cos(angle) * distance + (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      positions[i3 + 2] = Math.sin(angle) * distance + (Math.random() - 0.5) * spread;

      // Color based on distance from center
      const colorIdx = Math.floor(Math.random() * this.colors.length);
      const color = this.colors[colorIdx];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size variation
      sizes[i] = Math.random() * 2.0 + 0.5;

      // Random value for shader animation
      randoms[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        attribute float aRandom;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;

          // Gentle floating motion
          pos.y += sin(uTime * 0.3 + aRandom * 6.28) * 0.3;
          pos.x += cos(uTime * 0.2 + aRandom * 6.28) * 0.2;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Size attenuation
          gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);

          // Fade based on distance
          float dist = length(position.xz);
          vAlpha = smoothstep(${this.radius.toFixed(1)}, ${(this.radius * 0.3).toFixed(1)}, dist) * (0.5 + 0.5 * sin(uTime + aRandom * 6.28));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Circular point with soft edge
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(geometry, material);
    return this.mesh;
  }

  update(elapsed) {
    if (this.mesh) {
      this.mesh.material.uniforms.uTime.value = elapsed;
      this.mesh.rotation.y = elapsed * 0.02;
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
