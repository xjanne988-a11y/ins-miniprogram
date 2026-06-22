# Ins 精选 — Instagram 博主展示微信小程序

## 项目结构

```
ins-miniprogram/
├── server/                      # 后端服务
│   ├── index.js                 # Express 主入口
│   ├── db.js                    # SQLite 数据库
│   ├── scraper.py               # Instagram 抓取脚本
│   ├── routes/
│   │   ├── bloggers.js          # 博主相关 API
│   │   └── posts.js             # 帖子相关 API
│   └── package.json
├── miniprogram/                  # 微信小程序
│   ├── app.json / app.wxss
│   ├── pages/
│   │   ├── index/               # 首页 - 博主列表
│   │   ├── blogger/             # 博主详情 - 帖子网格
│   │   └── post/                # 帖子详情
│   ├── components/              # 可复用组件
│   └── utils/api.js             # API 封装
└── README.md
```

## 快速开始

### 1. 启动后端

```bash
cd server
npm start
```

服务运行在 `http://localhost:3000`

### 2. 添加博主

```bash
# 通过 API 添加博主（会自动抓取 Instagram 数据）
curl -X POST http://localhost:3000/api/bloggers \
  -H "Content-Type: application/json" \
  -d '{"username": "instagram"}'
```

### 3. 查看数据

```bash
# 获取所有博主列表
curl http://localhost:3000/api/bloggers

# 获取博主详情 + 帖子
curl http://localhost:3000/api/bloggers/instagram
```

### 4. 微信小程序

用微信开发者工具打开 `miniprogram/` 目录，修改 `utils/api.js` 中的 `API_BASE` 为你的服务器地址。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/bloggers | 获取博主列表 |
| GET | /api/bloggers/:username | 博主详情 + 帖子 |
| POST | /api/bloggers | 添加博主（触发抓取） |
| GET | /api/posts/:shortcode | 帖子详情 |
| GET | /api/health | 健康检查 |

## 免费部署方案

### 方案一：Railway.app（推荐）

1. 注册 [Railway.app](https://railway.app)（GitHub 登录即可）
2. 将 `server/` 目录上传到 GitHub 仓库
3. 在 Railway 中 New Project → Deploy from GitHub repo
4. 启动命令设为 `npm start`
5. Railway 自动分配 HTTPS 域名，将域名填到小程序的 `API_BASE`

### 方案二：Render

1. 注册 [Render](https://render.com)
2. New Web Service → 连接 GitHub 仓库
3. Start Command: `npm start`
4. 免费额度够用

## 注意

- 首次抓取可能需要几十秒，Instagram 有访问限制
- 频繁抓取可能被限流，建议两次抓取间隔 5 分钟以上
- 小程序中图片显示可能需要后端做图片代理（小程序域名白名单限制）
- 如遇抓取失败，可以在服务器上登录 Instagram 账号提高抓取成功率
