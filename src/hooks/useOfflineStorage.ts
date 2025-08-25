import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  type: 'client' | 'payment' | 'visit';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorage {
  private dbName = 'crediario-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  async saveData(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init();
    
    const offlineData: OfflineData = {
      id: `${data.type}_${Date.now()}_${Math.random()}`,
      ...data,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const request = store.add(offlineData);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readonly');
      const store = transaction.objectStore('offline_data');
      const index = store.index('synced');
      const request = index.getAll(false);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

const offlineStorage = new OfflineStorage();

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize and check for pending data
    offlineStorage.init().then(() => {
      checkPendingData();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = async (type: OfflineData['type'], data: any) => {
    try {
      await offlineStorage.saveData({ type, data });
      await checkPendingData();
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;
    
    try {
      const unsyncedData = await offlineStorage.getUnsyncedData();
      
      for (const item of unsyncedData) {
        // Here you would implement the actual sync logic
        // For now, we'll just mark as synced
        await offlineStorage.markAsSynced(item.id);
      }
      
      await offlineStorage.clearSyncedData();
      await checkPendingData();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const checkPendingData = async () => {
    try {
      const unsyncedData = await offlineStorage.getUnsyncedData();
      setPendingSync(unsyncedData.length);
    } catch (error) {
      console.error('Error checking pending data:', error);
    }
  };

  return {
    isOnline,
    pendingSync,
    saveOfflineData,
    syncOfflineData
  };
};