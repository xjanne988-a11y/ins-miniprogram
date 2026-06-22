const express = require("express");
const { getDB } = require("../db");

const router = express.Router();

// GET /api/posts/:shortcode - 帖子详情
router.get("/:shortcode", (req, res) => {
  const db = getDB();
  const post = db
    .prepare(
      `SELECT p.*, b.username, b.full_name, b.profile_pic_url as blogger_pic
       FROM posts p
       JOIN bloggers b ON b.id = p.blogger_id
       WHERE p.shortcode = ?`
    )
    .get(req.params.shortcode);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json({ post });
});

module.exports = router;
