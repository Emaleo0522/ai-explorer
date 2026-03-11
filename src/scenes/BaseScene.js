/**
 * BaseScene — Abstract base class for all scenes.
 * Every scene must implement init(engine) and dispose().
 * update(delta, elapsed) is registered via engine.onUpdate().
 */
export default class BaseScene {
  constructor(name) {
    this.name = name;
    this.isInitialized = false;
    this._unsubscribeUpdate = null;
  }

  /**
   * Initialize the scene. Add objects to engine.scene,
   * set camera position, register update loop.
   * @param {Engine} engine
   */
  async init(engine) {
    this.engine = engine;
    this.isInitialized = true;

    // Register update loop
    this._unsubscribeUpdate = engine.onUpdate((delta, elapsed) => {
      this.update(delta, elapsed);
    });
  }

  /**
   * Called every frame. Override in subclass.
   * @param {number} delta - Time since last frame in seconds
   * @param {number} elapsed - Total elapsed time in seconds
   */
  update(delta, elapsed) {
    // Override in subclass
  }

  /**
   * Clean up scene resources. Remove objects, dispose geometries/materials.
   */
  dispose() {
    if (this._unsubscribeUpdate) {
      this._unsubscribeUpdate();
      this._unsubscribeUpdate = null;
    }
    this.isInitialized = false;
  }
}
