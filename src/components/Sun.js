import * as THREE from 'three';

export default class Sun {
  constructor(radius = 2.5) {
    this.radius = radius;
    this.group = new THREE.Group();
    this.coreMesh = null;
    this.glowMesh = null;
    this.pointLight = null;
  }

  create() {
    // Core sphere
    const coreGeometry = new THREE.SphereGeometry(this.radius, 48, 48);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    this.group.add(this.coreMesh);

    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(this.radius * 2.0, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-worldPos.xyz);
          gl_Position = projectionMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform float uTime;
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vViewDir), 2.0);
          vec3 warmColor = mix(vec3(1.0, 0.8, 0.3), vec3(1.0, 0.5, 0.1), fresnel);
          float pulse = 0.7 + 0.3 * sin(uTime * 1.5);
          gl_FragColor = vec4(warmColor, fresnel * 0.6 * pulse);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(this.glowMesh);

    // Point light from sun
    this.pointLight = new THREE.PointLight(0xffeedd, 3, 100);
    this.group.add(this.pointLight);

    return this.group;
  }

  update(elapsed) {
    if (this.glowMesh) {
      this.glowMesh.material.uniforms.uTime.value = elapsed;
    }
    if (this.coreMesh) {
      this.coreMesh.rotation.y = elapsed * 0.1;
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
