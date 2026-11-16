import { getDb } from './database';

// userId 0 = tamu (belum masuk)
export async function addSearchTerm(userId, term) {
  const clean = String(term || '').trim().replace(/\s+/g, ' ');
  if (clean.length < 2) return;
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO search_history (user_id, term) VALUES (?, ?)
     ON CONFLICT (user_id, term) DO UPDATE SET created_at = datetime('now')`,
    [userId || 0, clean.slice(0, 60)]
  );
  // simpan maksimal 20 pencarian terakhir
  await db.runAsync(
    `DELETE FROM search_history WHERE user_id = ? AND id NOT IN
       (SELECT id FROM search_history WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 20)`,
    [userId || 0, userId || 0]
  );
}

export async function listSearchTerms(userId, limit = 8) {
  const db = await getDb();
  return db.getAllAsync('SELECT id, term FROM search_history WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?', [userId || 0, limit]);
}

export async function removeSearchTerm(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM search_history WHERE id = ?', [id]);
}

export async function clearSearchTerms(userId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM search_history WHERE user_id = ?', [userId || 0]);
}
