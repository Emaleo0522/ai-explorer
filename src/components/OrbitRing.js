import * as THREE from 'three';

export default class OrbitRing {
  constructor(radius, color = 0x00f0ff) {
    this.radius = radius;
    this.color = color;
    this.mesh = null;
  }

  create() {
    const segments = 128;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * this.radius,
        0,
        Math.sin(angle) * this.radius
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Line(geometry, material);
    return this.mesh;
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
