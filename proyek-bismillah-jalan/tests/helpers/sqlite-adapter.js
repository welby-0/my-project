// Adapter yang meniru API expo-sqlite (async) di atas node:sqlite, hanya untuk pengujian di Node.
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

function createAdapter() {
  const db = new DatabaseSync(':memory:');
  const bind = (params) => {
    const list = Array.isArray(params[0]) ? params[0] : params;
    return list.map((v) => {
      if (v === undefined) throw new Error('Parameter SQL undefined (harus null)');
      return v;
    });
  };
  return {
    async execAsync(sql) {
      db.exec(sql);
    },
    async runAsync(sql, ...params) {
      const r = db.prepare(sql).run(...bind(params));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync(sql, ...params) {
      return db.prepare(sql).all(...bind(params)).map((row) => ({ ...row }));
    },
    async getFirstAsync(sql, ...params) {
      const row = db.prepare(sql).get(...bind(params));
      return row ? { ...row } : null;
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

module.exports = { createAdapter };
