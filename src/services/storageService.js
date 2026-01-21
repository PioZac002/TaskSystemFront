/**
 * Storage Service - zarządza przechowywaniem tokenów
 * - sessionStorage (domyślnie) - ginie po zamknięciu karty/przeglądarki
 * - localStorage (z "Remember Me") - persistent
 */

class StorageService {
    constructor() {
        // Sprawdź czy mamy persistent session przy starcie
        this.useLocalStorage = this.isPersistentSession();
        console.log(`🔐 [Storage] Initialized - using ${this.useLocalStorage ? 'localStorage' : 'sessionStorage'}`);
    }

    setStorageType(rememberMe) {
        this.useLocalStorage = rememberMe;
        console.log(`🔐 [Storage] Switched to ${rememberMe ? 'localStorage (persistent)' : 'sessionStorage (session only)'}`);
    }

    getStorage() {
        return this.useLocalStorage ? localStorage : sessionStorage;
    }

    setItem(key, value) {
        const storage = this.getStorage();
        storage.setItem(key, value);

        console.log(`💾 [Storage] Saved ${key} to ${this.useLocalStorage ? 'localStorage' : 'sessionStorage'}`);

        // Jeśli używamy sessionStorage, usuń z localStorage (cleanup)
        if (!this.useLocalStorage && localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🧹 [Storage] Cleaned ${key} from localStorage`);
        }
    }

    getItem(key) {
        // Sprawdź oba storage - sessionStorage ma priorytet
        const sessionValue = sessionStorage.getItem(key);
        const localValue = localStorage.getItem(key);

        const value = sessionValue || localValue;

        if (value) {
            const source = sessionValue ?  'sessionStorage' : 'localStorage';
            console.log(`📦 [Storage] Retrieved ${key} from ${source}`);
        }

        return value;
    }

    removeItem(key) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        console.log(`🗑️ [Storage] Removed ${key} from both storages`);
    }

    clear() {
        const keysToRemove = ['accessToken', 'refreshToken', 'userId', 'user'];

        console.log('🧹 [Storage] Clearing all auth data.. .');

        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        });

        this.useLocalStorage = false;
    }

    // Sprawdź czy sesja pochodzi z "Remember Me"
    isPersistentSession() {
        return ! !(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));
    }
}

export const storageService = new StorageService();