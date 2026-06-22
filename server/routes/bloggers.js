const express = require("express");
const { execSync } = require("child_process");
const path = require("path");
const { getDB } = require("../db");

const router = express.Router();

const PYTHON_PATH = "D:\\Python\\python.exe";
const SCRAPER_PATH = path.join(__dirname, "..", "scraper.py");

// GET /api/bloggers - 获取所有博主
router.get("/", (req, res) => {
  const db = getDB();
  const bloggers = db
    .prepare(
      `SELECT id, username, full_name, biography, profile_pic_url,
              followers_count, following_count, media_count, is_verified, last_updated
       FROM bloggers ORDER BY last_updated DESC`
    )
    .all();
  res.json({ bloggers });
});

// GET /api/bloggers/:username - 获取博主详情（含最近帖子）
router.get("/:username", (req, res) => {
  const db = getDB();
  const blogger = db
    .prepare(
      `SELECT * FROM bloggers WHERE username = ?`
    )
    .get(req.params.username);

  if (!blogger) {
    return res.status(404).json({ error: "Blogger not found" });
  }

  const posts = db
    .prepare(
      `SELECT shortcode, caption, media_url, thumbnail_url, display_url,
              media_type, likes_count, comments_count, taken_at, is_video
       FROM posts WHERE blogger_id = ?
       ORDER BY taken_at DESC LIMIT 50`
    )
    .all(blogger.id);

  res.json({ blogger, posts });
});

// POST /api/bloggers - 添加博主并抓取数据
router.post("/", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    console.log(`[scraper] Fetching data for @${username}...`);
    const output = execSync(
      `"${PYTHON_PATH}" "${SCRAPER_PATH}" "${username}"`,
      { encoding: "utf-8", timeout: 60000 }
    );

    const data = JSON.parse(output.trim());

    if (data.error) {
      return res.status(502).json({ error: data.error });
    }

    const db = getDB();

    // upsert blogger
    const stmt = db.prepare(`
      INSERT INTO bloggers (username, full_name, biography, profile_pic_url,
                            followers_count, following_count, media_count, is_verified, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(username) DO UPDATE SET
        full_name = excluded.full_name,
        biography = excluded.biography,
        profile_pic_url = excluded.profile_pic_url,
        followers_count = excluded.followers_count,
        following_count = excluded.following_count,
        media_count = excluded.media_count,
        is_verified = excluded.is_verified,
        last_updated = datetime('now')
    `);

    stmt.run(
      data.username, data.full_name, data.biography, data.profile_pic_url,
      data.followers_count, data.following_count, data.media_count,
      data.is_verified ? 1 : 0
    );

    const blogger = db.prepare("SELECT * FROM bloggers WHERE username = ?").get(data.username);

    // insert posts
    const postStmt = db.prepare(`
      INSERT OR IGNORE INTO posts
        (shortcode, blogger_id, caption, media_url, thumbnail_url, display_url,
         media_type, likes_count, comments_count, taken_at, is_video, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertMany = db.transaction((posts) => {
      for (const p of posts) {
        postStmt.run(
          p.shortcode, blogger.id, p.caption, p.media_url,
          p.thumbnail_url, p.display_url, p.media_type,
          p.likes_count, p.comments_count, p.taken_at,
          p.is_video ? 1 : 0
        );
      }
    });

    insertMany(data.posts);

    console.log(`[scraper] Done: @${username} — ${data.posts.length} posts saved`);

    res.json({
      message: "success",
      blogger,
      posts_count: data.posts.length,
    });
  } catch (err) {
    console.error("[scraper] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bloggers/refresh/:username - 手动刷新
router.post("/refresh/:username", async (req, res) => {
  req.params.username &&
    (req.body = { username: req.params.username });
  // forward to POST /
  const forwardReq = { body: { username: req.params.username } };
  const json = await new Promise((resolve) => {
    router.handle(
      { ...req, method: "POST", body: { username: req.params.username } },
      res,
      () => {}
    );
  });
});

module.exports = router;
