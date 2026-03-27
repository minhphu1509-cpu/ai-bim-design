import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'BIM_AI_LOCAL_CACHE';
const DB_VERSION = 11; // As requested: IndexedDB v11

export interface LocalCache {
  projects: any[];
  chatHistory: any[];
  lastSync: number;
}

class LocalDbService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chat')) {
          db.createObjectStore('chat', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }

  async saveProjects(projects: any[]) {
    const db = await this.db;
    const tx = db.transaction('projects', 'readwrite');
    await Promise.all([
      ...projects.map(p => tx.store.put(p)),
      tx.done
    ]);
  }

  async getProjects() {
    const db = await this.db;
    return db.getAll('projects');
  }

  async saveChatMessage(message: any) {
    const db = await this.db;
    await db.put('chat', message);
  }

  async getChatHistory() {
    const db = await this.db;
    return db.getAll('chat');
  }

  async clearChat() {
    const db = await this.db;
    await db.clear('chat');
  }

  async setSetting(key: string, value: any) {
    const db = await this.db;
    await db.put('settings', value, key);
  }

  async getSetting(key: string) {
    const db = await this.db;
    return db.get('settings', key);
  }
}

export const localDb = new LocalDbService();
