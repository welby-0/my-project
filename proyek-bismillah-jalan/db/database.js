import * as SQLite from 'expo-sqlite';
import { DB_NAME, SCHEMA_SQL, SCHEMA_VERSION } from './schema';
import { seedDatabase } from './seed';

let dbPromise = null;

async function openAndPrepare() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync('PRAGMA user_version');
  if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
    await db.execAsync(SCHEMA_SQL);
    await seedDatabase(db);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
  return db;
}

// Satu koneksi bersama; dibuat dan di-seed saat pertama kali dipanggil
export function getDb() {
  if (!dbPromise) {
    dbPromise = openAndPrepare().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

// Menghapus semua data lalu mengisi ulang data contoh
export async function resetDatabase() {
  const db = await getDb();
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  const objects = await db.getAllAsync(
    "SELECT type, name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND type IN ('view', 'trigger', 'table') ORDER BY CASE type WHEN 'view' THEN 0 WHEN 'trigger' THEN 1 ELSE 2 END"
  );
  for (const o of objects) {
    await db.execAsync(`DROP ${o.type.toUpperCase()} IF EXISTS "${o.name}";`);
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(SCHEMA_SQL);
  await seedDatabase(db);
}
