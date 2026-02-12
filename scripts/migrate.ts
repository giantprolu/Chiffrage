import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("Creating tables...");

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Entry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      client TEXT NOT NULL,
      ticket TEXT,
      comment TEXT NOT NULL,
      time REAL NOT NULL,
      type TEXT,
      userId INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS FormationDay (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT 'FORMATION',
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES User(id),
      UNIQUE(date, userId)
    );

    CREATE TABLE IF NOT EXISTS CongeDay (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT 'CONGÉ',
      time REAL NOT NULL DEFAULT 1,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE INDEX IF NOT EXISTS idx_entry_userId ON Entry(userId);
    CREATE INDEX IF NOT EXISTS idx_entry_date ON Entry(date);
    CREATE INDEX IF NOT EXISTS idx_formation_userId ON FormationDay(userId);
    CREATE INDEX IF NOT EXISTS idx_formation_date ON FormationDay(date);
    CREATE INDEX IF NOT EXISTS idx_conge_userId ON CongeDay(userId);
    CREATE INDEX IF NOT EXISTS idx_conge_date ON CongeDay(date);
  `);

  console.log("Migration complete!");
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
