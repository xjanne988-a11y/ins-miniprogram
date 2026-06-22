const API_BASE = "https://your-server.com/api";

function request(url, data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      data,
      success: (res) => resolve(res.data),
      fail: (err) => reject(err),
    });
  });
}

function getBloggers() {
  return request("/bloggers");
}

function getBloggerDetail(username) {
  return request("/bloggers/" + username);
}

function getPostDetail(shortcode) {
  return request("/posts/" + shortcode);
}

function addBlogger(username) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + "/bloggers",
      method: "POST",
      header: { "content-type": "application/json" },
      data: { username },
      success: (res) => resolve(res.data),
      fail: (err) => reject(err),
    });
  });
}

module.exports = { getBloggers, getBloggerDetail, getPostDetail, addBlogger };
