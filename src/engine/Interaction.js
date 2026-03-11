import * as THREE from 'three';
import engine from './Engine.js';

class Interaction {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.onHoverCallbacks = [];
    this.onClickCallbacks = [];
    this.enabled = false;
    this._onMouseMove = null;
    this._onClick = null;
    this._onTouchStart = null;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;

    this._onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.checkHover();
    };

    this._onClick = (e) => {
      // Update mouse for click position
      if (e.touches) {
        this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
      this.checkClick();
    };

    this._onTouchStart = (e) => {
      if (e.touches.length === 1) {
        this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        this.checkHover();
      }
    };

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('click', this._onClick);
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
  }

  disable() {
    this.enabled = false;
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onClick) window.removeEventListener('click', this._onClick);
    if (this._onTouchStart) window.removeEventListener('touchstart', this._onTouchStart);
    this.hoveredObject = null;
    document.body.style.cursor = 'default';
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, engine.camera);
    const intersects = this.raycaster.intersectObjects(engine.scene.children, true);

    let planet = null;
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.type === 'planet') {
        planet = hit.object;
        break;
      }
    }

    if (planet !== this.hoveredObject) {
      // Unhover previous
      if (this.hoveredObject) {
        for (const cb of this.onHoverCallbacks) {
          cb(null, this.hoveredObject);
        }
      }
      this.hoveredObject = planet;
      // Hover new
      if (planet) {
        document.body.style.cursor = 'pointer';
        for (const cb of this.onHoverCallbacks) {
          cb(planet, null);
        }
      } else {
        document.body.style.cursor = 'default';
      }
    }
  }

  checkClick() {
    this.raycaster.setFromCamera(this.mouse, engine.camera);
    const intersects = this.raycaster.intersectObjects(engine.scene.children, true);

    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.type === 'planet') {
        for (const cb of this.onClickCallbacks) {
          cb(hit.object);
        }
        break;
      }
    }
  }

  onHover(callback) {
    this.onHoverCallbacks.push(callback);
    return () => {
      const idx = this.onHoverCallbacks.indexOf(callback);
      if (idx > -1) this.onHoverCallbacks.splice(idx, 1);
    };
  }

  onClick(callback) {
    this.onClickCallbacks.push(callback);
    return () => {
      const idx = this.onClickCallbacks.indexOf(callback);
      if (idx > -1) this.onClickCallbacks.splice(idx, 1);
    };
  }

  dispose() {
    this.disable();
    this.onHoverCallbacks = [];
    this.onClickCallbacks = [];
  }
}

const interaction = new Interaction();
export default interaction;
