/**
 * Sistema de caché local para optimizar rendimiento en tablets
 * Reduce peticiones al servidor guardando datos temporalmente
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Guarda datos en caché con tiempo de expiración
   * @param {string} key - Identificador único
   * @param {any} data - Datos a guardar
   * @param {number} ttl - Tiempo de vida en milisegundos (default: 5 minutos)
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, data);
    this.timestamps.set(key, {
      created: Date.now(),
      ttl
    });
  }

  /**
   * Obtiene datos del caché si no han expirado
   * @param {string} key - Identificador único
   * @returns {any|null} Datos o null si expiró
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    // Verificar si expiró
    if (now - timestamp.created > timestamp.ttl) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Elimina una entrada del caché
   * @param {string} key - Identificador único
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Limpia todo el caché
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Limpia entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp.created > timestamp.ttl) {
        this.delete(key);
      }
    }
  }

  /**
   * Verifica si una key existe y es válida
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Elimina todas las entradas cuya key empiece con el prefijo dado
   * @param {string} prefix
   */
  deleteByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }
}

// Instancia singleton
const cacheManager = new CacheManager();

// Limpiar caché expirado cada 5 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

export default cacheManager;
