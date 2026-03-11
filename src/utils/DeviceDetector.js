class DeviceDetector {
  constructor() {
    this.isMobile = false;
    this.isTablet = false;
    this.isLowEnd = false;
    this.pixelRatio = 1;
    this.detect();
  }

  detect() {
    const ua = navigator.userAgent.toLowerCase();
    this.isMobile = /mobile|android|iphone|ipod/.test(ua);
    this.isTablet = /tablet|ipad/.test(ua) || (this.isMobile && window.innerWidth > 600);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Check for low-end device
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        this.isLowEnd = /mali-4|adreno 3|powervr sgx|intel hd 4/.test(renderer);
      }
    }

    // Also consider low-end if low memory
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      this.isLowEnd = true;
    }
  }

  getQuality() {
    if (this.isLowEnd) return 'low';
    if (this.isMobile) return 'medium';
    return 'high';
  }

  getParticleMultiplier() {
    const quality = this.getQuality();
    if (quality === 'low') return 0.3;
    if (quality === 'medium') return 0.6;
    return 1.0;
  }

  shouldEnableBloom() {
    return this.getQuality() !== 'low';
  }

  getMaxPixelRatio() {
    const quality = this.getQuality();
    if (quality === 'low') return 1;
    if (quality === 'medium') return 1.5;
    return 2;
  }
}

const deviceDetector = new DeviceDetector();
export default deviceDetector;
