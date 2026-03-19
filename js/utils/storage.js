(function(global) {
  'use strict';

  const KEYS = {
    HISTORY: 'humanity_history',
    PROFILE: 'humanity_profile',
    CURRENT_TEST: 'humanity_current_test',
    SETTINGS: 'humanity_settings',
    FAVORITES: 'humanity_favorites'
  };

  const Storage = {
    get(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (e) {
        console.warn(`Storage.get: Failed to parse ${key}`, e);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error(`Storage.set: Failed to save ${key}`, e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error(`Storage.remove: Failed to remove ${key}`, e);
        return false;
      }
    },

    clear() {
      try {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        return true;
      } catch (e) {
        console.error('Storage.clear: Failed', e);
        return false;
      }
    },

    getHistory() {
      return this.get(KEYS.HISTORY, []);
    },

    saveHistory(testType, result, answers = []) {
      try {
        const history = this.getHistory();
        history.unshift({
          testType,
          result,
          answers,
          timestamp: new Date().toISOString(),
          id: Date.now()
        });
        this.set(KEYS.HISTORY, history.slice(0, 100));
      } catch (e) {
        console.error('Storage.saveHistory: Failed', e);
      }
    },

    getHistoryItem(id) {
      const history = this.getHistory();
      return history.find(item => item.id === id);
    },

    deleteHistoryItem(id) {
      try {
        const history = this.getHistory().filter(item => item.id !== id);
        this.set(KEYS.HISTORY, history);
        return true;
      } catch (e) {
        console.error('Storage.deleteHistoryItem: Failed', e);
        return false;
      }
    },

    clearHistory() {
      return this.set(KEYS.HISTORY, []);
    },

    getProfile() {
      return this.get(KEYS.PROFILE, {
        name: '',
        avatar: '',
        createdAt: null
      });
    },

    saveProfile(profile) {
      return this.set(KEYS.PROFILE, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
    },

    updateProfile(updates) {
      const profile = this.getProfile();
      return this.saveProfile({ ...profile, ...updates });
    },

    getCurrentTest() {
      return this.get(KEYS.CURRENT_TEST, null);
    },

    saveCurrentTest(testData) {
      return this.set(KEYS.CURRENT_TEST, {
        ...testData,
        savedAt: new Date().toISOString()
      });
    },

    clearCurrentTest() {
      return this.remove(KEYS.CURRENT_TEST);
    },

    getSettings() {
      return this.get(KEYS.SETTINGS, {
        theme: 'dark',
        animations: true,
        soundEffects: false,
        notifications: true,
        language: 'zh-CN'
      });
    },

    saveSettings(settings) {
      return this.set(KEYS.SETTINGS, {
        ...this.getSettings(),
        ...settings
      });
    },

    updateSetting(key, value) {
      const settings = this.getSettings();
      settings[key] = value;
      return this.set(KEYS.SETTINGS, settings);
    },

    getFavorites() {
      return this.get(KEYS.FAVORITES, []);
    },

    addFavorite(testType) {
      try {
        const favorites = new Set(this.getFavorites());
        favorites.add(testType);
        this.set(KEYS.FAVORITES, Array.from(favorites));
        return true;
      } catch (e) {
        console.error('Storage.addFavorite: Failed', e);
        return false;
      }
    },

    removeFavorite(testType) {
      try {
        const favorites = new Set(this.getFavorites());
        favorites.delete(testType);
        this.set(KEYS.FAVORITES, Array.from(favorites));
        return true;
      } catch (e) {
        console.error('Storage.removeFavorite: Failed', e);
        return false;
      }
    },

    isFavorite(testType) {
      return this.getFavorites().includes(testType);
    },

    toggleFavorite(testType) {
      if (this.isFavorite(testType)) {
        this.removeFavorite(testType);
        return false;
      } else {
        this.addFavorite(testType);
        return true;
      }
    },

    getStats() {
      try {
        const history = this.getHistory();
        const favorites = this.getFavorites();
        const uniqueTypes = [...new Set(history.map(h => h.testType))];
        return {
          totalTests: history.length,
          uniqueTypes: uniqueTypes.length,
          favoritesCount: favorites.length,
          historyByType: uniqueTypes.reduce((acc, type) => {
            acc[type] = history.filter(h => h.testType === type).length;
            return acc;
          }, {})
        };
      } catch (e) {
        console.error('Storage.getStats: Failed', e);
        return {
          totalTests: 0,
          uniqueTypes: 0,
          favoritesCount: 0,
          historyByType: {}
        };
      }
    },

    exportData() {
      try {
        return {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          data: {
            history: this.getHistory(),
            profile: this.getProfile(),
            settings: this.getSettings(),
            favorites: this.getFavorites()
          }
        };
      } catch (e) {
        console.error('Storage.exportData: Failed', e);
        return null;
      }
    },

    importData(data) {
      try {
        if (!data || !data.data) throw new Error('Invalid data format');
        const { history, profile, settings, favorites } = data.data;
        if (history) this.set(KEYS.HISTORY, history);
        if (profile) this.set(KEYS.PROFILE, profile);
        if (settings) this.set(KEYS.SETTINGS, settings);
        if (favorites) this.set(KEYS.FAVORITES, favorites);
        return true;
      } catch (e) {
        console.error('Storage.importData: Failed', e);
        return false;
      }
    },

    getStorageSize() {
      try {
        let total = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
          }
        }
        return {
          bytes: total,
          kb: (total / 1024).toFixed(2),
          mb: (total / 1024 / 1024).toFixed(4)
        };
      } catch (e) {
        console.error('Storage.getStorageSize: Failed', e);
        return { bytes: 0, kb: '0', mb: '0' };
      }
    }
  };

  global.Storage = Storage;

})(window);
