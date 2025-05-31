
import { AircraftRecord } from '../types';

const DB_NAME = 'AircraftProductDB';
const DB_VERSION = 1;
const STORE_NAME = 'records';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBRequest).error);
      reject('Database error');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = (event.target as IDBRequest).result as IDBDatabase;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addRecord = async (record: AircraftRecord): Promise<void> => {
  const currentDb = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error adding record:', (event.target as IDBRequest).error);
      reject('Error adding record');
    };
  });
};

export const getAllRecords = async (): Promise<AircraftRecord[]> => {
  const currentDb = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by createdAt descending (newest first)
      const sortedRecords = (request.result as AircraftRecord[]).sort((a, b) => b.createdAt - a.createdAt);
      resolve(sortedRecords);
    };
    request.onerror = (event) => {
      console.error('Error fetching records:', (event.target as IDBRequest).error);
      reject('Error fetching records');
    };
  });
};

export const getRecordById = async (id: string): Promise<AircraftRecord | undefined> => {
  const currentDb = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as AircraftRecord | undefined);
    request.onerror = (event) => {
      console.error('Error fetching record by ID:', (event.target as IDBRequest).error);
      reject('Error fetching record by ID');
    };
  });
};

export const updateRecord = async (record: AircraftRecord): Promise<void> => {
  const currentDb = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error updating record:', (event.target as IDBRequest).error);
      reject('Error updating record');
    };
  });
};

export const deleteRecord = async (id: string): Promise<void> => {
  const currentDb = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error deleting record:', (event.target as IDBRequest).error);
      reject('Error deleting record');
    };
  });
};