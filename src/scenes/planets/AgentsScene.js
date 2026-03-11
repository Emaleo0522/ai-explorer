import * as THREE from 'three';
import BaseScene from '../BaseScene.js';
import BackButton from '../../components/ui/BackButton.js';
import SceneLabel from '../../components/ui/SceneLabel.js';

export default class AgentsScene extends BaseScene {
  constructor() {
    super('agents');
    this.agents = [];
    this.leaders = [];
    this.trails = [];
    this.backBtn = null;
    this.label = null;
    this.bounds = 15;
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x030712);
    engine.setBloom(0.8, 0.4, 0.75);

    // Top-down view
    engine.camera.position.set(0, 25, 10);
    engine.camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0x112211, 0.6);
    engine.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x00ff88, 0.8);
    dirLight.position.set(5, 10, 5);
    engine.scene.add(dirLight);

    // Grid floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ff88, 0x003311);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    engine.scene.add(gridHelper);

    // Create agents
    this.createAgents(engine, 60);

    // UI
    this.backBtn = new BackButton();
    this.backBtn.create();
    this.label = new SceneLabel();
    this.label.create('AUTONOMOUS AGENTS', 'Flocking behavior simulation');
  }

  createAgents(engine, count) {
    const leaderCount = 3;

    for (let i = 0; i < count; i++) {
      const isLeader = i < leaderCount;
      const radius = isLeader ? 0.3 : 0.15;
      const color = isLeader ? 0xffffff : 0x00ff88;

      const geometry = new THREE.SphereGeometry(radius, 12, 12);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isLeader ? 0.6 : 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);

      const agent = {
        mesh,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * this.bounds,
          0.3,
          (Math.random() - 0.5) * this.bounds
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ),
        isLeader,
        maxSpeed: isLeader ? 3 : 4,
        trail: [],
      };

      mesh.position.copy(agent.position);
      engine.scene.add(mesh);

      // Trail
      const trailGeometry = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(30 * 3); // 30 trail points
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const trailLine = new THREE.Line(trailGeometry, trailMaterial);
      engine.scene.add(trailLine);
      agent.trailLine = trailLine;

      if (isLeader) {
        this.leaders.push(agent);
      }
      this.agents.push(agent);
    }
  }

  update(delta, elapsed) {
    const dt = Math.min(delta, 0.05); // cap delta

    for (const agent of this.agents) {
      const steer = new THREE.Vector3();

      if (agent.isLeader) {
        // Leaders wander
        agent.velocity.x += (Math.random() - 0.5) * 2 * dt;
        agent.velocity.z += (Math.random() - 0.5) * 2 * dt;
      } else {
        // Flocking: separation, alignment, cohesion
        let sepCount = 0, aliCount = 0, cohCount = 0;
        const separation = new THREE.Vector3();
        const alignment = new THREE.Vector3();
        const cohesion = new THREE.Vector3();

        for (const other of this.agents) {
          if (other === agent) continue;
          const dist = agent.position.distanceTo(other.position);

          // Separation (avoid crowding)
          if (dist < 1.5) {
            const diff = agent.position.clone().sub(other.position).normalize().divideScalar(dist);
            separation.add(diff);
            sepCount++;
          }
          // Alignment + Cohesion
          if (dist < 4) {
            alignment.add(other.velocity);
            cohesion.add(other.position);
            aliCount++;
            cohCount++;
          }
        }

        if (sepCount > 0) separation.divideScalar(sepCount).multiplyScalar(2.0);
        if (aliCount > 0) alignment.divideScalar(aliCount).normalize().multiplyScalar(1.0);
        if (cohCount > 0) {
          cohesion.divideScalar(cohCount).sub(agent.position).normalize().multiplyScalar(0.8);
        }

        // Leader attraction
        const leaderAttract = new THREE.Vector3();
        for (const leader of this.leaders) {
          const dist = agent.position.distanceTo(leader.position);
          if (dist < 10) {
            leaderAttract.add(leader.position.clone().sub(agent.position).normalize().multiplyScalar(1.5 / dist));
          }
        }

        steer.add(separation).add(alignment).add(cohesion).add(leaderAttract);
      }

      // Apply steering
      agent.velocity.add(steer.multiplyScalar(dt));

      // Limit speed
      if (agent.velocity.length() > agent.maxSpeed) {
        agent.velocity.normalize().multiplyScalar(agent.maxSpeed);
      }

      // Update position
      agent.position.add(agent.velocity.clone().multiplyScalar(dt));

      // Bounds wrapping
      if (agent.position.x > this.bounds / 2) agent.position.x = -this.bounds / 2;
      if (agent.position.x < -this.bounds / 2) agent.position.x = this.bounds / 2;
      if (agent.position.z > this.bounds / 2) agent.position.z = -this.bounds / 2;
      if (agent.position.z < -this.bounds / 2) agent.position.z = this.bounds / 2;
      agent.position.y = 0.3;

      agent.mesh.position.copy(agent.position);

      // Update trail
      agent.trail.push(agent.position.clone());
      if (agent.trail.length > 30) agent.trail.shift();

      const positions = agent.trailLine.geometry.attributes.position.array;
      for (let i = 0; i < 30; i++) {
        const idx = i * 3;
        if (i < agent.trail.length) {
          positions[idx] = agent.trail[i].x;
          positions[idx + 1] = agent.trail[i].y;
          positions[idx + 2] = agent.trail[i].z;
        }
      }
      agent.trailLine.geometry.attributes.position.needsUpdate = true;
      agent.trailLine.geometry.setDrawRange(0, agent.trail.length);
    }
  }

  dispose() {
    for (const agent of this.agents) {
      agent.mesh.geometry.dispose();
      agent.mesh.material.dispose();
      agent.trailLine.geometry.dispose();
      agent.trailLine.material.dispose();
    }
    if (this.backBtn) this.backBtn.dispose();
    if (this.label) this.label.dispose();
    super.dispose();
  }
}
