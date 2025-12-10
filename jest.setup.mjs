// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Web APIs that Next.js requires but aren't available in Node.js test environment
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = init?.headers || new Headers();
    }
  };
}

if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor(init) {
      this.map = new Map();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    get(name) {
      return this.map.get(name.toLowerCase()) || null;
    }
    set(name, value) {
      this.map.set(name.toLowerCase(), String(value));
    }
    has(name) {
      return this.map.has(name.toLowerCase());
    }
    delete(name) {
      this.map.delete(name.toLowerCase());
    }
    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this));
    }
  };
}
