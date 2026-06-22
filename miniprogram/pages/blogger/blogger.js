const { getBloggerDetail } = require("../../utils/api");

Page({
  data: {
    blogger: null,
    posts: [],
    loading: true,
  },

  onLoad(options) {
    const username = options.username;
    if (username) {
      this.setData({ loading: true });
      getBloggerDetail(username)
        .then((res) => {
          if (res.blogger) {
            this.setData({ blogger: res.blogger, posts: res.posts || [], loading: false });
          } else {
            wx.showToast({ title: "博主不存在", icon: "none" });
            this.setData({ loading: false });
          }
        })
        .catch(() => {
          wx.showToast({ title: "加载失败", icon: "none" });
          this.setData({ loading: false });
        });
    }
  },

  onTapPost(e) {
    const shortcode = e.currentTarget.dataset.shortcode;
    wx.navigateTo({ url: "/pages/post/post?shortcode=" + shortcode });
  },
});
