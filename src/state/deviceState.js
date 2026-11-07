// src/state/deviceState.js
const mediaQuery = window.matchMedia("(max-width: 850px)");

class DeviceManager {
  constructor() {
    this.isMobile = mediaQuery.matches;
    this.listeners = new Set();

    // Solo se dispara cuando cruza el umbral de 850px
    mediaQuery.addEventListener("change", (e) => {
      this.isMobile = e.matches;
      this.listeners.forEach((cb) => cb(this.isMobile));
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const device = new DeviceManager();
