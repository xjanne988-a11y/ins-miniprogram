require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDB } = require("./db");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
initDB();
console.log("[db] Database initialized");

// 路由
app.use("/api/bloggers", require("./routes/bloggers"));
app.use("/api/posts", require("./routes/posts"));

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 定时任务：每天凌晨3点自动更新所有博主数据（后续可扩展）
// cron.schedule("0 3 * * *", async () => {
//   console.log("[cron] Starting scheduled refresh...");
//   const db = require("./db").getDB();
//   const bloggers = db.prepare("SELECT username FROM bloggers").all();
//   for (const b of bloggers) {
//     try { execSync(...); } catch (e) { console.error(e); }
//   }
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Instagram Mini Program API running at http://localhost:${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
});
