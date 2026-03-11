import * as THREE from 'three';

export default class Planet {
  constructor(config) {
    this.name = config.name;
    this.label = config.label;
    this.color = new THREE.Color(config.color);
    this.radius = config.radius || 1;
    this.orbitRadius = config.orbitRadius || 10;
    this.orbitSpeed = config.orbitSpeed || 0.5;
    this.orbitOffset = config.orbitOffset || 0;
    this.description = config.description || '';
    this.sceneName = config.sceneName || '';

    this.group = new THREE.Group();
    this.sphere = null;
    this.glowMesh = null;
    this.angle = this.orbitOffset;
    this.isHovered = false;
    this.baseScale = 1;
  }

  create() {
    // Planet sphere
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.6,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.userData = {
      type: 'planet',
      name: this.name,
      sceneName: this.sceneName,
      label: this.label,
      description: this.description,
    };
    this.group.add(this.sphere);

    // Atmospheric glow (fresnel)
    const glowGeometry = new THREE.SphereGeometry(this.radius * 1.3, 32, 32);
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
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);
          gl_FragColor = vec4(uColor, fresnel * uIntensity);
        }
      `,
      uniforms: {
        uColor: { value: this.color },
        uIntensity: { value: 0.6 },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(this.glowMesh);

    // Set initial position on orbit
    this.updateOrbitPosition(0);

    return this.group;
  }

  updateOrbitPosition(elapsed) {
    this.angle = this.orbitOffset + elapsed * this.orbitSpeed;
    this.group.position.x = Math.cos(this.angle) * this.orbitRadius;
    this.group.position.z = Math.sin(this.angle) * this.orbitRadius;
    // Slight Y variation
    this.group.position.y = Math.sin(this.angle * 2) * 0.5;
  }

  setHovered(hovered) {
    if (this.isHovered === hovered) return;
    this.isHovered = hovered;
    const targetScale = hovered ? 1.3 : 1.0;
    const targetIntensity = hovered ? 1.0 : 0.6;
    const targetEmissive = hovered ? 0.6 : 0.3;

    // Simple lerp in update, or direct set
    this.group.scale.setScalar(targetScale);
    if (this.glowMesh) {
      this.glowMesh.material.uniforms.uIntensity.value = targetIntensity;
    }
    if (this.sphere) {
      this.sphere.material.emissiveIntensity = targetEmissive;
    }
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.group.getWorldPosition(pos);
    return pos;
  }

  update(elapsed) {
    this.updateOrbitPosition(elapsed);
    // Gentle self-rotation
    if (this.sphere) {
      this.sphere.rotation.y = elapsed * 0.5;
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.uniforms) {
          // Shader material
        }
        child.material.dispose();
      }
    });
  }
}
