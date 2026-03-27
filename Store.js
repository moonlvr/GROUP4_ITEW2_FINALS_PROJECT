// Handles all saving and loading of data in localStorage
class Store {
  // Gets an array of data using the given key
  static get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch { return []; }
  }

  // Saves an array of data using the given key
  static set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Gets a single value (not an array) using the given key
  static getObj(key, def) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v !== null ? v : def;
    } catch { return def; }
  }

  // Saves a single value using the given key
  static setObj(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Deletes all stored data
  static clear() {
    localStorage.clear();
  }
}