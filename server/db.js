const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data.db");

let db;

function initDB() {
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS bloggers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT DEFAULT '',
      biography TEXT DEFAULT '',
      profile_pic_url TEXT DEFAULT '',
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      media_count INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      last_updated DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shortcode TEXT UNIQUE NOT NULL,
      blogger_id INTEGER REFERENCES bloggers(id),
      caption TEXT DEFAULT '',
      media_url TEXT DEFAULT '',
      thumbnail_url TEXT DEFAULT '',
      media_type TEXT DEFAULT 'IMAGE',
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      taken_at DATETIME,
      is_video INTEGER DEFAULT 0,
      display_url TEXT DEFAULT '',
      last_updated DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_posts_blogger ON posts(blogger_id);
    CREATE INDEX IF NOT EXISTS idx_posts_taken ON posts(taken_at DESC);
  `);

  return db;
}

function getDB() {
  if (!db) {
    return initDB();
  }
  return db;
}

module.exports = { initDB, getDB };
