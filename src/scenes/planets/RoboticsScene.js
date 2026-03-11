import * as THREE from 'three';
import BaseScene from '../BaseScene.js';
import BackButton from '../../components/ui/BackButton.js';
import SceneLabel from '../../components/ui/SceneLabel.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class RoboticsScene extends BaseScene {
  constructor() {
    super('robotics');
    this.arm = null;
    this.joints = [];
    this.segments = [];
    this.backBtn = null;
    this.label = null;
    this.controls = null;
    this.base = null;
  }

  async init(engine) {
    await super.init(engine);

    engine.scene.background = new THREE.Color(0x0f1218);
    engine.setBloom(0.5, 0.3, 0.85);

    engine.camera.position.set(6, 5, 8);
    engine.camera.lookAt(0, 2, 0);

    // Controls
    this.controls = new OrbitControls(engine.camera, engine.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 2, 0);
    this.controls.maxDistance = 20;

    // Lighting — brighter so the arm is clearly visible
    const ambient = new THREE.AmbientLight(0x667788, 1.5);
    engine.scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xff8a00, 2.5);
    keyLight.position.set(5, 8, 3);
    keyLight.castShadow = true;
    engine.scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff6600, 1.5, 20);
    fillLight.position.set(-3, 4, -2);
    engine.scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x00f0ff, 1.2, 25);
    rimLight.position.set(0, 1, -5);
    engine.scene.add(rimLight);
    const topLight = new THREE.PointLight(0xffffff, 0.8, 20);
    topLight.position.set(0, 8, 0);
    engine.scene.add(topLight);

    // Grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0xff8a00, 0x331a00);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    engine.scene.add(gridHelper);

    // Build robotic arm
    this.buildArm(engine);

    // UI
    this.backBtn = new BackButton();
    this.backBtn.create();
    this.label = new SceneLabel();
    this.label.create('ROBOTICS', 'Articulated robotic arm — pick and place cycle');
  }

  buildArm(engine) {
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8a00,
      emissive: 0xff8a00,
      emissiveIntensity: 0.2,
      metalness: 0.7,
      roughness: 0.3,
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3,
    });

    this.arm = new THREE.Group();

    // Base platform
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.4, 32);
    this.base = new THREE.Mesh(baseGeo, accentMaterial);
    this.base.position.y = 0.2;
    this.arm.add(this.base);

    // Joint 0 (base rotation)
    const joint0 = new THREE.Group();
    joint0.position.y = 0.4;
    this.base.add(joint0);
    this.joints.push(joint0);

    // Segment 1 (lower arm)
    const seg1Geo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 16);
    const seg1 = new THREE.Mesh(seg1Geo, metalMaterial);
    seg1.position.y = 1.25;
    joint0.add(seg1);
    this.segments.push(seg1);

    // Joint 1 sphere
    const j1Geo = new THREE.SphereGeometry(0.35, 16, 16);
    const j1 = new THREE.Mesh(j1Geo, jointMaterial);
    j1.position.y = 2.5;
    joint0.add(j1);

    // Joint 1 (elbow)
    const joint1 = new THREE.Group();
    joint1.position.y = 2.5;
    joint0.add(joint1);
    this.joints.push(joint1);

    // Segment 2 (upper arm)
    const seg2Geo = new THREE.CylinderGeometry(0.15, 0.2, 2.0, 16);
    const seg2 = new THREE.Mesh(seg2Geo, metalMaterial);
    seg2.position.y = 1.0;
    joint1.add(seg2);
    this.segments.push(seg2);

    // Joint 2 sphere
    const j2Geo = new THREE.SphereGeometry(0.28, 16, 16);
    const j2 = new THREE.Mesh(j2Geo, jointMaterial);
    j2.position.y = 2.0;
    joint1.add(j2);

    // Joint 2 (wrist)
    const joint2 = new THREE.Group();
    joint2.position.y = 2.0;
    joint1.add(joint2);
    this.joints.push(joint2);

    // Pincer/gripper
    const fingerGeo = new THREE.BoxGeometry(0.06, 0.6, 0.15);
    const fingerL = new THREE.Mesh(fingerGeo, accentMaterial);
    fingerL.position.set(-0.15, 0.3, 0);
    joint2.add(fingerL);
    const fingerR = new THREE.Mesh(fingerGeo, accentMaterial);
    fingerR.position.set(0.15, 0.3, 0);
    joint2.add(fingerR);

    this.fingers = { left: fingerL, right: fingerR };

    engine.scene.add(this.arm);
  }

  update(delta, elapsed) {
    if (this.controls) this.controls.update();
    if (!this.joints.length) return;

    // Cyclic pick-and-place animation
    const cycle = elapsed * 0.4; // slow cycle
    const phase = cycle % 4; // 4-phase cycle

    // Base rotation
    this.joints[0].rotation.y = Math.sin(cycle * 0.5) * 1.2;

    // Elbow
    this.joints[1].rotation.z = -0.3 + Math.sin(phase * Math.PI * 0.5) * 0.6;

    // Wrist
    this.joints[2].rotation.z = 0.2 + Math.cos(phase * Math.PI * 0.5) * 0.4;

    // Gripper open/close
    if (this.fingers) {
      const grip = phase < 2 ? 0.15 : 0.05; // open when moving, close when gripping
      this.fingers.left.position.x = -grip;
      this.fingers.right.position.x = grip;
    }
  }

  dispose() {
    if (this.controls) this.controls.dispose();
    this.arm.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    if (this.backBtn) this.backBtn.dispose();
    if (this.label) this.label.dispose();
    super.dispose();
  }
}
