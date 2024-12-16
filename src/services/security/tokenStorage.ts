interface StorageOptions {
  prefix?: string;
  storage?: Storage;
}

class TokenStorageService {
  private prefix: string;
  private storage: Storage;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'app_';
    this.storage = options.storage || localStorage;
  }

  saveToken(key: string, token: string): void {
    const fullKey = this.getFullKey(key);
    this.storage.setItem(fullKey, token);
  }

  getToken(key: string): string | null {
    const fullKey = this.getFullKey(key);
    return this.storage.getItem(fullKey);
  }

  removeToken(key: string): void {
    const fullKey = this.getFullKey(key);
    this.storage.removeItem(fullKey);
  }

  clear(): void {
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

export const TokenStorage = new TokenStorageService();